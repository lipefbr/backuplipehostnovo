import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const CLEAN_ENV = {
  PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
  HOME: '/root',
  NODE_ENV: 'production',
}

/**
 * POST /api/chat/action — execute an action requested by the IA
 * Body: { action: 'redeploy' | 'read_logs' | 'create_ticket', deployId?, subject?, message? }
 *
 * This allows the IA to:
 * 1. Read PM2 logs for a deploy (returns last 30 lines of error log)
 * 2. Trigger a redeploy (calls executeRealDeploy)
 * 3. Create a ticket with context from the chat
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const userId = (session.user as { id: string }).id

  try {
    const body = await req.json()
    const { action } = body

    // === READ PM2 LOGS ===
    if (action === 'read_logs') {
      const deployId = body.deployId
      if (!deployId) return NextResponse.json({ error: 'deployId obrigatório' }, { status: 400 })

      // Verify deploy belongs to user
      const deploy = await db.deploy.findUnique({ where: { id: deployId } })
      if (!deploy || deploy.userId !== userId) {
        return NextResponse.json({ error: 'Deploy não encontrado' }, { status: 404 })
      }

      const pm2Name = `deploy-${deployId.substring(0, 12)}`
      try {
        // Read last 30 lines of error log
        const { stdout } = await execAsync(
          `pm2 logs ${pm2Name} --err --lines 30 --nostream 2>&1 | tail -30`,
          { env: CLEAN_ENV, timeout: 10000, maxBuffer: 1024 * 1024 }
        )
        return NextResponse.json({ success: true, logs: stdout })
      } catch (err) {
        // Try reading buildLog from DB
        if (deploy.buildLog) {
          const lines = deploy.buildLog.split('\n').slice(-30).join('\n')
          return NextResponse.json({ success: true, logs: lines })
        }
        return NextResponse.json({ success: false, error: 'Não foi possível ler os logs' })
      }
    }

    // === CREATE TICKET WITH CONTEXT ===
    if (action === 'create_ticket') {
      const subject = (body.subject || 'Suporte via Chat IA').toString()
      const message = (body.message || '').toString()
      const deployId = body.deployId || null

      // Generate ticket number
      const lastTicket = await db.ticket.findFirst({ orderBy: { ticketNumber: 'desc' }, select: { ticketNumber: true } })
      const ticketNumber = (lastTicket?.ticketNumber || 0) + 1

      const ticket = await db.ticket.create({
        data: {
          ticketNumber,
          userId,
          deployId,
          subject,
          message,
          status: 'open',
          priority: 'normal',
        },
      })

      // Create first message
      await db.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          userId,
          author: 'user',
          message,
        },
      })

      return NextResponse.json({
        success: true,
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        ticketUrl: `/painel/tickets/${ticket.id}`,
      })
    }

    // === REDEPLOY ===
    if (action === 'redeploy') {
      const deployId = body.deployId
      if (!deployId) return NextResponse.json({ error: 'deployId obrigatório' }, { status: 400 })

      const deploy = await db.deploy.findUnique({ where: { id: deployId } })
      if (!deploy || deploy.userId !== userId) {
        return NextResponse.json({ error: 'Deploy não encontrado' }, { status: 404 })
      }

      // Update status to building
      await db.deploy.update({
        where: { id: deployId },
        data: {
          status: 'building',
          buildLog: `🔄 Redeploy iniciado pelo Chat IA em ${new Date().toISOString()}\n`,
        },
      })

      // Import and execute real deploy
      const { executeRealDeploy } = await import('@/lib/deploy-executor')
      executeRealDeploy({
        deployId,
        repoUrl: deploy.repoUrl,
        branch: deploy.branch,
        installCommand: deploy.installCommand || 'npm install',
        buildCommand: deploy.buildCommand || 'npm run build',
        outputDir: deploy.outputDir || '.',
        framework: deploy.framework || 'node',
      }).catch((e) => {
        console.error('Chat IA redeploy error:', e)
      })

      return NextResponse.json({
        success: true,
        message: 'Redeploy iniciado! O site será reconstruído. Isso leva 2-5 minutos.',
        deployUrl: `/painel/projetos/${deployId}`,
      })
    }

    // === CHECK PAYMENT STATUS ===
    if (action === 'check_payment') {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { plan: true, planStatus: true, planRenewalDate: true, sitesForcedOffline: true },
      })

      const subscription = await db.subscription.findFirst({
        where: { userId, status: { in: ['active', 'past_due', 'suspended', 'trialing'] } },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      })

      const pendingPayment = await db.payment.findFirst({
        where: { userId, status: 'pending' },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({
        success: true,
        payment: {
          plan: user?.plan || 'FREE',
          planStatus: user?.planStatus || 'active',
          planRenewalDate: user?.planRenewalDate,
          sitesForcedOffline: user?.sitesForcedOffline || false,
          subscription: subscription ? {
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            daysPastDue: subscription.daysPastDue,
            plan: subscription.plan ? { name: subscription.plan.name, priceMonthly: subscription.plan.priceMonthly } : null,
          } : null,
          pendingPayment: pendingPayment ? {
            id: pendingPayment.id,
            amount: pendingPayment.amount,
            paymentMethod: pendingPayment.paymentMethod,
            qrCode: pendingPayment.mpPixQrCode,
            qrCodeImage: pendingPayment.mpPixQrCodeImage,
          } : null,
        },
      })
    }

    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 })
  } catch (error) {
    console.error('Chat action error:', error)
    return NextResponse.json({ error: 'Erro interno', details: String(error) }, { status: 500 })
  }
}
