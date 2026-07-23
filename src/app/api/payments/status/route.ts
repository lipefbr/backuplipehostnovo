import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getPaymentStatus } from '@/lib/mercadopago'

/**
 * GET /api/payments/status?paymentId=XXX — check payment status
 * Used by the frontend to poll for PIX payment confirmation.
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const userId = (session.user as { id: string }).id

  const url = new URL(req.url)
  const paymentId = url.searchParams.get('paymentId')

  if (!paymentId) {
    return NextResponse.json({ error: 'paymentId obrigatório' }, { status: 400 })
  }

  // Get payment from DB
  const payment = await db.payment.findUnique({ where: { id: paymentId } })
  if (!payment || payment.userId !== userId) {
    return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
  }

  // If payment has MP ID, check fresh status from MP
  if (payment.mpPaymentId && payment.status === 'pending') {
    const mpStatus = await getPaymentStatus(payment.mpPaymentId)
    if (mpStatus.success && mpStatus.status && mpStatus.status !== payment.status) {
      // Status changed — update DB
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: mpStatus.status,
          paidAt: mpStatus.paidAt,
        },
      })

      // If approved, activate subscription + update plan
      if (mpStatus.status === 'approved' && payment.subscriptionId) {
        // Get subscription + plan info
        const sub = await db.subscription.findUnique({
          where: { id: payment.subscriptionId },
          include: { plan: true },
        })

        await db.subscription.update({
          where: { id: payment.subscriptionId },
          data: { status: 'active', daysPastDue: 0 },
        })

        // Update user's plan from FREE to the paid plan
        if (sub?.plan) {
          await db.user.update({
            where: { id: userId },
            data: {
              plan: sub.plan.slug.toUpperCase(),
              planStatus: 'active',
              planRenewalDate: sub.currentPeriodEnd,
              sitesForcedOffline: false,
            },
          })
        } else {
          await db.user.update({
            where: { id: userId },
            data: { planStatus: 'active', sitesForcedOffline: false },
          })
        }
      }

      return NextResponse.json({
        status: mpStatus.status,
        statusDetail: mpStatus.statusDetail,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paidAt: mpStatus.paidAt,
        justChanged: true,
      })
    }
  }

  return NextResponse.json({
    status: payment.status,
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    paidAt: payment.paidAt,
    qrCode: payment.mpPixQrCode,
    qrCodeImage: payment.mpPixQrCodeImage,
    ticketUrl: payment.mpPixTicketUrl,
    dueDate: payment.dueDate,
  })
}
