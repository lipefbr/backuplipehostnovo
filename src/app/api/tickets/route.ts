import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * POST /api/tickets — create a new ticket
 * Body: { subject, message, deployId? }
 * Returns ticket with ticketNumber
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const body = await req.json()
  const subject = (body.subject || '').toString().trim()
  const message = (body.message || '').toString().trim()

  if (!subject || !message) {
    return NextResponse.json({ error: 'Assunto e mensagem são obrigatórios' }, { status: 400 })
  }

  // Generate ticket number (max + 1)
  const lastTicket = await db.ticket.findFirst({ orderBy: { ticketNumber: 'desc' }, select: { ticketNumber: true } })
  const ticketNumber = (lastTicket?.ticketNumber || 0) + 1

  // Create ticket
  const ticket = await db.ticket.create({
    data: {
      ticketNumber,
      userId,
      deployId: body.deployId || null,
      subject,
      message,
      status: 'open',
      priority: 'normal',
    },
  })

  // Create first message (the ticket body itself)
  await db.ticketMessage.create({
    data: {
      ticketId: ticket.id,
      userId,
      author: 'user',
      message,
    },
  })

  return NextResponse.json({
    ticket: {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      status: ticket.status,
      createdAt: ticket.createdAt,
    },
  })
}

/**
 * GET /api/tickets — list current user's tickets
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const tickets = await db.ticket.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { messages: true } },
    },
  })

  return NextResponse.json({
    tickets: tickets.map(t => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      subject: t.subject,
      status: t.status,
      priority: t.priority,
      createdAt: t.createdAt,
      messagesCount: t._count.messages,
    })),
  })
}
