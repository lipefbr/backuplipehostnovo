import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { createMPCustomer, createPixPayment, createCardPreference, validateCPF, getNextBillingDate, TEST_CPF } from '@/lib/mercadopago'

/**
 * POST /api/payments/subscribe — subscribe to a plan
 * Body: { planId, paymentMethod: 'pix' | 'credit_card', cpf }
 *
 * Creates:
 * 1. Customer in Mercado Pago (with CPF)
 * 2. Subscription record in our DB
 * 3. First payment (PIX QR code or card checkout preference)
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const userId = (session.user as { id: string }).id

  try {
    const body = await req.json()
    const { planId, paymentMethod, cpf: rawCpf } = body

    if (!planId || !paymentMethod) {
      return NextResponse.json({ error: 'Plano e método de pagamento são obrigatórios' }, { status: 400 })
    }

    if (!['pix', 'credit_card'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Método de pagamento inválido (use pix ou credit_card)' }, { status: 400 })
    }

    // Validate CPF
    const cpf = validateCPF(rawCpf)
    if (!cpf) {
      return NextResponse.json({ error: 'CPF inválido. Digite 11 números.' }, { status: 400 })
    }

    // For testing: allow the test CPF
    const isTestCpf = cpf === TEST_CPF

    // Get user + plan
    const [user, plan] = await Promise.all([
      db.user.findUnique({ where: { id: userId } }),
      db.subscriptionPlan.findUnique({ where: { id: planId } }),
    ])

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: 'Plano não encontrado ou inativo' }, { status: 404 })
    }

    // Save CPF to user if not set
    if (!user.cpf) {
      await db.user.update({
        where: { id: userId },
        data: { cpf },
      })
    } else if (user.cpf !== cpf && !isTestCpf) {
      return NextResponse.json(
        { error: 'CPF não corresponde ao cadastrado. Contate o suporte.' },
        { status: 400 }
      )
    }

    // Check if user already has an ACTIVE (paid) subscription to this plan
    // 'trialing' (pending payment) does NOT count — user can retry
    const existingActiveSub = await db.subscription.findFirst({
      where: {
        userId,
        planId,
        status: 'active', // Only block if actually paid
      },
    })
    if (existingActiveSub) {
      return NextResponse.json({ error: 'Você já tem assinatura ativa e paga neste plano' }, { status: 400 })
    }

    // Cancel any existing trialing/pending subscriptions (user is retrying or switching)
    // This cleans up old pending payments and subscriptions
    await db.subscription.updateMany({
      where: { userId, status: { in: ['trialing', 'past_due'] } },
      data: { status: 'canceled', canceledAt: new Date() },
    })

    // Also cancel old pending payments for this user (cleanup)
    await db.payment.updateMany({
      where: { userId, status: 'pending' },
      data: { status: 'cancelled' },
    })

    // 1. Create customer in MP
    const customerResult = await createMPCustomer({
      email: user.email,
      firstName: user.name.split(' ')[0],
      lastName: user.name.split(' ').slice(1).join(' '),
      cpf,
      phone: user.phone || undefined,
    })

    if (!customerResult.success) {
      return NextResponse.json(
        { error: 'Erro ao criar cliente no Mercado Pago', details: customerResult.error },
        { status: 500 }
      )
    }

    // 2. Create subscription in our DB — status 'trialing' until payment is confirmed
    const now = new Date()
    const nextBillingDate = getNextBillingDate(now)
    // PIX expires in 5 minutes
    const pixExpiresAt = new Date(now.getTime() + 5 * 60 * 1000)

    const subscription = await db.subscription.create({
      data: {
        userId,
        planId,
        status: 'trialing', // Waiting for payment — NOT active yet
        paymentMethod,
        mpCustomerId: customerResult.customerId,
        currentPeriodStart: now,
        currentPeriodEnd: nextBillingDate,
        daysPastDue: 0,
      },
    })

    // 3. Create the first payment — status 'pending'
    const payment = await db.payment.create({
      data: {
        subscriptionId: subscription.id,
        userId,
        planId,
        amount: plan.priceMonthly,
        paymentMethod,
        status: 'pending',
        dueDate: pixExpiresAt, // 5 min to pay
        customerCpf: cpf,
        customerName: user.name,
        customerEmail: user.email,
      },
    })

    // 4. Generate payment in MP
    if (paymentMethod === 'pix') {
      const pixResult = await createPixPayment({
        amount: plan.priceMonthly,
        description: `Assinatura ${plan.name} - LipeHost`,
        customerId: customerResult.customerId,
        customerName: user.name,
        customerEmail: user.email,
        customerCpf: cpf,
        externalReference: payment.id,
        dueDate: pixExpiresAt, // 5 min expiration
      })

      if (!pixResult.success) {
        // Delete the subscription since payment failed
        await db.subscription.delete({ where: { id: subscription.id } })
        await db.payment.delete({ where: { id: payment.id } })
        return NextResponse.json(
          { error: 'Erro ao gerar PIX', details: pixResult.error },
          { status: 500 }
        )
      }

      // Update payment with MP info
      await db.payment.update({
        where: { id: payment.id },
        data: {
          mpPaymentId: pixResult.paymentId,
          mpPixQrCode: pixResult.qrCode,
          mpPixQrCodeImage: pixResult.qrCodeImage,
          mpPixTicketUrl: pixResult.ticketUrl,
        },
      })

      // DO NOT activate plan yet — only activate when payment is confirmed via webhook
      // User plan stays as-is until payment.approved

      return NextResponse.json({
        paymentId: payment.id,
        paymentMethod: 'pix',
        qrCode: pixResult.qrCode,
        qrCodeImage: pixResult.qrCodeImage,
        ticketUrl: pixResult.ticketUrl,
        amount: plan.priceMonthly,
        expiresAt: pixExpiresAt.toISOString(),
        message: 'Escaneie o QR code do PIX para pagar. Você tem 5 minutos. Após pagamento, sua assinatura será ativada automaticamente.',
      })
    } else {
      // Credit card — create checkout preference
      const baseUrl = process.env.NEXTAUTH_URL || 'https://lipe.host'
      const prefResult = await createCardPreference({
        amount: plan.priceMonthly,
        description: `Assinatura ${plan.name} - LipeHost`,
        externalReference: payment.id,
        customerId: customerResult.customerId,
        successUrl: `${baseUrl}/painel/faturas?status=approved&payment=${payment.id}`,
        failureUrl: `${baseUrl}/painel/faturas?status=failure&payment=${payment.id}`,
        pendingUrl: `${baseUrl}/painel/faturas?status=pending&payment=${payment.id}`,
      })

      if (!prefResult.success) {
        // Delete the subscription since payment failed
        await db.subscription.delete({ where: { id: subscription.id } })
        await db.payment.delete({ where: { id: payment.id } })
        return NextResponse.json(
          { error: 'Erro ao criar checkout', details: prefResult.error },
          { status: 500 }
        )
      }

      await db.payment.update({
        where: { id: payment.id },
        data: {
          mpPreferenceId: prefResult.preferenceId,
        },
      })

      // DO NOT activate plan yet — only activate when payment is confirmed via webhook
      // User will be redirected to MP checkout; on success, webhook activates the plan

      return NextResponse.json({
        paymentId: payment.id,
        paymentMethod: 'credit_card',
        preferenceId: prefResult.preferenceId,
        checkoutUrl: `/painel/checkout?payment=${payment.id}`,
        amount: plan.priceMonthly,
        dueDate: pixExpiresAt.toISOString(),
        message: 'Você será redirecionado para o checkout seguro.',
      })
    }
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json({ error: 'Erro ao processar assinatura', details: String(error) }, { status: 500 })
  }
}
