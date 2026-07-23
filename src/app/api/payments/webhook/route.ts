import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { processWebhook, getPaymentStatus } from '@/lib/mercadopago'

/**
 * POST /api/payments/webhook — Mercado Pago webhook receiver
 *
 * MP sends a notification when payment status changes:
 * - POST body: { action: 'payment.updated', data: { id: 'PAYMENT_ID' } }
 * - OR query: ?topic=payment&id=PAYMENT_ID
 *
 * This endpoint is PUBLIC (no auth) — MP needs to reach it.
 * Security: we verify the payment ID by querying MP's API with our token.
 */
export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const body = await req.json().catch(() => ({}))

    // MP sends data.id + topic in query, OR action + data.id in body
    const topic = url.searchParams.get('topic') || body.topic || body.action?.replace('payment.', '') || 'payment'
    const resourceId = url.searchParams.get('id') || url.searchParams.get('data.id') || body.data?.id || body.resource

    if (!resourceId) {
      return NextResponse.json({ error: 'No resource ID provided' }, { status: 400 })
    }

    // Process the webhook (verifies with MP API)
    const result = await processWebhook(topic, String(resourceId))

    if (!result.success || !result.paymentId) {
      return NextResponse.json({ error: result.error || 'Failed to process' }, { status: 500 })
    }

    // Get full payment details from MP
    const mpStatus = await getPaymentStatus(result.paymentId)
    if (!mpStatus.success) {
      return NextResponse.json({ error: mpStatus.error }, { status: 500 })
    }

    // Find our payment by mpPaymentId
    const payment = await db.payment.findFirst({
      where: { mpPaymentId: result.paymentId },
      include: { subscription: true, user: true },
    })

    if (!payment) {
      // Payment not found — could be a test webhook or stale
      return NextResponse.json({ success: true, message: 'Payment not found (probably test)' })
    }

    // Update payment status
    const oldStatus = payment.status
    const newStatus = mpStatus.status || 'pending'

    if (oldStatus !== newStatus) {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          paidAt: mpStatus.paidAt,
        },
      })

      // If payment was approved, update subscription + activate plan
      if (newStatus === 'approved' && payment.subscriptionId) {
        // Get the plan info to update user's plan field
        const sub = await db.subscription.findUnique({
          where: { id: payment.subscriptionId },
          include: { plan: true },
        })

        await db.subscription.update({
          where: { id: payment.subscriptionId },
          data: {
            status: 'active',
            daysPastDue: 0,
            currentPeriodStart: new Date(),
            currentPeriodEnd: payment.subscription?.currentPeriodEnd,
          },
        })

        // ACTIVATE THE PLAN — update user's plan from FREE to the paid plan
        if (sub?.plan) {
          await db.user.update({
            where: { id: payment.userId },
            data: {
              plan: sub.plan.slug.toUpperCase(),
              planStatus: 'active',
              planRenewalDate: payment.subscription?.currentPeriodEnd,
              sitesForcedOffline: false, // Re-enable sites
            },
          })
        } else {
          await db.user.update({
            where: { id: payment.userId },
            data: {
              planStatus: 'active',
              sitesForcedOffline: false,
            },
          })
        }
      }

      // If payment was rejected/cancelled, mark subscription as past_due
      if (['rejected', 'cancelled'].includes(newStatus) && payment.subscriptionId) {
        await db.subscription.update({
          where: { id: payment.subscriptionId },
          data: { status: 'past_due' },
        })
      }
    }

    return NextResponse.json({ success: true, status: newStatus })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

/**
 * GET /api/payments/webhook — MP also sends GET notifications sometimes
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const topic = url.searchParams.get('topic') || 'payment'
  const id = url.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'No ID' }, { status: 400 })
  }

  // Re-use POST logic
  return POST(req)
}
