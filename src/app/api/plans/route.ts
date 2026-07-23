import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * GET /api/plans — list all active subscription plans (for clients to choose)
 * Returns the user's current subscription too (so frontend can show "current plan")
 */
export async function GET() {
  const session = await getServerSession(authOptions)

  const plans = await db.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })

  // If user is logged in, get their current active subscription
  let currentSubscription = null
  if (session?.user) {
    const userId = (session.user as { id: string }).id
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        planStatus: true,
        planRenewalDate: true,
        cpf: true,
        sitesForcedOffline: true,
      },
    })

    const sub = await db.subscription.findFirst({
      where: { userId, status: { in: ['active', 'trialing', 'past_due'] } },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    })

    currentSubscription = {
      userPlan: user?.plan || 'FREE',
      planStatus: user?.planStatus || 'active',
      planRenewalDate: user?.planRenewalDate,
      hasCpf: !!user?.cpf,
      sitesForcedOffline: user?.sitesForcedOffline || false,
      subscription: sub ? {
        id: sub.id,
        status: sub.status,
        paymentMethod: sub.paymentMethod,
        currentPeriodEnd: sub.currentPeriodEnd,
        daysPastDue: sub.daysPastDue,
        plan: {
          id: sub.plan.id,
          name: sub.plan.name,
          slug: sub.plan.slug,
          priceMonthly: sub.plan.priceMonthly,
        },
      } : null,
    }
  }

  return NextResponse.json({
    plans: plans.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      priceMonthly: p.priceMonthly,
      priceYearly: p.priceYearly,
      features: JSON.parse(p.features || '[]'),
      maxDeploys: p.maxDeploys,
      maxDatabases: p.maxDatabases,
      maxCustomDomains: p.maxCustomDomains,
      sortOrder: p.sortOrder,
    })),
    current: currentSubscription,
  })
}
