'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Boxes, Users, ShoppingCart, TrendingUp, DollarSign,
  FolderKanban, Plus, ArrowUpRight, Activity,
} from 'lucide-react'
import { AdminShell } from '@/components/painel/admin-shell'

export default function AdminPage() {
  return (
    <AdminShell>
      <AdminContent />
    </AdminShell>
  )
}

function AdminContent() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Dashboard administrativo
          </h1>
          <p className="text-sm text-slate-900/55 mt-1">
            Visão geral da plataforma LipeHost.
          </p>
        </div>
        <Link
          href="/admin/sistemas"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all"
        >
          <Plus className="size-4" />
          Adicionar sistema
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStat
          title="Sistemas no catálogo"
          value={0}
          icon={Boxes}
          trend="up"
          trendValue="13 seed"
          color="amber"
        />
        <AdminStat
          title="Usuários cadastrados"
          value={1}
          icon={Users}
          color="blue"
        />
        <AdminStat
          title="Projetos em andamento"
          value={0}
          icon={FolderKanban}
          color="purple"
        />
        <AdminStat
          title="Pedidos (total)"
          value={0}
          icon={ShoppingCart}
          color="emerald"
        />
      </div>

      {/* Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Receita (últimos 30 dias)</h3>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">R$ 0,00</div>
            </div>
            <div className="size-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <DollarSign className="size-5 text-emerald-400" />
            </div>
          </div>
          {/* Mock chart */}
          <div className="h-32 flex items-end gap-1.5">
            {[40, 55, 35, 70, 60, 80, 50, 65, 75, 90, 45, 60, 75, 55].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-amber-500/60 to-amber-500/20 rounded-t"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Atividade recente</h3>
          <div className="py-8 text-center">
            <Activity className="size-8 text-slate-900/20 mx-auto mb-2" />
            <p className="text-sm text-slate-900/40">Sem atividade ainda</p>
            <p className="text-xs text-slate-900/30 mt-1">
              Vendas, cadastros e alterações aparecerão aqui.
            </p>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <QuickLink
          href="/admin/sistemas"
          icon={Boxes}
          title="Gerenciar Sistemas"
          desc="Adicionar, editar, remover sistemas do catálogo"
          color="amber"
        />
        <QuickLink
          href="/admin/usuarios"
          icon={Users}
          title="Gerenciar Usuários"
          desc="Ver, bloquear e gerenciar contas de clientes"
          color="blue"
        />
        <QuickLink
          href="/admin/projetos"
          icon={FolderKanban}
          title="Gerenciar Projetos"
          desc="Acompanhar projetos em desenvolvimento"
          color="purple"
        />
      </div>
    </div>
  )
}

function AdminStat({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'amber',
}: {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: 'amber' | 'blue' | 'purple' | 'emerald'
}) {
  const colorClasses = {
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 hover:border-white/15 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={`size-10 rounded-lg border flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="size-5" />
        </div>
        {trend === 'up' && trendValue && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
            <TrendingUp className="size-3" />
            {trendValue}
          </span>
        )}
      </div>
      <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>
      <div className="text-xs text-slate-900/50 mt-0.5">{title}</div>
    </div>
  )
}

function QuickLink({
  href,
  icon: Icon,
  title,
  desc,
  color = 'amber',
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
  color?: 'amber' | 'blue' | 'purple'
}) {
  const colorClasses = {
    amber: 'group-hover:border-amber-500/30 group-hover:bg-amber-500/5',
    blue: 'group-hover:border-blue-500/30 group-hover:bg-blue-500/5',
    purple: 'group-hover:border-purple-500/30 group-hover:bg-purple-500/5',
  }
  const iconClasses = {
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400 group-hover:text-amber-300',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400 group-hover:text-blue-300',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400 group-hover:text-purple-300',
  }
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 p-4 rounded-lg border border-slate-200 bg-white/[0.02] transition-all ${colorClasses[color]}`}
    >
      <div className={`size-10 rounded-lg border flex items-center justify-center transition-colors ${iconClasses[color]}`}>
        <Icon className="size-5" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="text-xs text-slate-900/50">{desc}</div>
      </div>
      <ArrowUpRight className="size-4 text-slate-900/40 group-hover:text-slate-900 transition-colors" />
    </Link>
  )
}
