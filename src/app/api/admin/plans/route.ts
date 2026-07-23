import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * GET /api/admin/plans — list all plans (admin only)
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  if ((session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado — admin apenas' }, { status: 403 })
  }

  const plans = await db.subscriptionPlan.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { subscriptions: true },
      },
    },
  })

  return NextResponse.json({
    plans: plans.map((p) => ({
      ...p,
      subscriptionsCount: p._count.subscriptions,
      _count: undefined,
    })),
  })
}

/**
 * POST /api/admin/plans — create a new plan (admin only)
 * Body: { name, slug, description?, priceMonthly, priceYearly?, features[], maxDeploys, maxDatabases, maxCustomDomains, sortOrder? }
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  if ((session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado — admin apenas' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { name, slug, description, priceMonthly, priceYearly, features, maxDeploys, maxDatabases, maxCustomDomains, sortOrder } = body

    if (!name || !slug || typeof priceMonthly !== 'number') {
      return NextResponse.json({ error: 'Nome, slug e preço mensal são obrigatórios' }, { status: 400 })
    }

    // Check slug uniqueness
    const existing = await db.subscriptionPlan.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug já em uso' }, { status: 400 })
    }

    const plan = await db.subscriptionPlan.create({
      data: {
        name,
        slug,
        description: description || null,
        priceMonthly,
        priceYearly: priceYearly || null,
        features: JSON.stringify(features || []),
        maxDeploys: maxDeploys ?? 1,
        maxDatabases: maxDatabases ?? 1,
        maxCustomDomains: maxCustomDomains ?? 0,
        sortOrder: sortOrder ?? 0,
      },
    })

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Create plan error:', error)
    return NextResponse.json({ error: 'Erro ao criar plano', details: String(error) }, { status: 500 })
  }
}
