'use client'

import * as React from 'react'
import Link from 'next/link'
import { FolderKanban, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import { AdminShell } from '@/components/painel/admin-shell'
import { Button } from '@/components/ui/button'

interface DeployItem {
  id: string
  name: string
  status: string
  framework: string | null
  repoUrl: string
  previewUrl: string | null
  customDomain: string | null
  createdAt: string
  user: { name: string; email: string }
}

export default function AdminProjetosPage() {
  const [deploys, setDeploys] = React.useState<DeployItem[]>([])
  const [loading, setLoading] = React.useState(true)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/deploys')
      const data = await res.json()
      if (res.ok) setDeploys(data.deploys || [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  React.useEffect(() => { load() }, [load])

  return (
    <AdminShell>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <FolderKanban className="size-7 text-amber-600" />
              Todos os Projetos
            </h1>
            <p className="text-sm text-slate-500 mt-1">{deploys.length} deploys no total</p>
          </div>
          <Button variant="ghost" size="sm" onClick={load} className="text-slate-600">
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center"><Loader2 className="size-8 text-slate-400 animate-spin mx-auto" /></div>
        ) : deploys.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <FolderKanban className="size-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Nenhum deploy</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Projeto</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Cliente</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">URL</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {deploys.map((d) => (
                    <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{d.name}</td>
                      <td className="px-4 py-3">
                        <p className="text-slate-900">{d.user.name}</p>
                        <p className="text-xs text-slate-500">{d.user.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          d.status === 'ready' ? 'bg-emerald-100 text-emerald-700' :
                          d.status === 'building' ? 'bg-amber-100 text-amber-700' :
                          d.status === 'error' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>{d.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        {d.previewUrl && (
                          <a href={d.previewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                            <ExternalLink className="size-3" /> {d.previewUrl.replace('https://', '')}
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{new Date(d.createdAt).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
