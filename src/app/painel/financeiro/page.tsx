'use client'

import * as React from 'react'
import {
  Wallet, CreditCard, Clock, CheckCircle2, XCircle, FileText,
  TrendingUp, DollarSign, Plus,
} from 'lucide-react'
import { PainelShell } from '@/components/painel/painel-shell'
import { cn } from '@/lib/utils'

const DEMO_INVOICES = [
  {
    id: 'INV-001',
    description: 'Plano Starter — Sistema Mobilidade',
    amount: 'R$ 18.000,00',
    status: 'paid',
    dueDate: '2026-07-01',
    paidAt: '2026-07-01',
  },
  {
    id: 'INV-002',
    description: 'Consultoria de Infraestrutura — Setup Docker',
    amount: 'R$ 5.000,00',
    status: 'pending',
    dueDate: '2026-07-30',
  },
]

const statusConfig = {
  paid: { label: 'Pago', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  pending: { label: 'Pendente', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  overdue: { label: 'Vencido', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  cancelled: { label: 'Cancelado', icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-100' },
}

export default function FinanceiroPage() {
  const [tab, setTab] = React.useState<'overview' | 'invoices' | 'pending'>('overview')

  const totalPaid = DEMO_INVOICES.filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + parseFloat(i.amount.replace(/[^\d,]/g, '').replace(',', '.')), 0)
  const totalPending = DEMO_INVOICES.filter((i) => i.status === 'pending')
    .reduce((sum, i) => sum + parseFloat(i.amount.replace(/[^\d,]/g, '').replace(',', '.')), 0)

  return (
    <PainelShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Wallet className="size-7 text-blue-600" />
            Financeiro
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie faturas, pagamentos e acompanhe seus gastos
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="size-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <DollarSign className="size-5 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              R$ {totalPaid.toFixed(2).replace('.', ',')}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Total pago</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="size-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Clock className="size-5 text-amber-600" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              R$ {totalPending.toFixed(2).replace('.', ',')}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Pendente</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="size-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                <TrendingUp className="size-5 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{DEMO_INVOICES.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">Faturas totais</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          {[
            { id: 'overview' as const, label: 'Visão Geral', icon: Wallet },
            { id: 'invoices' as const, label: 'Faturas', icon: FileText },
            { id: 'pending' as const, label: 'Pagamentos Pendentes', icon: Clock },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === t.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
              )}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'overview' && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-bold text-slate-900 mb-4">Resumo Financeiro</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Faturas pagas</span>
                <span className="text-sm font-bold text-emerald-600">
                  {DEMO_INVOICES.filter((i) => i.status === 'paid').length}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Faturas pendentes</span>
                <span className="text-sm font-bold text-amber-600">
                  {DEMO_INVOICES.filter((i) => i.status === 'pending').length}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Próximo vencimento</span>
                <span className="text-sm font-bold text-slate-900">30/07/2026</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-600">Método de pagamento</span>
                <span className="text-sm font-bold text-slate-900">PIX · Cartão</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'invoices' && (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-slate-200">
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3 font-medium">Fatura</th>
                  <th className="px-5 py-3 font-medium">Descrição</th>
                  <th className="px-5 py-3 font-medium">Valor</th>
                  <th className="px-5 py-3 font-medium">Vencimento</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_INVOICES.map((inv) => {
                  const cfg = statusConfig[inv.status as keyof typeof statusConfig] ?? statusConfig.pending
                  const StatusIcon = cfg.icon
                  return (
                    <tr key={inv.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-5 py-4 text-sm font-mono text-slate-700">{inv.id}</td>
                      <td className="px-5 py-4 text-sm text-slate-900">{inv.description}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">{inv.amount}</td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {new Date(inv.dueDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md', cfg.bg, cfg.color)}>
                          <StatusIcon className="size-3" />
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'pending' && (
          <div className="space-y-3">
            {DEMO_INVOICES.filter((i) => i.status === 'pending').length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
                <CheckCircle2 className="size-12 text-emerald-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900">Tudo em dia!</h3>
                <p className="text-sm text-slate-500 mt-1">Não há pagamentos pendentes.</p>
              </div>
            ) : (
              DEMO_INVOICES.filter((i) => i.status === 'pending').map((inv) => (
                <div key={inv.id} className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{inv.description}</h3>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">
                          Pendente
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Fatura {inv.id} · Vence em {new Date(inv.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-extrabold text-slate-900">{inv.amount}</div>
                      <button className="mt-2 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold">
                        <CreditCard className="size-3.5" />
                        Pagar agora
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </PainelShell>
  )
}
