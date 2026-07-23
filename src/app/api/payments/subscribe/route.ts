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

    // Check if user already has active subscription to this plan
    const existingSub = await db.subscription.findFirst({
      where: {
        userId,
        planId,
        status: { in: ['active', 'trialing'] },
      },
    })
    if (existingSub) {
      return NextResponse.json({ error: 'Você já tem assinatura ativa neste plano' }, { status: 400 })
    }

    // Cancel any existing active subscription (user is switching plans)
    await db.subscription.updateMany({
      where: { userId, status: { in: ['active', 'trialing'] } },
      data: { status: 'canceled', canceledAt: new Date() },
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

    // 2. Create subscription in our DB
    const now = new Date()
    const nextBillingDate = getNextBillingDate(now)

    const subscription = await db.subscription.create({
      data: {
        userId,
        planId,
        status: 'active',
        paymentMethod,
        mpCustomerId: customerResult.customerId,
        currentPeriodStart: now,
        currentPeriodEnd: nextBillingDate,
        daysPastDue: 0,
      },
    })

    // 3. Create the first payment
    const payment = await db.payment.create({
      data: {
        subscriptionId: subscription.id,
        userId,
        planId,
        amount: plan.priceMonthly,
        paymentMethod,
        status: 'pending',
        dueDate: nextBillingDate,
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
        dueDate: nextBillingDate,
      })

      if (!pixResult.success) {
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

      // Update user plan immediately (will be suspended if not paid in 3 days via cron)
      await db.user.update({
        where: { id: userId },
        data: {
          plan: plan.slug.toUpperCase(),
          planStatus: 'active',
          planRenewalDate: nextBillingDate,
        },
      })

      return NextResponse.json({
        paymentId: payment.id,
        paymentMethod: 'pix',
        qrCode: pixResult.qrCode,
        qrCodeImage: pixResult.qrCodeImage,
        ticketUrl: pixResult.ticketUrl,
        amount: plan.priceMonthly,
        dueDate: nextBillingDate,
        message: 'Escaneie o QR code do PIX para pagar. Após confirmação, sua assinatura estará ativa.',
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

      // Update user plan
      await db.user.update({
        where: { id: userId },
        data: {
          plan: plan.slug.toUpperCase(),
          planStatus: 'active',
          planRenewalDate: nextBillingDate,
        },
      })

      return NextResponse.json({
        paymentId: payment.id,
        paymentMethod: 'credit_card',
        preferenceId: prefResult.preferenceId,
        initPoint: prefResult.initPoint,
        amount: plan.priceMonthly,
        dueDate: nextBillingDate,
        message: 'Você será redirecionado para o checkout do Mercado Pago.',
      })
    }
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json({ error: 'Erro ao processar assinatura', details: String(error) }, { status: 500 })
  }
}
