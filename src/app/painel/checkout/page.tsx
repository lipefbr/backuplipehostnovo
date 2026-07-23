'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Shield, Loader2, ArrowLeft, Check, X, Lock, CreditCard } from 'lucide-react'
import { PainelShell } from '@/components/painel/painel-shell'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center p-12"><Loader2 className="size-8 text-slate-400 animate-spin" /></div>}>
      <CheckoutContent />
    </React.Suspense>
  )
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('payment')
  const [payment, setPayment] = React.useState<{
    amount: number
    paymentMethod: string
    status: string
    plan?: { name: string } | null
  } | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [paid, setPaid] = React.useState(false)

  React.useEffect(() => {
    if (!paymentId) {
      setError('ID do pagamento não fornecido')
      setLoading(false)
      return
    }

    fetch(`/api/payments/checkout?paymentId=${paymentId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setPayment(data)
        if (data.status === 'approved') setPaid(true)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro'))
      .finally(() => setLoading(false))

    // Poll for payment status
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/status?paymentId=${paymentId}`)
        const data = await res.json()
        if (data.status === 'approved') {
          setPaid(true)
          clearInterval(interval)
        }
      } catch {}
    }, 3000)

    return () => clearInterval(interval)
  }, [paymentId])

  if (loading) {
    return (
      <PainelShell>
        <div className="max-w-2xl mx-auto p-8">
          <Loader2 className="size-8 text-slate-400 animate-spin mx-auto" />
          <p className="text-center text-sm text-slate-500 mt-3">Preparando checkout...</p>
        </div>
      </PainelShell>
    )
  }

  if (error) {
    return (
      <PainelShell>
        <div className="max-w-2xl mx-auto p-8">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <X className="size-10 text-red-500 mx-auto mb-3" />
            <p className="text-red-900 font-semibold">{error}</p>
            <Link href="/painel/planos" className="text-sm text-blue-600 hover:underline mt-3 inline-block">
              ← Voltar para planos
            </Link>
          </div>
        </div>
      </PainelShell>
    )
  }

  if (paid) {
    return (
      <PainelShell>
        <div className="max-w-2xl mx-auto p-8">
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-8 text-center">
            <div className="size-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
              <Check className="size-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900">Pagamento aprovado!</h2>
            <p className="text-emerald-700 mt-2">Sua assinatura foi ativada com sucesso.</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link href="/painel" className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Ir para o painel
              </Link>
              <Link href="/painel/planos" className="px-6 py-2.5 rounded-lg border border-emerald-300 text-emerald-700 font-semibold hover:bg-emerald-100">
                Ver planos
              </Link>
            </div>
          </div>
        </div>
      </PainelShell>
    )
  }

  return (
    <PainelShell>
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/painel/planos" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
            <ArrowLeft className="size-4" /> Voltar
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            <Lock className="size-3.5" /> Pagamento seguro
          </div>
        </div>

        {/* Plan summary */}
        {payment?.plan && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Assinatura</p>
                <p className="text-lg font-bold text-slate-900">{payment.plan.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Valor</p>
                <p className="text-lg font-bold text-slate-900">R$ {payment.amount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* PIX or Card based on payment method */}
        {payment?.paymentMethod === 'pix' ? (
          <PixPayment paymentId={paymentId!} onPaid={() => setPaid(true)} />
        ) : (
          <CardPayment paymentId={paymentId!} amount={payment?.amount || 0} onPaid={() => setPaid(true)} />
        )}

        {/* Security badges */}
        <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield className="size-4 text-emerald-600" /> SSL Criptografado
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="size-4 text-blue-600" /> Mercado Pago
          </div>
        </div>
      </div>
    </PainelShell>
  )
}

// ===== PIX payment component =====
function PixPayment({ paymentId, onPaid }: { paymentId: string; onPaid: () => void }) {
  const [qrCode, setQrCode] = React.useState<string | null>(null)
  const [qrImage, setQrImage] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    // Fetch PIX data from the payment list API
    fetch('/api/payments/list')
      .then((r) => r.json())
      .then((data) => {
        const p = data.payments?.find((x: { id: string }) => x.id === paymentId)
        if (p) {
          setQrCode(p.mpPixQrCode)
          setQrImage(p.mpPixQrCodeImage)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [paymentId])

  const copyQr = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) return <div className="py-8 text-center"><Loader2 className="size-6 text-slate-400 animate-spin mx-auto" /></div>

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
      <h3 className="text-base font-bold text-slate-900 text-center">Pague com PIX</h3>

      {qrImage && (
        <div className="text-center">
          <div className="inline-block p-4 bg-white border-2 border-slate-200 rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`data:image/png;base64,${qrImage}`} alt="QR Code PIX" className="size-48 mx-auto" />
          </div>
          <p className="text-sm text-slate-500 mt-3">Escaneie com o app do seu banco</p>
        </div>
      )}

      {qrCode && (
        <div>
          <Label className="text-xs text-slate-600 mb-1 block">Pix copia e cola:</Label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-lg bg-slate-100 border border-slate-300 text-slate-900 text-xs font-mono overflow-hidden whitespace-nowrap text-ellipsis">
              {qrCode}
            </div>
            <button
              onClick={copyQr}
              className="px-3 h-9 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold gap-1"
            >
              {copied ? <><Check className="size-3.5" /> Copiado</> : <><CreditCard className="size-3.5" /> Copiar</>}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800 text-center">
        Após o pagamento, sua assinatura será ativada automaticamente.
      </div>
    </div>
  )
}

// ===== Card payment component (transparent checkout) =====
function CardPayment({ paymentId, amount, onPaid }: { paymentId: string; amount: number; onPaid: () => void }) {
  const [card, setCard] = React.useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    docType: 'CPF',
    docNumber: '',
  })
  const [processing, setProcessing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const formatCardNumber = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
  }
  const formatCVV = (v: string) => v.replace(/\D/g, '').slice(0, 4)
  const formatDoc = (v: string) => v.replace(/\D/g, '').slice(0, 11)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    setError(null)

    try {
      const res = await fetch('/api/payments/process-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          cardNumber: card.number.replace(/\s/g, ''),
          cardName: card.name,
          cardExpiry: card.expiry,
          cardCvv: card.cvv,
          docType: card.docType,
          docNumber: card.docNumber,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (data.status === 'approved') {
        onPaid()
      } else if (data.status === 'pending') {
        setError('Pagamento em processamento. Aguarde alguns instantes...')
      } else {
        setError(data.statusDetail || 'Pagamento recusado. Verifique os dados do cartão.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
        <CreditCard className="size-5 text-blue-600" /> Dados do Cartão
      </h3>

      <div>
        <Label className="text-xs text-slate-700 mb-1.5 block">Número do cartão</Label>
        <Input
          required
          value={card.number}
          onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
          placeholder="0000 0000 0000 0000"
          className="h-10 font-mono text-slate-900"
          maxLength={19}
        />
      </div>

      <div>
        <Label className="text-xs text-slate-700 mb-1.5 block">Nome no cartão</Label>
        <Input
          required
          value={card.name}
          onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })}
          placeholder="COMO ESTÁ NO CARTÃO"
          className="h-10 text-slate-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-slate-700 mb-1.5 block">Validade</Label>
          <Input
            required
            value={card.expiry}
            onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
            placeholder="MM/AA"
            className="h-10 font-mono text-slate-900"
            maxLength={5}
          />
        </div>
        <div>
          <Label className="text-xs text-slate-700 mb-1.5 block">CVV</Label>
          <Input
            required
            value={card.cvv}
            onChange={(e) => setCard({ ...card, cvv: formatCVV(e.target.value) })}
            placeholder="000"
            className="h-10 font-mono text-slate-900"
            maxLength={4}
          />
        </div>
      </div>

      <div>
        <Label className="text-xs text-slate-700 mb-1.5 block">CPF do titular</Label>
        <Input
          required
          value={card.docNumber}
          onChange={(e) => setCard({ ...card, docNumber: formatDoc(e.target.value) })}
          placeholder="00000000000"
          className="h-10 font-mono text-slate-900"
          maxLength={11}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={processing}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
      >
        {processing ? (
          <><Loader2 className="size-4 animate-spin" /> Processando...</>
        ) : (
          <><Lock className="size-4" /> Pagar R$ {amount.toFixed(2)}</>
        )}
      </Button>

      <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
        <Lock className="size-3" /> Seus dados são enviados diretamente ao Mercado Pago com criptografia SSL.
      </p>
    </form>
  )
}
