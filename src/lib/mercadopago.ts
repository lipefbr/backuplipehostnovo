/**
 * Mercado Pago integration — handles:
 * - PIX payments (one-time + recurring monthly)
 * - Credit card payments (recurring via saved card)
 * - Customer creation (with CPF)
 * - Payment status verification (webhook + manual check)
 *
 * Credentials are hardcoded for the user's test account.
 * In production, move to .env variables.
 */

const MP_ACCESS_TOKEN = 'APP_USR-7328670002668756-071814-42c1d8468bf79cd1d587f75319c35350-128397166'
const MP_PUBLIC_KEY = 'APP_USR-fd9a41be-5f1e-4aa6-8e67-713245414d7c'
const MP_CLIENT_ID = '7328670002668756'
const MP_CLIENT_SECRET = 'sdKJjtN0oJvqZupPq4VYeIFbxNdat5bz'

// Use sandbox for testing. Set to false for production.
const MP_SANDBOX = true
const MP_API_BASE = 'https://api.mercadopago.com/v1'

// CPF for testing (provided by user)
export const TEST_CPF = '59956475807'

interface MPPaymentResult {
  success: boolean
  paymentId?: string
  status?: string
  qrCode?: string
  qrCodeImage?: string
  ticketUrl?: string
  error?: string
}

interface MPCustomer {
  id: string
  email: string
  firstName: string
  lastName: string
  identification: {
    type: 'CPF'
    number: string
  }
}

/**
 * Helper: make an authenticated request to MP API
 */
async function mpFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = endpoint.startsWith('http') ? endpoint : `${MP_API_BASE}${endpoint}`
  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
}

/**
 * Validate CPF (Brazilian tax ID).
 * Format: 11 digits (XXX.XXX.XXX-XX or just numbers).
 * Returns sanitized CPF (just digits) or null if invalid.
 */
export function validateCPF(cpf: string): string | null {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return null
  // Reject obvious invalid CPFs (all same digit, etc.)
  if (/^(\d)\1{10}$/.test(cleaned)) return null
  // TODO: implement full CPF validation (check digits) — for now, just length + not-all-same
  return cleaned
}

/**
 * Format CPF for display: 599.564.758-07
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return cpf
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Create or update a customer in Mercado Pago.
 * Required for recurring payments (saves card to customer).
 */
export async function createMPCustomer(params: {
  email: string
  firstName: string
  lastName?: string
  cpf: string
  phone?: string
}): Promise<{ success: boolean; customerId?: string; error?: string }> {
  try {
    const cpf = validateCPF(params.cpf)
    if (!cpf) {
      return { success: false, error: 'CPF inválido' }
    }

    const body = {
      email: params.email,
      first_name: params.firstName,
      last_name: params.lastName || '',
      identification: {
        type: 'CPF',
        number: cpf,
      },
      ...(params.phone ? {
        phone: {
          area_code: params.phone.replace(/\D/g, '').substring(0, 2),
          number: params.phone.replace(/\D/g, '').substring(2),
        }
      } : {}),
    }

    const res = await mpFetch('/customers', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      // If customer already exists, search for them
      if (data.cause?.some((c: { code?: string }) => c.code === '400' || data.message?.includes('already exists'))) {
        const searchRes = await mpFetch(`/customers/search?email=${encodeURIComponent(params.email)}`)
        const searchData = await searchRes.json()
        if (searchData.results?.[0]?.id) {
          return { success: true, customerId: searchData.results[0].id }
        }
      }
      return { success: false, error: data.message || 'Failed to create customer' }
    }

    return { success: true, customerId: data.id }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Create a PIX payment (one-time — used for monthly billing).
 * Returns the QR code for the customer to scan and pay.
 */
export async function createPixPayment(params: {
  amount: number
  description: string
  customerId?: string
  customerName: string
  customerEmail: string
  customerCpf: string
  externalReference: string // our internal payment ID
  dueDate?: Date
}): Promise<MPPaymentResult> {
  try {
    const cpf = validateCPF(params.customerCpf)
    if (!cpf) {
      return { success: false, error: 'CPF inválido' }
    }

    const body = {
      transaction_amount: params.amount,
      description: params.description,
      payment_method_id: 'pix',
      external_reference: params.externalReference,
      payer: {
        email: params.customerEmail,
        first_name: params.customerName.split(' ')[0],
        last_name: params.customerName.split(' ').slice(1).join(' '),
        identification: {
          type: 'CPF',
          number: cpf,
        },
      },
      ...(params.dueDate ? {
        date_of_expiration: params.dueDate.toISOString(),
      } : {}),
    }

    const res = await mpFetch('/payments', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return {
        success: false,
        error: data.message || 'Failed to create PIX payment',
      }
    }

    return {
      success: true,
      paymentId: String(data.id),
      status: data.status, // 'pending' for PIX
      qrCode: data.point_of_interaction?.transaction_data?.qr_code,
      qrCodeImage: data.point_of_interaction?.transaction_data?.qr_code_base64,
      ticketUrl: data.point_of_interaction?.transaction_data?.ticket_url,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Create a checkout preference for credit card payment.
 * Returns a preference ID that the frontend uses to render MP checkout.
 */
export async function createCardPreference(params: {
  amount: number
  description: string
  externalReference: string
  customerId?: string
  successUrl: string
  failureUrl: string
  pendingUrl: string
}): Promise<{ success: boolean; preferenceId?: string; initPoint?: string; error?: string }> {
  try {
    const body = {
      items: [{
        id: params.externalReference,
        title: params.description,
        description: params.description,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: params.amount,
      }],
      payer: params.customerId ? { customer_id: params.customerId } : undefined,
      external_reference: params.externalReference,
      payment_methods: {
        excluded_payment_methods: [{ id: '' }],
        excluded_payment_types: [{ id: 'ticket' }, { id: 'atm' }],
        installments: 12,
        default_payment_method_id: 'credit_card',
      },
      back_urls: {
        success: params.successUrl,
        failure: params.failureUrl,
        pending: params.pendingUrl,
      },
      auto_return: 'approved',
      statement_descriptor: 'LIPEHOST',
    }

    const res = await mpFetch('/checkout/preferences', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return {
        success: false,
        error: data.message || 'Failed to create preference',
      }
    }

    return {
      success: true,
      preferenceId: data.id,
      initPoint: MP_SANDBOX ? data.sandbox_init_point : data.init_point,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Get payment status from Mercado Pago.
 * Used by webhook + manual verification.
 */
export async function getPaymentStatus(mpPaymentId: string): Promise<{
  success: boolean
  status?: string // 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded'
  statusDetail?: string
  amount?: number
  paymentMethod?: string
  paidAt?: Date | null
  error?: string
}> {
  try {
    const res = await mpFetch(`/payments/${mpPaymentId}`)
    const data = await res.json()

    if (!res.ok) {
      return { success: false, error: data.message || 'Failed to get payment' }
    }

    return {
      success: true,
      status: data.status,
      statusDetail: data.status_detail,
      amount: data.transaction_amount,
      paymentMethod: data.payment_method_id,
      paidAt: data.date_approved ? new Date(data.date_approved) : null,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Process webhook notification from Mercado Pago.
 * MP sends: { topic: 'payment' | 'merchant_order', resource: 'https://api.mercadopago.com/v1/payments/PAYMENT_ID' }
 */
export async function processWebhook(topic: string, resourceId: string): Promise<{
  success: boolean
  paymentId?: string
  status?: string
  error?: string
}> {
  try {
    if (topic === 'payment' || topic === 'payment_v2') {
      // Extract payment ID from resource URL or use directly
      const paymentId = resourceId.includes('/')
        ? resourceId.split('/').pop() || ''
        : resourceId

      const status = await getPaymentStatus(paymentId)
      if (!status.success) {
        return { success: false, error: status.error }
      }

      return {
        success: true,
        paymentId,
        status: status.status,
      }
    }

    return { success: false, error: `Unknown topic: ${topic}` }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Calculate the next billing date (1 month from now, same day).
 * If day is 29/30/31 and next month doesn't have it, uses last day of month.
 */
export function getNextBillingDate(from: Date = new Date()): Date {
  const next = new Date(from)
  const originalDay = next.getDate()
  next.setMonth(next.getMonth() + 1)

  // Handle months with fewer days (e.g., Jan 31 → Feb 28/29)
  if (next.getDate() !== originalDay) {
    // Set to last day of previous month
    next.setDate(0)
  }

  return next
}

/**
 * Calculate days past due (how many days late a payment is).
 */
export function getDaysPastDue(dueDate: Date | null): number {
  if (!dueDate) return 0
  const now = new Date()
  const diffMs = now.getTime() - dueDate.getTime()
  if (diffMs <= 0) return 0
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

export const MP_CONFIG = {
  ACCESS_TOKEN: MP_ACCESS_TOKEN,
  PUBLIC_KEY: MP_PUBLIC_KEY,
  CLIENT_ID: MP_CLIENT_ID,
  CLIENT_SECRET: MP_CLIENT_SECRET,
  SANDBOX: MP_SANDBOX,
}
