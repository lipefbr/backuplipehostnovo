import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/admin/plans/[id] — update a plan (admin only)
 */
export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  if ((session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado — admin apenas' }, { status: 403 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const update: Record<string, unknown> = {}

    if (typeof body.name === 'string') update.name = body.name
    if (typeof body.description === 'string') update.description = body.description || null
    if (typeof body.priceMonthly === 'number') update.priceMonthly = body.priceMonthly
    if (typeof body.priceYearly === 'number') update.priceYearly = body.priceYearly
    if (Array.isArray(body.features)) update.features = JSON.stringify(body.features)
    if (typeof body.maxDeploys === 'number') update.maxDeploys = body.maxDeploys
    if (typeof body.maxDatabases === 'number') update.maxDatabases = body.maxDatabases
    if (typeof body.maxCustomDomains === 'number') update.maxCustomDomains = body.maxCustomDomains
    if (typeof body.isActive === 'boolean') update.isActive = body.isActive
    if (typeof body.sortOrder === 'number') update.sortOrder = body.sortOrder

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
    }

    const plan = await db.subscriptionPlan.update({
      where: { id },
      data: update,
    })

    return NextResponse.json({ plan })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar plano', details: String(error) }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/plans/[id] — delete a plan (admin only)
 * Will fail if there are active subscriptions to this plan.
 */
export async function DELETE(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  if ((session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado — admin apenas' }, { status: 403 })
  }

  const { id } = await params

  // Check if there are active subscriptions
  const activeSubs = await db.subscription.count({
    where: { planId: id, status: 'active' },
  })

  if (activeSubs > 0) {
    return NextResponse.json(
      { error: `Não é possível deletar: existem ${activeSubs} assinaturas ativas neste plano. Cancele ou migre antes.` },
      { status: 400 }
    )
  }

  await db.subscriptionPlan.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
