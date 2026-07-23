import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * GET /api/admin/users/[id] — get user full details (admin only)
 * Includes: profile, deploys, databases, payments, subscriptions, tickets
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if ((session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  const { id } = await params

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, role: true, plan: true, planStatus: true,
      cpf: true, phone: true, username: true, avatar: true,
      planRenewalDate: true, sitesForcedOffline: true, createdAt: true,
      _count: { select: { deploys: true, databases: true, tickets: true, orders: true } },
    },
  })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const [deploys, databases, payments, subscriptions, tickets] = await Promise.all([
    db.deploy.findMany({ where: { userId: id }, orderBy: { createdAt: 'desc' } }),
    db.database.findMany({ where: { userId: id }, orderBy: { createdAt: 'desc' } }),
    db.payment.findMany({ where: { userId: id }, orderBy: { createdAt: 'desc' }, take: 20, include: { plan: { select: { name: true } } } }),
    db.subscription.findMany({ where: { userId: id }, orderBy: { createdAt: 'desc' }, include: { plan: true } }),
    db.ticket.findMany({ where: { userId: id }, orderBy: { createdAt: 'desc' }, take: 20 }),
  ])

  return NextResponse.json({
    user: {
      ...user,
      deploys: deploys.map(d => ({ id: d.id, name: d.name, status: d.status, framework: d.framework, previewUrl: d.previewUrl, customDomain: d.customDomain, createdAt: d.createdAt })),
      databases: databases.map(d => ({ id: d.id, name: d.name, engine: d.engine, status: d.status, dbName: d.dbName, createdAt: d.createdAt })),
      payments: payments.map(p => ({ id: p.id, amount: p.amount, paymentMethod: p.paymentMethod, status: p.status, dueDate: p.dueDate, paidAt: p.paidAt, createdAt: p.createdAt, plan: p.plan })),
      subscriptions: subscriptions.map(s => ({ id: s.id, status: s.status, paymentMethod: s.paymentMethod, currentPeriodEnd: s.currentPeriodEnd, daysPastDue: s.daysPastDue, plan: { name: s.plan.name, slug: s.plan.slug, priceMonthly: s.plan.priceMonthly } })),
      tickets: tickets.map(t => ({ id: t.id, ticketNumber: t.ticketNumber, subject: t.subject, status: t.status, priority: t.priority, createdAt: t.createdAt })),
    },
  })
}

/**
 * PATCH /api/admin/users/[id] — update user (admin only)
 * Body: { name?, email?, role?, plan?, planStatus?, phone?, cpf?, sitesForcedOffline?, password? }
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if ((session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  const { id } = await params
  const body = await req.json()
  const update: Record<string, unknown> = {}
  if (typeof body.name === 'string') update.name = body.name
  if (typeof body.email === 'string') update.email = body.email
  if (typeof body.role === 'string') update.role = body.role
  if (typeof body.plan === 'string') update.plan = body.plan
  if (typeof body.planStatus === 'string') update.planStatus = body.planStatus
  if (typeof body.phone === 'string') update.phone = body.phone || null
  if (typeof body.cpf === 'string') update.cpf = body.cpf || null
  if (typeof body.username === 'string') update.username = body.username || null
  if (typeof body.sitesForcedOffline === 'boolean') update.sitesForcedOffline = body.sitesForcedOffline
  // Password change
  if (typeof body.password === 'string' && body.password.length >= 6) {
    const bcrypt = (await import('bcryptjs')).default
    update.passwordHash = await bcrypt.hash(body.password, 12)
  }
  const user = await db.user.update({ where: { id }, data: update, select: { id: true, name: true, email: true, role: true, plan: true, planStatus: true, phone: true, cpf: true, username: true, sitesForcedOffline: true } })
  return NextResponse.json({ user })
}

/**
 * DELETE /api/admin/users/[id] — delete user (admin only)
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if ((session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  const { id } = await params
  await db.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
