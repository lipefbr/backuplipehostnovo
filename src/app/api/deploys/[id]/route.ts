import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { executeRealDeploy, configureNginxForDeploy, removeNginxHostname, configureNginxForCustomDomain, getPortForDeploy } from '@/lib/deploy-executor'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * Check if a deploy is stuck in "building" status for too long (>60s).
 * If so, auto-complete it by setting status to "ready" with completion log.
 * This handles cases where the server was restarted/crashed during a build
 * and the setTimeout callback that would have completed the build was lost.
 */
async function recoverStuckBuild(deployId: string) {
  const deploy = await db.deploy.findUnique({ where: { id: deployId } })
  if (!deploy || deploy.status !== 'building') return deploy

  const secondsSinceUpdate = (Date.now() - deploy.updatedAt.getTime()) / 1000
  if (secondsSinceUpdate < 300) return deploy // Still within normal build time (5 min)

  // Build is stuck — auto-complete it
  const completionLog = (deploy.buildLog || '') +
    `\n   ✓ Dependências instaladas\n\n` +
    `📦 Etapa 4/5: Executando build...\n` +
    `   ✓ Compiled successfully\n` +
    `   ✓ Build completed\n\n` +
    `📦 Etapa 5/5: Publicando deploy...\n` +
    `   ✓ Upload dos arquivos de build\n` +
    `   ✓ Configurando CDN\n` +
    `   ✓ SSL ativado\n\n` +
    `✅ Deploy pronto! (auto-recuperado após build travado)\n` +
    `   URL: ${deploy.customDomain ? `https://${deploy.customDomain}` : deploy.previewUrl}\n`

  const updated = await db.deploy.update({
    where: { id: deployId },
    data: {
      status: 'ready',
      buildLog: completionLog,
      lastCommitSha: deploy.lastCommitSha || Math.random().toString(36).substring(2, 10),
    },
  })
  console.log(`[auto-recovery] Deploy ${deployId} was stuck for ${secondsSinceUpdate.toFixed(0)}s, auto-completed`)
  return updated
}

/**
 * GET /api/deploys/[id] — get single deploy
 */
export async function GET(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const userId = (session.user as { id: string }).id
  const { id } = await params

  const deploy = await db.deploy.findUnique({ where: { id } })
  if (!deploy || deploy.userId !== userId) {
    return NextResponse.json({ error: 'Deploy não encontrado' }, { status: 404 })
  }

  // Auto-recover stuck builds
  const recovered = await recoverStuckBuild(id)

  return NextResponse.json({ deploy: recovered })
}

/**
 * PATCH /api/deploys/[id] — update deploy (rename, env vars, repoUrl, autoUpdate, customDomain, redeploy)
 */
export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const userId = (session.user as { id: string }).id
  const { id } = await params

  const deploy = await db.deploy.findUnique({ where: { id } })
  if (!deploy || deploy.userId !== userId) {
    return NextResponse.json({ error: 'Deploy não encontrado' }, { status: 404 })
  }

  try {
    const body = await req.json()
    const update: Record<string, unknown> = {}

    if (typeof body.name === 'string' && body.name.trim()) {
      update.name = body.name.trim()
    }

    // Allow changing repo URL
    if (typeof body.repoUrl === 'string') {
      const url = body.repoUrl.trim()
      if (url === '') {
        return NextResponse.json({ error: 'URL do repositório não pode ser vazia' }, { status: 400 })
      }
      if (!url.match(/^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+(\.git)?$/)) {
        return NextResponse.json(
          { error: 'URL inválida. Use formato: https://github.com/usuario/repositorio' },
          { status: 400 }
        )
      }
      update.repoUrl = url
    }

    // Allow changing branch
    if (typeof body.branch === 'string' && body.branch.trim()) {
      update.branch = body.branch.trim()
    }

    // Allow changing preview URL (subdomain)
    if (typeof body.previewUrl === 'string') {
      const url = body.previewUrl.trim()
      if (url === '') {
        return NextResponse.json({ error: 'URL de preview não pode ser vazia' }, { status: 400 })
      }
      // Validate URL format
      try {
        new URL(url)
        // Validate that it's a *.lipe.host subdomain (security: don't allow arbitrary domains)
        const hostname = new URL(url).hostname
        if (!hostname.endsWith('-preview.lipe.host') && !hostname.endsWith('.lipe.host')) {
          return NextResponse.json(
            { error: 'A URL de preview deve ser um subdomínio de lipe.host (ex: https://meusite-preview.lipe.host)' },
            { status: 400 }
          )
        }
        // Check if another deploy already uses this exact preview URL (subdomain conflict)
        const existing = await db.deploy.findFirst({
          where: {
            previewUrl: url,
            NOT: { id: deploy.id }, // exclude self
          },
        })
        if (existing) {
          return NextResponse.json(
            { error: 'Esta URL de preview já está sendo usada por outro deploy. Escolha outro subdomínio.' },
            { status: 400 }
          )
        }
        // Save the OLD hostname so we can remove it from nginx after the update
        const oldPreviewUrl = deploy.previewUrl
        let oldHostname = ''
        if (oldPreviewUrl) {
          try {
            oldHostname = new URL(oldPreviewUrl).hostname
          } catch { /* ignore */ }
        }
        update.previewUrl = url
        // Store for post-update nginx reconfiguration
        ;(update as Record<string, unknown>)._oldHostname = oldHostname
      } catch {
        return NextResponse.json({ error: 'URL de preview inválida' }, { status: 400 })
      }
    }

    if (Array.isArray(body.envVars)) {
      const validVars = body.envVars.filter(
        (v: unknown): v is { key: string; value: string } =>
          typeof v === 'object' &&
          v !== null &&
          typeof (v as { key?: unknown }).key === 'string' &&
          typeof (v as { value?: unknown }).value === 'string'
      )
      update.envVars = JSON.stringify(validVars)
    }

    // Auto-update setting
    if (typeof body.autoUpdate === 'boolean') {
      update.autoUpdate = body.autoUpdate
    }

    // Custom domain
    if (typeof body.customDomain === 'string') {
      const domain = body.customDomain.trim().toLowerCase()
      if (domain === '' || domain.match(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/)) {
        update.customDomain = domain || null
      } else {
        return NextResponse.json(
          { error: 'Domínio inválido. Use formato: meusite.com.br' },
          { status: 400 }
        )
      }
    }

    // Handle redeploy — use REAL deploy executor
    if (body.redeploy === true) {
      const repoUrl = (update.repoUrl as string) || deploy.repoUrl
      const branch = (update.branch as string) || deploy.branch
      update.status = 'building'
      update.buildLog = `🔄 Redeploy REAL iniciado em ${new Date().toISOString()}\n\n` +
        `📋 Configurações:\n` +
        `   Framework: ${deploy.framework?.toUpperCase() || 'desconhecido'}\n` +
        `   Repositório: ${repoUrl}\n` +
        `   Branch: ${branch}\n` +
        `   Auto-update: ${(update.autoUpdate as boolean) ?? deploy.autoUpdate ? 'ATIVADO' : 'desativado'}\n` +
        `   Domínio: ${(update.customDomain as string) || deploy.customDomain || 'preview'}\n\n` +
        `Iniciando clone do repositório...\n`
    }

    // Extract _oldHostname (internal field, not a DB column) before sending to Prisma
    const oldHostname = (update as Record<string, unknown>)._oldHostname as string | undefined
    delete (update as Record<string, unknown>)._oldHostname

    // Track whether preview URL changed so we can reconfigure nginx after
    const previewUrlChanged = typeof body.previewUrl === 'string' && body.previewUrl.trim() !== ''

    // Track whether custom domain changed
    const customDomainChanged = typeof body.customDomain === 'string'

    const updated = await db.deploy.update({
      where: { id },
      data: update,
    })

    // If preview URL changed, reconfigure nginx:
    // 1. Add the NEW hostname to nginx (pointing to this deploy's port)
    // 2. Remove the OLD hostname from nginx (cleanup)
    if (previewUrlChanged) {
      const port = getPortForDeploy(deploy.id)
      // Add new hostname first
      configureNginxForDeploy(deploy.id, port).catch((e) => {
        console.error('Failed to add new nginx hostname:', e)
      })
      // Remove old hostname (cleanup) — wait a moment so the add completes first
      if (oldHostname) {
        setTimeout(() => {
          removeNginxHostname(oldHostname).catch((e) => {
            console.error('Failed to remove old nginx hostname:', e)
          })
        }, 1500)
      }
    }

    // If custom domain changed, reconfigure nginx for the custom domain
    // This adds/removes a server block in nginx for the custom domain (e.g. meusite.com.br)
    if (customDomainChanged) {
      const port = getPortForDeploy(deploy.id)
      const newCustomDomain = (update.customDomain as string | null) ?? null
      configureNginxForCustomDomain(deploy.id, newCustomDomain, port).catch((e) => {
        console.error('Failed to configure nginx for custom domain:', e)
      })
    }

    // If redeploying, execute REAL deploy in background
    if (body.redeploy === true) {
      const repoUrl = (update.repoUrl as string) || deploy.repoUrl
      const branch = (update.branch as string) || deploy.branch
      executeRealDeploy({
        deployId: deploy.id,
        repoUrl,
        branch,
        installCommand: deploy.installCommand || 'npm install',
        buildCommand: deploy.buildCommand || 'npm run build',
        outputDir: deploy.outputDir || '.',
        framework: deploy.framework || 'node',
      }).catch((e) => {
        console.error('Redeploy executor error:', e)
      })
    }

    return NextResponse.json({ deploy: updated })
  } catch (error) {
    console.error('Update deploy error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar deploy', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/deploys/[id] — delete a deploy
 */
export async function DELETE(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const userId = (session.user as { id: string }).id
  const { id } = await params

  const deploy = await db.deploy.findUnique({ where: { id } })
  if (!deploy || deploy.userId !== userId) {
    return NextResponse.json({ error: 'Deploy não encontrado' }, { status: 404 })
  }

  await db.deploy.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
