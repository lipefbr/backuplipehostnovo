import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if ((session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  const { id } = await params
  const body = await req.json()
  const update: Record<string, unknown> = {}
  if (typeof body.response === 'string') update.response = body.response
  if (typeof body.status === 'string') update.status = body.status
  if (typeof body.priority === 'string') update.priority = body.priority
  const ticket = await db.ticket.update({ where: { id }, data: update })
  return NextResponse.json({ ticket })
}
