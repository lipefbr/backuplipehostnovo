'use client'

import Link from 'next/link'
import { ShoppingCart, ArrowUpRight, Search } from 'lucide-react'
import { PainelShell } from '@/components/painel/painel-shell'
import { Input } from '@/components/ui/input'

export default function PainelSistemasPage() {
  return (
    <PainelShell>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Sistemas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sistemas prontos que você adquiriu ou pode adquirir
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="size-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Você ainda não adquiriu nenhum sistema</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Explore nossa loja com mais de 12 sistemas prontos para implantação imediata.
          </p>
          <Link
            href="/loja"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold hover:shadow-lg"
          >
            Explorar Loja
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </PainelShell>
  )
}
