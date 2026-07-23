import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/systems/[id] — get single system
 */
export async function GET(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const system = await db.system.findUnique({
    where: { id },
    include: {
      features: { orderBy: { sortOrder: 'asc' } },
      screenshots: { orderBy: { sortOrder: 'asc' } },
      benefits: { orderBy: { sortOrder: 'asc' } },
      plans: { orderBy: { sortOrder: 'asc' } },
      faq: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!system) {
    return NextResponse.json({ error: 'Sistema não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ system })
}

/**
 * PUT /api/admin/systems/[id] — update a system
 */
export async function PUT(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()

    // Verify it exists
    const existing = await db.system.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Sistema não encontrado' }, { status: 404 })
    }

    // Check slug uniqueness if changing
    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await db.system.findUnique({ where: { slug: body.slug } })
      if (slugExists) {
        return NextResponse.json({ error: 'Slug já existe' }, { status: 409 })
      }
    }

    const updated = await db.system.update({
      where: { id },
      data: {
        slug: body.slug ?? existing.slug,
        name: body.name ?? existing.name,
        tagline: body.tagline ?? existing.tagline,
        category: body.category ?? existing.category,
        shortDescription: body.shortDescription ?? existing.shortDescription,
        longDescription: body.longDescription ?? existing.longDescription,
        technologies: body.technologies
          ? JSON.stringify(body.technologies)
          : existing.technologies,
        highlights: body.highlights
          ? JSON.stringify(body.highlights)
          : existing.highlights,
        startingPrice: body.startingPrice ?? existing.startingPrice,
        status: body.status ?? existing.status,
        featured: body.featured ?? existing.featured,
        accentColor: body.accentColor ?? existing.accentColor,
      },
    })

    return NextResponse.json({ system: updated })
  } catch (error) {
    console.error('Update system error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar sistema', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/systems/[id] — delete a system (cascades features, plans, etc.)
 */
export async function DELETE(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    const existing = await db.system.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Sistema não encontrado' }, { status: 404 })
    }

    // Delete cascades via onDelete: Cascade in Prisma schema
    await db.system.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete system error:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar sistema', details: String(error) },
      { status: 500 }
    )
  }
}
