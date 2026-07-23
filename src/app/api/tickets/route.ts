import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * GET /api/tickets — list tickets for the logged-in user (or all if admin)
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const userId = (session.user as { id: string }).id
  const role = (session.user as { role?: string }).role

  const where = role === 'ADMIN' ? {} : { userId }
  const tickets = await db.ticket.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      deploy: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  })

  return NextResponse.json({ tickets })
}

/**
 * POST /api/tickets — create a new support ticket
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const userId = (session.user as { id: string }).id

  try {
    const body = await req.json()
    const { subject, message, deployId, priority } = body

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Assunto e mensagem são obrigatórios' },
        { status: 400 }
      )
    }

    // Validate deployId belongs to user (if provided)
    if (deployId) {
      const deploy = await db.deploy.findUnique({ where: { id: deployId } })
      if (!deploy || deploy.userId !== userId) {
        return NextResponse.json(
          { error: 'Deploy não encontrado ou não pertence a você' },
          { status: 403 }
        )
      }
    }

    const ticket = await db.ticket.create({
      data: {
        userId,
        deployId: deployId || null,
        subject: subject.trim(),
        message: message.trim(),
        priority: priority || 'normal',
        status: 'open',
      },
      include: {
        deploy: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error) {
    console.error('Create ticket error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar ticket', details: String(error) },
      { status: 500 }
    )
  }
}
