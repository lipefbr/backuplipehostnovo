'use client'

import * as React from 'react'
import Link from 'next/link'
import { Receipt, Loader2, RefreshCw, CreditCard } from 'lucide-react'
import { AdminShell } from '@/components/painel/admin-shell'
import { Button } from '@/components/ui/button'

export default function AdminFaturasPage() {
  return (
    <AdminShell>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Receipt className="size-7 text-amber-600" />
            Faturas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie faturas e pagamentos de assinaturas
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-center">
          <CreditCard className="size-10 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Pagamentos e Assinaturas</h3>
          <p className="text-sm text-slate-600 mt-1 mb-4">
            A gestão completa de pagamentos foi movida para a página de Pagamentos.
            Lá você pode ver todos os pagamentos aprovados, pendentes, assinaturas ativas
            e suspender/reativar sites de clientes.
          </p>
          <Link href="/admin/pagamentos">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              <CreditCard className="size-4" /> Ir para Pagamentos
            </Button>
          </Link>
        </div>
      </div>
    </AdminShell>
  )
}
