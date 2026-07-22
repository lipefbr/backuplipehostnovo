'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Github, Loader2, Trash2, ExternalLink,
  CheckCircle2, XCircle, Clock, GitBranch, Rocket, ChevronRight,
} from 'lucide-react'
import { PainelShell } from '@/components/painel/painel-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface Deploy {
  id: string
  name: string
  repoUrl: string
  branch: string
  framework: string | null
  status: string
  previewUrl: string | null
  createdAt: string
}

export default function PainelProjetosPage() {
  const router = useRouter()
  const [deploys, setDeploys] = React.useState<Deploy[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [showForm, setShowForm] = React.useState(false)
  const [form, setForm] = React.useState({
    name: '',
    repoUrl: '',
  })
  const [saving, setSaving] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const fetchDeploys = async () => {
    try {
      const res = await fetch('/api/deploys')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDeploys(data.deploys)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchDeploys()
    const interval = setInterval(fetchDeploys, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/deploys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, repoUrl: form.repoUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Close modal and navigate to the project detail page
      setShowForm(false)
      setForm({ name: '', repoUrl: '' })
      router.push(`/painel/projetos/${data.deploy.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setSaving(true)
    try {
      await fetch(`/api/deploys/${deleteId}`, { method: 'DELETE' })
      setDeleteId(null)
      await fetchDeploys()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setSaving(false)
    }
  }

  const fillSampleRepo = () => {
    setForm({
      name: 'Abelha Token Push',
      repoUrl: 'https://github.com/lipefbr/abelha-token-push',
    })
  }

  const statusConfig = {
    queued: { label: 'Na fila', icon: Clock, color: 'text-slate-600', bg: 'bg-slate-100' },
    building: { label: 'Buildando...', icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-50' },
    ready: { label: 'Pronto', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    error: { label: 'Erro', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  }

  return (
    <PainelShell>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Meus Projetos
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Faça deploy automático a partir de repositórios GitHub
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white font-semibold hover:shadow-lg"
          >
            <Plus className="size-4" />
            Novo Deploy
          </Button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-blue-500" />
          </div>
        ) : deploys.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Rocket className="size-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum deploy ainda</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              Conecte seu repositório do GitHub. Detectamos o framework automaticamente
              (Next.js, Vite, React, etc.) e fazemos o deploy pra você.
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white font-semibold"
            >
              <Plus className="size-4" />
              Criar primeiro deploy
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {deploys.map((deploy) => {
              const status = statusConfig[deploy.status as keyof typeof statusConfig] ?? statusConfig.queued
              const StatusIcon = status.icon
              const ownerRepo = deploy.repoUrl.replace(/\.git$/, '').replace('https://github.com/', '')

              return (
                <button
                  key={deploy.id}
                  onClick={() => router.push(`/painel/projetos/${deploy.id}`)}
                  className="text-left w-full rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="size-10 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0">
                        <Github className="size-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {deploy.name}
                          </h3>
                          <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md', status.bg, status.color)}>
                            <StatusIcon className={cn('size-3', deploy.status === 'building' && 'animate-spin')} />
                            {status.label}
                          </span>
                          {deploy.framework && (
                            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                              {deploy.framework}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{ownerRepo}</div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <GitBranch className="size-3" />
                            {deploy.branch}
                          </span>
                          <span>·</span>
                          <span>{new Date(deploy.createdAt).toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {deploy.previewUrl && deploy.status === 'ready' && (
                        <a
                          href={deploy.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium transition-colors"
                        >
                          <ExternalLink className="size-3.5" />
                          Visitar
                        </a>
                      )}
                      <button
                        onClick={() => setDeleteId(deploy.id)}
                        className="size-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                        aria-label="Deletar"
                      >
                        <Trash2 className="size-4" />
                      </button>
                      <ChevronRight className="size-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* ===== Simplified Create Deploy Modal ===== */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg my-8 shadow-2xl">
              <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Novo Deploy</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Detectamos o framework automaticamente — sem configuração manual
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <Label className="text-xs text-slate-700 mb-1.5 block">Nome do projeto *</Label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-10 bg-white border-slate-300 text-slate-900"
                    placeholder="Meu Site"
                  />
                </div>

                <div>
                  <Label className="text-xs text-slate-700 mb-1.5 block">URL do repositório GitHub *</Label>
                  <Input
                    required
                    type="url"
                    value={form.repoUrl}
                    onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
                    className="h-10 bg-white border-slate-300 text-slate-900 font-mono text-sm"
                    placeholder="https://github.com/usuario/repositorio"
                  />
                  <button
                    type="button"
                    onClick={fillSampleRepo}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                  >
                    <Github className="size-3" />
                    Usar repositório de exemplo (abelha-token-push)
                  </button>
                </div>

                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800">
                  <strong>✨ Deploy automático:</strong> Vamos analisar seu repositório, detectar o
                  framework (Next.js, Vite, React, Astro, etc.), instalar dependências, fazer o
                  build e publicar. Tudo automático.
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white font-semibold"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Rocket className="size-4" />
                        Fazer deploy
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowForm(false)}
                    className="text-slate-600 hover:bg-slate-100"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===== Delete confirmation ===== */}
        {deleteId && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex items-start gap-4 mb-5">
                <div className="size-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="size-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Deletar deploy?</h3>
                  <p className="text-sm text-slate-600">
                    O deploy será removido permanentemente. O repositório no GitHub não será afetado.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleDelete}
                  disabled={saving}
                  className="bg-red-500 hover:bg-red-600 border-0 text-white"
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  Sim, deletar
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setDeleteId(null)}
                  className="text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PainelShell>
  )
}
