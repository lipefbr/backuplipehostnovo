import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { createCardPreference } from '@/lib/mercadopago'

/**
 * GET /api/payments/checkout?paymentId=XXX
 * Returns the checkout URL (init_point) for an embedded card payment.
 * Used by /painel/checkout page to show MP checkout in an iframe.
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

  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: {
      plan: { select: { name: true, slug: true } },
      user: { select: { name: true, email: true } },
    },
  })

  if (!payment || payment.userId !== userId) {
    return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
  }

  // If payment already has a preference ID, just return it
  if (payment.mpPreferenceId) {
    // Re-create preference to get fresh init_point (MP URLs expire)
    const baseUrl = process.env.NEXTAUTH_URL || 'https://lipe.host'
    const prefResult = await createCardPreference({
      amount: payment.amount,
      description: `Assinatura ${payment.plan?.name || 'LipeHost'} - LipeHost`,
      externalReference: payment.id,
      successUrl: `${baseUrl}/painel/checkout?payment=${payment.id}`,
      failureUrl: `${baseUrl}/painel/checkout?payment=${payment.id}`,
      pendingUrl: `${baseUrl}/painel/checkout?payment=${payment.id}`,
    })

    if (prefResult.success) {
      // Update payment with new preference ID
      await db.payment.update({
        where: { id: payment.id },
        data: { mpPreferenceId: prefResult.preferenceId },
      })

      return NextResponse.json({
        success: true,
        paymentId: payment.id,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        initPoint: prefResult.initPoint,
        plan: payment.plan,
      })
    }
  }

  // Create a new preference
  const baseUrl = process.env.NEXTAUTH_URL || 'https://lipe.host'
  const prefResult = await createCardPreference({
    amount: payment.amount,
    description: `Assinatura ${payment.plan?.name || 'LipeHost'} - LipeHost`,
    externalReference: payment.id,
    successUrl: `${baseUrl}/painel/checkout?payment=${payment.id}`,
    failureUrl: `${baseUrl}/painel/checkout?payment=${payment.id}`,
    pendingUrl: `${baseUrl}/painel/checkout?payment=${payment.id}`,
  })

  if (!prefResult.success) {
    return NextResponse.json({ error: prefResult.error }, { status: 500 })
  }

  await db.payment.update({
    where: { id: payment.id },
    data: { mpPreferenceId: prefResult.preferenceId },
  })

  return NextResponse.json({
    success: true,
    paymentId: payment.id,
    amount: payment.amount,
    status: payment.status,
    paymentMethod: payment.paymentMethod,
    initPoint: prefResult.initPoint,
    plan: payment.plan,
  })
}
