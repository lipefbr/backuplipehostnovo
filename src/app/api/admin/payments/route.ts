import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * GET /api/admin/payments — list all payments + active subscriptions (admin only)
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  if ((session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado — admin apenas' }, { status: 403 })
  }

  const [payments, subscriptions] = await Promise.all([
    db.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        plan: { select: { name: true } },
        user: { select: { name: true, email: true, plan: true, planStatus: true, sitesForcedOffline: true } },
      },
    }),
    db.subscription.findMany({
      where: { status: { in: ['active', 'past_due', 'suspended', 'trialing'] } },
      include: {
        user: { select: { id: true, name: true, email: true, plan: true, planStatus: true, sitesForcedOffline: true } },
        plan: { select: { name: true, priceMonthly: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return NextResponse.json({
    payments: payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      status: p.status,
      customerName: p.customerName,
      customerEmail: p.customerEmail,
      customerCpf: p.customerCpf,
      mpPaymentId: p.mpPaymentId,
      dueDate: p.dueDate,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
      plan: p.plan,
      user: p.user,
    })),
    subscriptions: subscriptions.map((s) => ({
      id: s.id,
      status: s.status,
      paymentMethod: s.paymentMethod,
      currentPeriodEnd: s.currentPeriodEnd,
      daysPastDue: s.daysPastDue,
      user: s.user,
      plan: s.plan,
    })),
  })
}
