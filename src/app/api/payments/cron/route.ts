import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createPixPayment, getDaysPastDue, getNextBillingDate } from '@/lib/mercadopago'
import { executeRealDeploy } from '@/lib/deploy-executor'

/**
 * GET /api/payments/cron — daily cron job for billing
 *
 * This endpoint should be called once a day (e.g., via system cron or external service).
 * It does 3 things:
 *
 * 1. CHARGE: For subscriptions where currentPeriodEnd has passed, create a new payment
 *    (PIX QR code) and update the period.
 *
 * 2. SUSPEND: For subscriptions past due by 3+ days, suspend the user's sites
 *    (set sitesForcedOffline = true + stop all deploys via PM2).
 *
 * 3. REACTIVATE: For subscriptions that got paid after being suspended,
 *    reactivate the user's sites.
 *
 * Security: protected by a secret token in the URL query (?token=XXX).
 * Set CRON_SECRET in .env to match.
 */
export async function GET(req: Request) {
  // Verify secret token
  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  const expectedToken = process.env.CRON_SECRET || 'lipehost-cron-secret-2026'

  if (token !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const results = {
    charged: 0,
    suspended: 0,
    reactivated: 0,
    errors: [] as string[],
  }

  try {
    // === 1. CHARGE: Find subscriptions that need a new billing cycle ===
    const dueSubs = await db.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: { lt: now },
      },
      include: { user: true, plan: true },
    })

    for (const sub of dueSubs) {
      try {
        // Check if there's already a pending payment for this period
        const existingPayment = await db.payment.findFirst({
          where: {
            subscriptionId: sub.id,
            status: 'pending',
            createdAt: { gt: sub.currentPeriodStart || new Date(0) },
          },
        })

        if (existingPayment) {
          // Already has a pending payment for this period — skip
          continue
        }

        // Create new payment (PIX for monthly recurring)
        const nextBillingDate = getNextBillingDate(now)
        const payment = await db.payment.create({
          data: {
            subscriptionId: sub.id,
            userId: sub.userId,
            planId: sub.planId,
            amount: sub.plan.priceMonthly,
            paymentMethod: 'pix',
            status: 'pending',
            dueDate: nextBillingDate,
            customerCpf: sub.user.cpf,
            customerName: sub.user.name,
            customerEmail: sub.user.email,
          },
        })

        // Generate PIX in MP (if user has CPF)
        if (sub.user.cpf) {
          const pixResult = await createPixPayment({
            amount: sub.plan.priceMonthly,
            description: `Assinatura ${sub.plan.name} - LipeHost (renovação)`,
            customerId: sub.mpCustomerId || undefined,
            customerName: sub.user.name,
            customerEmail: sub.user.email,
            customerCpf: sub.user.cpf,
            externalReference: payment.id,
            dueDate: nextBillingDate,
          })

          if (pixResult.success) {
            await db.payment.update({
              where: { id: payment.id },
              data: {
                mpPaymentId: pixResult.paymentId,
                mpPixQrCode: pixResult.qrCode,
                mpPixQrCodeImage: pixResult.qrCodeImage,
                mpPixTicketUrl: pixResult.ticketUrl,
              },
            })
          }
        }

        // Update subscription period
        await db.subscription.update({
          where: { id: sub.id },
          data: {
            currentPeriodStart: now,
            currentPeriodEnd: nextBillingDate,
          },
        })

        results.charged++
      } catch (err) {
        results.errors.push(`Charge ${sub.id}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    // === 2. SUSPEND: Find subscriptions past due by 3+ days ===
    const pastDueSubs = await db.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: { lt: now },
      },
      include: { user: { include: { deploys: true } } },
    })

    for (const sub of pastDueSubs) {
      try {
        const daysPastDue = getDaysPastDue(sub.currentPeriodEnd)

        // Update daysPastDue
        if (sub.daysPastDue !== daysPastDue) {
          await db.subscription.update({
            where: { id: sub.id },
            data: { daysPastDue },
          })
        }

        // Suspend if 3+ days past due AND not already suspended
        if (daysPastDue >= 3 && !sub.user.sitesForcedOffline) {
          // Mark user as suspended
          await db.user.update({
            where: { id: sub.userId },
            data: {
              sitesForcedOffline: true,
              planStatus: 'suspended',
            },
          })

          // Update subscription status
          await db.subscription.update({
            where: { id: sub.id },
            data: { status: 'suspended' },
          })

          // Stop all user's deploys via PM2
          for (const deploy of sub.user.deploys) {
            try {
              const { exec } = await import('child_process')
              const { promisify } = await import('util')
              const execAsync = promisify(exec)
              const pm2Name = `deploy-${deploy.id.substring(0, 12)}`
              await execAsync(`pm2 stop ${pm2Name} 2>&1 || true`, {
                env: { PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin' },
              })
            } catch (e) {
              // Ignore — best effort
            }
          }

          results.suspended++
        }
      } catch (err) {
        results.errors.push(`Suspend ${sub.id}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    // === 3. REACTIVATE: Find users with sitesForcedOffline that have paid ===
    const suspendedUsers = await db.user.findMany({
      where: { sitesForcedOffline: true },
      include: {
        subscriptions: {
          where: { status: 'active' },
          take: 1,
        },
        deploys: true,
      },
    })

    for (const user of suspendedUsers) {
      try {
        // Check if user has any active subscription with currentPeriodEnd in the future
        const activeSub = user.subscriptions[0]
        if (activeSub && activeSub.currentPeriodEnd && activeSub.currentPeriodEnd > now) {
          // Reactivate
          await db.user.update({
            where: { id: user.id },
            data: {
              sitesForcedOffline: false,
              planStatus: 'active',
            },
          })

          // Restart all user's deploys
          for (const deploy of user.deploys) {
            try {
              const { exec } = await import('child_process')
              const { promisify } = await import('util')
              const execAsync = promisify(exec)
              const pm2Name = `deploy-${deploy.id.substring(0, 12)}`
              await execAsync(`pm2 restart ${pm2Name} 2>&1 || pm2 start /var/www/lipehost/deploys/${deploy.id}/start.sh --name ${pm2Name} 2>&1 || true`, {
                env: { PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin' },
              })
            } catch (e) {
              // Ignore — best effort
            }
          }

          results.reactivated++
        }
      } catch (err) {
        results.errors.push(`Reactivate ${user.id}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  } catch (error) {
    results.errors.push(`General: ${error instanceof Error ? error.message : String(error)}`)
  }

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    ...results,
  })
}
