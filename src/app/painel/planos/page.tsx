'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Crown, Check, Loader2, X, CreditCard, QrCode, Copy, AlertCircle,
  Shield, Rocket, Zap, ChevronRight,
} from 'lucide-react'
import { PainelShell } from '@/components/painel/painel-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Plan {
  id: string
  name: string
  slug: string
  description: string | null
  priceMonthly: number
  priceYearly: number | null
  features: string[]
  maxDeploys: number
  maxDatabases: number
  maxCustomDomains: number
  sortOrder: number
}

interface CurrentInfo {
  userPlan: string
  planStatus: string
  planRenewalDate: string | null
  hasCpf: boolean
  sitesForcedOffline: boolean
  subscription: {
    id: string
    status: string
    paymentMethod: string | null
    currentPeriodEnd: string | null
    daysPastDue: number
    plan: { id: string; name: string; slug: string; priceMonthly: number }
  } | null
}

export default function PainelPlanosPage() {
  const [plans, setPlans] = React.useState<Plan[]>([])
  const [current, setCurrent] = React.useState<CurrentInfo | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Subscribe modal state
  const [showSubscribe, setShowSubscribe] = React.useState<Plan | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/plans')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPlans(data.plans || [])
      setCurrent(data.current || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar planos')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  return (
    <PainelShell>
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Crown className="size-7 text-amber-600" />
            Planos de Assinatura
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Escolha o plano ideal para o seu negócio. Cancele quando quiser.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 flex items-center gap-2">
            <AlertCircle className="size-4" /> {error}
          </div>
        )}

        {/* Current plan banner */}
        {current && (
          <div className={`rounded-xl border p-5 ${
            current.sitesForcedOffline
              ? 'border-red-300 bg-red-50'
              : current.planStatus === 'active'
                ? 'border-emerald-300 bg-emerald-50'
                : 'border-amber-300 bg-amber-50'
          }`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">Seu plano atual</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-900 uppercase">{current.userPlan}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    current.planStatus === 'active' ? 'bg-emerald-200 text-emerald-800' :
                    current.planStatus === 'suspended' ? 'bg-red-200 text-red-800' :
                    current.planStatus === 'past_due' ? 'bg-amber-200 text-amber-800' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {current.planStatus === 'active' ? '✓ Ativo' :
                     current.planStatus === 'suspended' ? '🔴 Suspenso' :
                     current.planStatus === 'past_due' ? '⏰ Pagamento pendente' :
                     current.planStatus === 'canceled' ? 'Cancelado' :
                     current.planStatus === 'trialing' ? 'Em trial' : current.planStatus}
                  </span>
                </div>
                {current.subscription?.currentPeriodEnd && (
                  <p className="text-xs text-slate-600 mt-1">
                    Próxima cobrança: {new Date(current.subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                    {current.subscription.daysPastDue > 0 && (
                      <span className="text-red-700 font-semibold"> · {current.subscription.daysPastDue} dias de atraso</span>
                    )}
                  </p>
                )}
                {current.sitesForcedOffline && (
                  <p className="text-xs text-red-700 font-semibold mt-1">
                    ⚠️ Seus sites estão OFFLINE. Pague a assinatura para reativar.
                  </p>
                )}
              </div>
              {!current.hasCpf && (
                <Link href="/painel/perfil">
                  <Button variant="outline" size="sm" className="border-amber-400 text-amber-700">
                    <AlertCircle className="size-3.5" />
                    Cadastre seu CPF
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Plans grid */}
        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="size-8 text-slate-400 animate-spin mx-auto" />
          </div>
        ) : plans.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <Crown className="size-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">Nenhum plano disponível</h3>
            <p className="text-sm text-slate-500 mt-1">Volte mais tarde — estamos preparando os planos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan) => {
              const isCurrent = current?.userPlan?.toUpperCase() === plan.slug.toUpperCase()
              const isUpgrade = current && plans.findIndex((p) => p.slug.toUpperCase() === current.userPlan?.toUpperCase()) < plans.findIndex((p) => p.slug === plan.slug)
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border-2 bg-white p-6 flex flex-col ${
                    isCurrent ? 'border-emerald-500 shadow-lg' :
                    plan.slug === 'pro' ? 'border-amber-400 shadow-md' :
                    'border-slate-200'
                  }`}
                >
                  {/* Plan name + badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900 uppercase">{plan.name}</h3>
                      {plan.slug === 'pro' && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                          ⭐ Mais popular
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold ml-1">
                          ✓ Seu plano
                        </span>
                      )}
                    </div>
                    {plan.slug === 'starter' && <Rocket className="size-6 text-blue-500" />}
                    {plan.slug === 'pro' && <Crown className="size-6 text-amber-500" />}
                    {plan.slug === 'enterprise' && <Shield className="size-6 text-purple-500" />}
                  </div>

                  {plan.description && (
                    <p className="text-xs text-slate-500 mb-3">{plan.description}</p>
                  )}

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-3xl font-extrabold text-slate-900">R$ {plan.priceMonthly.toFixed(2)}</span>
                    <span className="text-sm text-slate-500">/mês</span>
                    {plan.priceYearly && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        ou R$ {plan.priceYearly.toFixed(2)}/ano
                      </p>
                    )}
                  </div>

                  {/* Limits */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-xs text-slate-500">Deploys</p>
                      <p className="text-sm font-bold text-slate-900">
                        {plan.maxDeploys >= 999 ? '∞' : plan.maxDeploys}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-xs text-slate-500">Bancos</p>
                      <p className="text-sm font-bold text-slate-900">
                        {plan.maxDatabases >= 999 ? '∞' : plan.maxDatabases}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-xs text-slate-500">Domínios</p>
                      <p className="text-sm font-bold text-slate-900">
                        {plan.maxCustomDomains >= 999 ? '∞' : plan.maxCustomDomains}
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-1.5 mb-5 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <Check className="size-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action button */}
                  {isCurrent ? (
                    <Button disabled className="w-full bg-emerald-100 text-emerald-700 border-emerald-200">
                      <Check className="size-4" /> Plano atual
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setShowSubscribe(plan)}
                      className={`w-full ${
                        plan.slug === 'pro'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isUpgrade ? (
                        <><Zap className="size-4" /> Fazer upgrade</>
                      ) : (
                        <><Crown className="size-4" /> Assinar {plan.name}</>
                      )}
                      <ChevronRight className="size-4" />
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* FAQ / info */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Perguntas frequentes</h3>
          <div className="space-y-2 text-xs text-slate-600">
            <p><strong>Como funciona a cobrança?</strong> Você escolhe PIX ou cartão. A cobrança é mensal, automática, no mesmo dia todo mês.</p>
            <p><strong>Posso cancelar?</strong> Sim, quando quiser. Após cancelar, seus sites continuam no ar até o fim do período pago.</p>
            <p><strong>E se eu não pagar?</strong> Após 3 dias de atraso, seus sites serão desativados automaticamente. Basta pagar para reativar.</p>
            <p><strong>Preciso de CPF?</strong> Sim, o CPF é necessário para emissão de cobranças pelo Mercado Pago. Cadastre no seu <Link href="/painel/perfil" className="text-blue-600 hover:underline">perfil</Link>.</p>
          </div>
        </div>

        {/* Subscribe modal */}
        {showSubscribe && (
          <SubscribeModal
            plan={showSubscribe}
            hasCpf={current?.hasCpf ?? false}
            currentCpf={null}
            onClose={() => setShowSubscribe(null)}
            onSubscribed={() => { setShowSubscribe(null); load() }}
          />
        )}
      </div>
    </PainelShell>
  )
}

function SubscribeModal({
  plan,
  hasCpf,
  currentCpf,
  onClose,
  onSubscribed,
}: {
  plan: Plan
  hasCpf: boolean
  currentCpf: string | null
  onClose: () => void
  onSubscribed: () => void
}) {
  const [paymentMethod, setPaymentMethod] = React.useState<'pix' | 'credit_card'>('pix')
  const [cpf, setCpf] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<{
    paymentId: string
    qrCode?: string
    qrCodeImage?: string
    ticketUrl?: string
    initPoint?: string
    checkoutUrl?: string
    amount: number
  } | null>(null)
  const [copied, setCopied] = React.useState(false)

  // If user already has CPF, use it
  React.useEffect(() => {
    if (hasCpf) {
      // Fetch the CPF from profile
      fetch('/api/user/profile')
        .then((r) => r.json())
        .then((data) => {
          if (data.user?.cpf) setCpf(data.user.cpf)
        })
        .catch(() => {})
    }
  }, [hasCpf])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cpf.replace(/\D/g, '')) {
      setError('CPF é obrigatório')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/payments/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, paymentMethod, cpf }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (paymentMethod === 'credit_card' && data.checkoutUrl) {
        // Redirect to embedded checkout page (inside our site)
        window.location.href = data.checkoutUrl
        return
      }

      setResult({
        paymentId: data.paymentId,
        qrCode: data.qrCode,
        qrCodeImage: data.qrCodeImage,
        ticketUrl: data.ticketUrl,
        amount: data.amount,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar')
    } finally {
      setLoading(false)
    }
  }

  const copyQrCode = () => {
    if (result?.qrCode) {
      navigator.clipboard.writeText(result.qrCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Format CPF as user types
  const formatCpfInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 11)
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white text-slate-900">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {result ? 'Pagamento gerado!' : `Assinar ${plan.name}`}
            </h2>
            {!result && (
              <p className="text-xs text-slate-500">R$ {plan.priceMonthly.toFixed(2)}/mês</p>
            )}
          </div>
          <button onClick={onClose} className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
            <X className="size-4" />
          </button>
        </div>

        {result ? (
          /* Payment result — PIX QR code */
          <div className="p-6 space-y-4">
            {result.qrCodeImage && (
              <div className="text-center">
                <div className="inline-block p-4 bg-white border-2 border-slate-200 rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`data:image/png;base64,${result.qrCodeImage}`}
                    alt="QR Code PIX"
                    className="size-48"
                  />
                </div>
                <p className="text-sm font-semibold text-slate-900 mt-3">Escaneie o QR code</p>
                <p className="text-xs text-slate-500">Abra o app do seu banco e escaneie</p>
              </div>
            )}
            {result.qrCode && (
              <div>
                <Label className="text-xs text-slate-600 mb-1 block">Pix copia e cola:</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 rounded-lg bg-slate-100 border border-slate-300 text-slate-900 text-xs font-mono overflow-hidden whitespace-nowrap text-ellipsis">
                    {result.qrCode}
                  </div>
                  <button
                    onClick={copyQrCode}
                    className="px-3 h-9 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold gap-1"
                  >
                    {copied ? <><Check className="size-3.5" /> Copiado</> : <><Copy className="size-3.5" /> Copiar</>}
                  </button>
                </div>
              </div>
            )}
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800">
              <p><strong>Valor:</strong> R$ {result.amount.toFixed(2)}</p>
              <p className="mt-1">Após o pagamento, sua assinatura será ativada automaticamente em alguns segundos.</p>
            </div>
            <Button onClick={onSubscribed} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              <Check className="size-4" /> Concluir
            </Button>
          </div>
        ) : (
          /* Subscribe form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Payment method selector */}
            <div>
              <Label className="text-xs text-slate-700 mb-2 block">Método de pagamento</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    paymentMethod === 'pix'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <QrCode className={`size-5 mb-1 ${paymentMethod === 'pix' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <p className="text-sm font-semibold text-slate-900">PIX</p>
                  <p className="text-xs text-slate-500">Aprovação imediata</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    paymentMethod === 'credit_card'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className={`size-5 mb-1 ${paymentMethod === 'credit_card' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <p className="text-sm font-semibold text-slate-900">Cartão</p>
                  <p className="text-xs text-slate-500">Crédito recorrente</p>
                </button>
              </div>
            </div>

            {/* CPF */}
            <div>
              <Label className="text-xs text-slate-700 mb-1.5 block">
                CPF {hasCpf ? '✓ cadastrado' : '(necessário para cobrança)'}
              </Label>
              <Input
                value={formatCpfInput(cpf)}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                readOnly={hasCpf}
                required
                className={`h-10 font-mono text-slate-900 ${hasCpf ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-300'}`}
              />
              {!hasCpf && (
                <p className="text-xs text-slate-400 mt-1">
                  Seu CPF será salvo no seu perfil e não poderá ser alterado.
                </p>
              )}
            </div>

            {/* Summary */}
            <div className="rounded-lg bg-slate-50 p-3 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Plano {plan.name}</span>
                <span className="font-semibold text-slate-900">R$ {plan.priceMonthly.toFixed(2)}/mês</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Cobrança mensal automática</span>
                <span>{paymentMethod === 'pix' ? 'PIX' : 'Cartão'}</span>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <><Loader2 className="size-4 animate-spin" /> Gerando pagamento...</>
              ) : paymentMethod === 'pix' ? (
                <><QrCode className="size-4" /> Gerar QR code PIX</>
              ) : (
                <><CreditCard className="size-4" /> Ir para checkout</>
              )}
            </Button>

            <p className="text-xs text-slate-400 text-center">
              Pagamento processado pelo Mercado Pago. Você pode cancelar a qualquer momento.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
