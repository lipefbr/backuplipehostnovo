import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * GET /api/payments/list — list current user's payments
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const userId = (session.user as { id: string }).id

  const payments = await db.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      plan: { select: { name: true } },
    },
  })

  return NextResponse.json({
    payments: payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      status: p.status,
      dueDate: p.dueDate,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
      mpPixQrCode: p.mpPixQrCode,
      mpPixQrCodeImage: p.mpPixQrCodeImage,
      plan: p.plan,
    })),
  })
}
