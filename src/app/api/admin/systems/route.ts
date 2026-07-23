import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * GET /api/admin/systems — list all systems (admin only)
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const systems = await db.system.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { features: true, plans: true, faq: true, orders: true },
      },
    },
  })

  return NextResponse.json({ systems })
}

/**
 * POST /api/admin/systems — create a new system
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Validate required fields
    if (!body.name || !body.slug || !body.category || !body.shortDescription) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: name, slug, category, shortDescription' },
        { status: 400 }
      )
    }

    // Check slug uniqueness
    const existing = await db.system.findUnique({ where: { slug: body.slug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug já existe' }, { status: 409 })
    }

    const system = await db.system.create({
      data: {
        slug: body.slug,
        name: body.name,
        tagline: body.tagline || '',
        category: body.category,
        shortDescription: body.shortDescription,
        longDescription: body.longDescription || body.shortDescription,
        technologies: JSON.stringify(body.technologies || []),
        highlights: JSON.stringify(body.highlights || []),
        startingPrice: body.startingPrice || null,
        status: body.status || 'disponivel',
        featured: body.featured || false,
        accentColor: body.accentColor || '#3b82f6',
        // Optional related records
        features: body.features
          ? { create: body.features.map((f: { title: string; description: string }, i: number) => ({
              title: f.title, description: f.description, sortOrder: i,
            })) }
          : undefined,
        benefits: body.benefits
          ? { create: body.benefits.map((b: string, i: number) => ({
              text: b, sortOrder: i,
            })) }
          : undefined,
        plans: body.plans
          ? { create: body.plans.map((p: {
              name: string; price: string; period?: string;
              description: string; features: string[]; highlighted?: boolean
            }, i: number) => ({
              name: p.name, price: p.price, period: p.period ?? null,
              description: p.description, features: JSON.stringify(p.features),
              highlighted: p.highlighted ?? false, sortOrder: i,
            })) }
          : undefined,
        faq: body.faq
          ? { create: body.faq.map((f: { q: string; a: string }, i: number) => ({
              question: f.q, answer: f.a, sortOrder: i,
            })) }
          : undefined,
        screenshots: body.screenshots
          ? { create: body.screenshots.map((s: { label: string; gradient: string }, i: number) => ({
              label: s.label, gradient: s.gradient, sortOrder: i,
            })) }
          : undefined,
      },
    })

    return NextResponse.json({ system }, { status: 201 })
  } catch (error) {
    console.error('Create system error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar sistema', details: String(error) },
      { status: 500 }
    )
  }
}
