import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * POST /api/admin/users/[id]/toggle-sites — force user's sites offline/online
 * Body: { forceOffline: boolean }
 *
 * When forceOffline = true:
 *   - Sets user.sitesForcedOffline = true
 *   - Stops all user's deploys via PM2
 *
 * When forceOffline = false:
 *   - Sets user.sitesForcedOffline = false
 *   - Restarts all user's deploys via PM2
 */
export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  if ((session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado — admin apenas' }, { status: 403 })
  }

  const { id: userId } = await params

  try {
    const body = await req.json()
    const forceOffline = !!body.forceOffline

    // Update user
    await db.user.update({
      where: { id: userId },
      data: {
        sitesForcedOffline: forceOffline,
        planStatus: forceOffline ? 'suspended' : 'active',
      },
    })

    // Get user's deploys
    const deploys = await db.deploy.findMany({ where: { userId } })

    // Stop or restart each deploy via PM2
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)
    const CLEAN_ENV = { PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin' }

    for (const deploy of deploys) {
      const pm2Name = `deploy-${deploy.id.substring(0, 12)}`
      try {
        if (forceOffline) {
          // Stop the deploy
          await execAsync(`pm2 stop ${pm2Name} 2>&1 || true`, { env: CLEAN_ENV, timeout: 15000 })
        } else {
          // Restart the deploy
          await execAsync(
            `pm2 restart ${pm2Name} 2>&1 || pm2 start /var/www/lipehost/deploys/${deploy.id}/start.sh --name ${pm2Name} 2>&1 || true`,
            { env: CLEAN_ENV, timeout: 30000 }
          )
        }
      } catch (e) {
        // Best effort — ignore errors
      }
    }

    return NextResponse.json({
      success: true,
      forceOffline,
      deploysAffected: deploys.length,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao alternar sites', details: String(error) }, { status: 500 })
  }
}
