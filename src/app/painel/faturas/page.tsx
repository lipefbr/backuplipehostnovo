'use client'

import { CreditCard } from 'lucide-react'
import { PainelShell } from '@/components/painel/painel-shell'

export default function PainelFaturasPage() {
  return (
    <PainelShell>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Faturas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Histórico de pagamentos e faturas
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="size-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Sem faturas ainda</h3>
          <p className="text-sm text-slate-500">
            Quando você adquirir um sistema ou contratar um serviço, as faturas aparecerão aqui.
          </p>
        </div>
      </div>
    </PainelShell>
  )
}
