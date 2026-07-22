'use client'

import * as React from 'react'
import Link from 'next/link'
import { Store, ShoppingCart, ArrowUpRight, Search, Loader2 } from 'lucide-react'
import { PainelShell } from '@/components/painel/painel-shell'
import { Input } from '@/components/ui/input'
import { SYSTEMS, CATEGORIES } from '@/lib/content'

export default function PainelLojaPage() {
  const [search, setSearch] = React.useState('')
  const [category, setCategory] = React.useState('Todos')

  const filtered = SYSTEMS.filter((s) => {
    const matchesCat = category === 'Todos' || s.category === category
    const q = search.toLowerCase().trim()
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.shortDescription.toLowerCase().includes(q) ||
      s.technologies.some((t) => t.toLowerCase().includes(q))
    return matchesCat && matchesSearch
  })

  return (
    <PainelShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Store className="size-7 text-blue-600" />
            Loja de Sistemas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {SYSTEMS.length} sistemas prontos para implantação imediata
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar sistemas..."
            className="h-11 pl-10 bg-white border-slate-300 text-slate-900"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                category === cat
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((sys) => (
            <Link
              key={sys.slug}
              href={`/loja/${sys.slug}`}
              className="group rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className={`h-24 rounded-lg bg-gradient-to-br ${sys.screenshots[0].gradient} mb-3 flex items-center justify-center`}>
                <span className="text-white font-bold text-sm opacity-80">{sys.category}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                {sys.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{sys.shortDescription}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs font-semibold text-slate-700">
                  {sys.startingPrice || 'Sob consulta'}
                </span>
                <ArrowUpRight className="size-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Store className="size-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Nenhum sistema encontrado</p>
          </div>
        )}
      </div>
    </PainelShell>
  )
}
