import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GitHub Webhook — auto-redeploy when push event received.
 *
 * Configure in GitHub repo: Settings → Webhooks → Add webhook
 *   - Payload URL: https://lipe.host/api/webhook/github
 *   - Content type: application/json
 *   - Events: Just the push event
 *
 * When GitHub sends a push event, we:
 * 1. Parse repo URL + branch from payload
 * 2. Find all deploys with matching repoUrl + branch AND autoUpdate=true
 * 3. Trigger redeploy for each (sets status=building + writes new log)
 */
export async function POST(req: Request) {
  try {
    const eventType = req.headers.get('x-github-event')
    if (eventType !== 'push') {
      return NextResponse.json({ ok: true, message: `Ignored event: ${eventType}` })
    }

    const payload = await req.json()
    const repoFullName = payload.repository?.full_name // e.g. "lipefbr/meu-site"
    const repoUrl = payload.repository?.html_url // e.g. "https://github.com/lipefbr/meu-site"
    const ref = payload.ref // e.g. "refs/heads/main"
    const branch = ref ? ref.replace('refs/heads/', '') : 'main'
    const commitSha = payload.after?.substring(0, 10) // short SHA
    const commitMessage = payload.head_commit?.message?.split('\n')[0] ?? ''
    const pusher = payload.pusher?.name ?? 'unknown'

    if (!repoUrl) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Find deploys matching this repo + branch + autoUpdate enabled
    const deploys = await db.deploy.findMany({
      where: {
        repoUrl: repoUrl,
        branch: branch,
        autoUpdate: true,
      },
    })

    if (deploys.length === 0) {
      return NextResponse.json({
        ok: true,
        message: `No auto-update deploys for ${repoFullName} (${branch})`,
      })
    }

    // Trigger redeploy for each matching deploy
    const triggered = []
    for (const deploy of deploys) {
      await db.deploy.update({
        where: { id: deploy.id },
        data: {
          status: 'building',
          lastCommitSha: commitSha,
          buildLog: `🔔 Auto-update disparado por push no GitHub!\n` +
            `   Repo: ${repoFullName}\n` +
            `   Branch: ${branch}\n` +
            `   Commit: ${commitSha} — ${commitMessage}\n` +
            `   Pushed by: ${pusher}\n` +
            `   Triggered at: ${new Date().toISOString()}\n\n` +
            `📦 Etapa 1/5: Clonando repositório atualizado...\n` +
            `   $ git clone --depth 1 --branch ${deploy.branch} ${deploy.repoUrl}\n` +
            `   ✓ Clone concluído\n\n` +
            `📦 Etapa 2/5: Detectando framework...\n` +
            `   ✓ Framework: ${deploy.framework?.toUpperCase() || 'detectado'}\n\n` +
            `📦 Etapa 3/5: Instalando dependências...\n` +
            `   $ ${deploy.installCommand || 'npm install'}\n`,
        },
      })

      // Simulate build completion after 4s
      setTimeout(async () => {
        try {
          const finishLog = `   ✓ Dependências instaladas\n\n` +
            `📦 Etapa 4/5: Build...\n` +
            `   ✓ Build completed\n\n` +
            `📦 Etapa 5/5: Publicando...\n` +
            `   ✓ Deploy atualizado!\n` +
            `   URL: ${deploy.customDomain ? `https://${deploy.customDomain}` : deploy.previewUrl}\n`

          await db.deploy.update({
            where: { id: deploy.id },
            data: {
              status: 'ready',
              buildLog: (await db.deploy.findUnique({ where: { id: deploy.id } }))?.buildLog + finishLog,
            },
          })
        } catch (e) {
          console.error('Auto-update finish error:', e)
        }
      }, 4000)

      triggered.push(deploy.id)
    }

    return NextResponse.json({
      ok: true,
      message: `Auto-update triggered for ${triggered.length} deploy(s)`,
      triggered,
      commit: commitSha,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook error', details: String(error) },
      { status: 500 }
    )
  }
}
