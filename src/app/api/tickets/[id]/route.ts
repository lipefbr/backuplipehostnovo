import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

interface Params { params: Promise<{ id: string }> }

/**
 * GET /api/tickets/[id] — get ticket with all messages
 */
export async function GET(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const userId = (session.user as { id: string }).id
  const role = (session.user as { role?: string }).role
  const { id } = await params

  const ticket = await db.ticket.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
      user: { select: { name: true, email: true } },
      deploy: { select: { name: true, id: true } },
    },
  })

  if (!ticket) return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 })

  // User can only see their own tickets; admin can see all
  if (role !== 'ADMIN' && ticket.userId !== userId) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  // Mark messages as read
  if (role === 'ADMIN') {
    await db.ticketMessage.updateMany({
      where: { ticketId: id, author: 'user', isRead: false },
      data: { isRead: true },
    })
  } else {
    await db.ticketMessage.updateMany({
      where: { ticketId: id, author: { in: ['admin', 'ai'] }, isRead: false },
      data: { isRead: true },
    })
  }

  return NextResponse.json({ ticket })
}

/**
 * POST /api/tickets/[id]/messages — add message to ticket
 * Body: { message: string }
 * Both user and admin can post messages
 */
export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const userId = (session.user as { id: string }).id
  const role = (session.user as { role?: string }).role
  const { id } = await params

  const ticket = await db.ticket.findUnique({ where: { id } })
  if (!ticket) return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 })

  // User can only post to their own tickets
  if (role !== 'ADMIN' && ticket.userId !== userId) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const body = await req.json()
  const message = (body.message || '').toString().trim()
  if (!message) return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 })

  // Determine author
  const author = role === 'ADMIN' ? 'admin' : 'user'

  const msg = await db.ticketMessage.create({
    data: {
      ticketId: id,
      userId: ticket.userId,
      author,
      message,
    },
  })

  // Update ticket status
  if (ticket.status === 'open' && role === 'ADMIN') {
    await db.ticket.update({ where: { id }, data: { status: 'in_progress' } })
  }
  if (ticket.status === 'resolved' && author === 'user') {
    await db.ticket.update({ where: { id }, data: { status: 'in_progress' } })
  }

  return NextResponse.json({ message: msg })
}
