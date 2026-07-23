import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/tickets/[id] — update ticket (admin responds, or user closes)
 */
export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const userId = (session.user as { id: string }).id
  const role = (session.user as { role?: string }).role
  const { id } = await params

  const ticket = await db.ticket.findUnique({ where: { id } })
  if (!ticket) {
    return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 })
  }

  // Only owner or admin can update
  if (ticket.userId !== userId && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const update: Record<string, unknown> = {}

    if (typeof body.status === 'string') {
      update.status = body.status
    }
    // Only admin can respond
    if (typeof body.response === 'string' && role === 'ADMIN') {
      update.response = body.response
      update.status = 'resolved'
    }

    const updated = await db.ticket.update({
      where: { id },
      data: update,
    })

    return NextResponse.json({ ticket: updated })
  } catch (error) {
    console.error('Update ticket error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar ticket', details: String(error) },
      { status: 500 }
    )
  }
}
