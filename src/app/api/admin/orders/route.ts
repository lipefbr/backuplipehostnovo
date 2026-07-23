import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if ((session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const orders = await db.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  })

  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      planName: o.planName,
      price: o.price,
      status: o.status,
      createdAt: o.createdAt,
      user: o.user,
    })),
  })
}
