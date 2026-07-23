import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

interface Params { params: Promise<{ id: string }> }

/**
 * GET /api/admin/users/[id] — get user details (admin only)
 */
export async function GET(req: Request, { params }: Params) {
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
  return NextResponse.json({ user })
}

/**
 * PATCH /api/admin/users/[id] — update user (admin only)
 * Body: { name?, email?, role?, plan?, planStatus?, phone?, cpf?, sitesForcedOffline? }
 */
export async function PATCH(req: Request, { params }: Params) {
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
  if (typeof body.sitesForcedOffline === 'boolean') update.sitesForcedOffline = body.sitesForcedOffline
  const user = await db.user.update({ where: { id }, data: update, select: { id: true, name: true, email: true, role: true, plan: true, planStatus: true, phone: true, cpf: true, sitesForcedOffline: true } })
  return NextResponse.json({ user })
}

/**
 * DELETE /api/admin/users/[id] — delete user (admin only)
 */
export async function DELETE(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if ((session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  const { id } = await params
  await db.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
