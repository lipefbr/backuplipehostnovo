'use client'

import * as React from 'react'
import {
  CreditCard, Loader2, Check, X, Clock, RefreshCw, Crown, AlertCircle,
} from 'lucide-react'
import { AdminShell } from '@/components/painel/admin-shell'
import { Button } from '@/components/ui/button'

interface Payment {
  id: string
  amount: number
  paymentMethod: string
  status: string
  customerName: string
  customerEmail: string
  customerCpf: string | null
  mpPaymentId: string | null
  dueDate: string | null
  paidAt: string | null
  createdAt: string
  plan?: { name: string } | null
  user?: { name: string; email: string; plan: string; planStatus: string; sitesForcedOffline: boolean } | null
}

interface Subscription {
  id: string
  status: string
  paymentMethod: string | null
  currentPeriodEnd: string | null
  daysPastDue: number
  user: { id: string; name: string; email: string; plan: string; planStatus: string; sitesForcedOffline: boolean }
  plan: { name: string; priceMonthly: number }
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = React.useState<Payment[]>([])
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState<'all' | 'approved' | 'pending' | 'rejected'>('all')

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      // We'll use the admin API to get payments + subscriptions
      // For now, let's fetch via a single endpoint
      const res = await fetch('/api/admin/payments')
      const data = await res.json()
      if (res.ok) {
        setPayments(data.payments || [])
        setSubscriptions(data.subscriptions || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const filteredPayments = payments.filter((p) => filter === 'all' || p.status === filter)

  const totalApproved = payments.filter((p) => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0)
  const totalPending = payments.filter((p) => p.status === 'pending').length
  const totalSuspended = subscriptions.filter((s) => s.user.sitesForcedOffline).length

  return (
    <AdminShell>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <CreditCard className="size-7 text-amber-600" />
            Pagamentos & Assinaturas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitore pagamentos aprovados, pendentes e assinaturas ativas
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Check className="size-4" />
              <span className="text-xs font-semibold">Receita aprovada</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">R$ {totalApproved.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <Clock className="size-4" />
              <span className="text-xs font-semibold">Pagamentos pendentes</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalPending}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Crown className="size-4" />
              <span className="text-xs font-semibold">Assinaturas ativas</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {subscriptions.filter((s) => s.status === 'active').length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <AlertCircle className="size-4" />
              <span className="text-xs font-semibold">Sites suspensos</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalSuspended}</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'approved', 'pending', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                filter === f
                  ? 'bg-amber-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'approved' ? 'Aprovados' : f === 'pending' ? 'Pendentes' : 'Rejeitados'}
              <span className="ml-1 text-xs opacity-70">
                ({f === 'all' ? payments.length : payments.filter((p) => p.status === f).length})
              </span>
            </button>
          ))}
          <Button variant="ghost" size="sm" onClick={load} className="ml-auto text-slate-600">
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Payments list */}
        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="size-8 text-slate-400 animate-spin mx-auto" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <CreditCard className="size-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-900">Nenhum pagamento</p>
            <p className="text-xs text-slate-500 mt-1">Os pagamentos aparecerão aqui quando clientes assinarem planos</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Cliente</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">CPF</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Plano</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Valor</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Método</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{p.customerName}</p>
                        <p className="text-xs text-slate-500">{p.customerEmail}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.customerCpf || '—'}</td>
                      <td className="px-4 py-3 text-slate-700">{p.plan?.name || '—'}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-900">R$ {p.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {p.paymentMethod === 'pix' ? 'PIX' : p.paymentMethod === 'credit_card' ? 'Cartão' : p.paymentMethod}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {p.paidAt
                          ? `Pago em ${new Date(p.paidAt).toLocaleDateString('pt-BR')}`
                          : p.dueDate
                            ? `Vence ${new Date(p.dueDate).toLocaleDateString('pt-BR')}`
                            : new Date(p.createdAt).toLocaleDateString('pt-BR')
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Active subscriptions */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-3">Assinaturas ativas</h2>
          {subscriptions.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
              <Crown className="size-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Nenhuma assinatura ainda</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900">{sub.user.name}</h3>
                      <span className="text-xs text-slate-500">{sub.user.email}</span>
                      <StatusBadge status={sub.status} />
                      {sub.user.sitesForcedOffline && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          🔴 Sites offline
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Plano: <strong>{sub.plan.name}</strong> · R$ {sub.plan.priceMonthly.toFixed(2)}/mês ·
                      {' '}Vencimento: {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString('pt-BR') : '—'}
                      {sub.daysPastDue > 0 && (
                        <span className="text-red-600 font-semibold"> · {sub.daysPastDue} dias de atraso</span>
                      )}
                    </p>
                  </div>
                  <SubscriptionActions userId={sub.user.id} sitesForcedOffline={sub.user.sitesForcedOffline} onUpdated={load} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    approved: { label: 'Aprovado', color: 'bg-emerald-100 text-emerald-700' },
    pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-700' },
    rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-700' },
    cancelled: { label: 'Cancelado', color: 'bg-slate-100 text-slate-600' },
    refunded: { label: 'Reembolsado', color: 'bg-purple-100 text-purple-700' },
    active: { label: 'Ativa', color: 'bg-emerald-100 text-emerald-700' },
    past_due: { label: 'Atrasada', color: 'bg-amber-100 text-amber-700' },
    suspended: { label: 'Suspensa', color: 'bg-red-100 text-red-700' },
    canceled: { label: 'Cancelada', color: 'bg-slate-100 text-slate-600' },
    trialing: { label: 'Trial', color: 'bg-blue-100 text-blue-700' },
  }
  const c = config[status] || { label: status, color: 'bg-slate-100 text-slate-600' }
  return <span className={`text-xs px-2 py-0.5 rounded-full ${c.color}`}>{c.label}</span>
}

function SubscriptionActions({ userId, sitesForcedOffline, onUpdated }: { userId: string; sitesForcedOffline: boolean; onUpdated: () => void }) {
  const [loading, setLoading] = React.useState(false)

  const toggleSites = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-sites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceOffline: !sitesForcedOffline }),
      })
      if (!res.ok) throw new Error('Erro ao alternar')
      onUpdated()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={toggleSites}
      disabled={loading}
      size="sm"
      variant="outline"
      className={sitesForcedOffline ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' : 'border-red-300 text-red-700 hover:bg-red-50'}
    >
      {loading ? <Loader2 className="size-3.5 animate-spin" /> : sitesForcedOffline ? <Check className="size-3.5" /> : <X className="size-3.5" />}
      {sitesForcedOffline ? 'Reativar sites' : 'Desativar sites'}
    </Button>
  )
}
