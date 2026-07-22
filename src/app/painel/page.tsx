'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  FolderKanban, ShoppingCart, CreditCard, LifeBuoy,
  Server, Cpu, Activity, Clock, CheckCircle2,
  ArrowUpRight, Wallet, Plus, Rocket, Database, Store,
} from 'lucide-react'
import { PainelShell, StatCard } from '@/components/painel/painel-shell'

interface Deploy {
  id: string
  name: string
  status: string
  previewUrl: string | null
  framework: string | null
  createdAt: string
}

export default function PainelPage() {
  return (
    <PainelShell>
      <PainelContent />
    </PainelShell>
  )
}

function PainelContent() {
  const { data: session } = useSession()
  const userName = session?.user?.name?.split(' ')[0] ?? 'Usuário'
  const [deploys, setDeploys] = React.useState<Deploy[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/deploys')
      .then(r => r.json())
      .then(data => {
        if (data.deploys) setDeploys(data.deploys)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const activeProjects = deploys.filter(d => d.status === 'ready' || d.status === 'building').length
  const buildingProjects = deploys.filter(d => d.status === 'building').length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Olá, {userName} 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Bem-vindo de volta. Aqui está o resumo da sua conta.
        </p>
      </div>

      {/* Stats with real data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Projetos ativos" value={activeProjects} icon={FolderKanban} trend="neutral" trendValue={buildingProjects > 0 ? `${buildingProjects} buildando` : '—'} color="blue" />
        <StatCard title="Total de deploys" value={deploys.length} icon={Rocket} trend="neutral" trendValue="—" color="purple" />
        <StatCard title="Faturas pagas" value={0} icon={CreditCard} trend="neutral" trendValue="—" color="emerald" />
        <StatCard title="Tickets de suporte" value={0} icon={LifeBuoy} trend="neutral" trendValue="—" color="amber" />
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Ações rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link href="/painel/projetos" className="group flex items-center gap-3 p-4 rounded-lg border border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50 transition-all">
            <div className="size-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
              <Plus className="size-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-900">Novo Deploy</div>
              <div className="text-xs text-slate-500">Conectar repo do GitHub</div>
            </div>
            <ArrowUpRight className="size-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </Link>
          <Link href="/painel/loja" className="group flex items-center gap-3 p-4 rounded-lg border border-slate-200 bg-slate-50 hover:border-purple-300 hover:bg-purple-50 transition-all">
            <div className="size-10 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center">
              <Store className="size-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-900">Explorar Loja</div>
              <div className="text-xs text-slate-500">Ver sistemas prontos</div>
            </div>
            <ArrowUpRight className="size-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
          </Link>
          <Link href="/painel/bancos" className="group flex items-center gap-3 p-4 rounded-lg border border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50 transition-all">
            <div className="size-10 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center">
              <Database className="size-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-900">Banco de Dados</div>
              <div className="text-xs text-slate-500">Criar PostgreSQL/Redis</div>
            </div>
            <ArrowUpRight className="size-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </Link>
        </div>
      </div>

      {/* Two columns: recent projects + server status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent projects */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Projetos recentes</h3>
            <Link href="/painel/projetos" className="text-xs text-blue-600 hover:text-blue-700 transition-colors">
              Ver todos
            </Link>
          </div>
          {loading ? (
            <div className="py-8 text-center">
              <div className="size-6 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin mx-auto" />
            </div>
          ) : deploys.length === 0 ? (
            <div className="py-8 text-center">
              <FolderKanban className="size-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Nenhum projeto ainda</p>
              <Link href="/painel/projetos" className="inline-flex items-center gap-1.5 mt-3 text-xs text-blue-600 hover:text-blue-700 transition-colors">
                <Plus className="size-3" />
                Criar primeiro deploy
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {deploys.slice(0, 5).map((deploy) => (
                <Link
                  key={deploy.id}
                  href={`/painel/projetos/${deploy.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className={`size-2 rounded-full flex-shrink-0 ${
                    deploy.status === 'ready' ? 'bg-emerald-500' :
                    deploy.status === 'building' ? 'bg-blue-500 animate-pulse' :
                    deploy.status === 'error' ? 'bg-red-500' : 'bg-slate-300'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{deploy.name}</div>
                    <div className="text-xs text-slate-400">
                      {deploy.framework?.toUpperCase() || '—'} · {new Date(deploy.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 capitalize">{deploy.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Server / system status */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Status dos serviços</h3>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operacional
            </span>
          </div>
          <div className="space-y-3">
            <StatusRow icon={Server} label="Servidores cloud" status="operacional" />
            <StatusRow icon={Cpu} label="API & Backend" status="operacional" />
            <StatusRow icon={Activity} label="Monitoramento 24/7" status="operacional" />
            <StatusRow icon={Wallet} label="Gateway de pagamento" status="operacional" />
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Atividade recente</h3>
        {deploys.length > 0 ? (
          <div className="space-y-2">
            {deploys.slice(0, 3).map((deploy) => (
              <div key={deploy.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                <div className={`size-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  deploy.status === 'ready' ? 'bg-emerald-50' :
                  deploy.status === 'building' ? 'bg-blue-50' : 'bg-slate-50'
                }`}>
                  {deploy.status === 'ready' ? <CheckCircle2 className="size-4 text-emerald-500" /> :
                   deploy.status === 'building' ? <Clock className="size-4 text-blue-500" /> :
                   <Rocket className="size-4 text-slate-400" />}
                </div>
                <div className="flex-1">
                  <span className="text-sm text-slate-700">
                    Deploy <strong>{deploy.name}</strong> — {deploy.status === 'ready' ? 'publicado' : deploy.status === 'building' ? 'em andamento' : deploy.status}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(deploy.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Clock className="size-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Sem atividade ainda</p>
            <p className="text-xs text-slate-300 mt-1">
              Suas ações (deploys, projetos, tickets) aparecerão aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusRow({
  icon: Icon,
  label,
  status,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  status: 'operacional' | 'degradado' | 'offline'
}) {
  const statusConfig = {
    operacional: { label: 'Operacional', color: 'text-emerald-600', dot: 'bg-emerald-500' },
    degradado: { label: 'Degradado', color: 'text-amber-600', dot: 'bg-amber-500' },
    offline: { label: 'Offline', color: 'text-red-600', dot: 'bg-red-500' },
  }
  const cfg = statusConfig[status]
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
          <Icon className="size-4 text-slate-500" />
        </div>
        <span className="text-sm text-slate-700">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`size-1.5 rounded-full ${cfg.dot}`} />
        <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
      </div>
    </div>
  )
}
