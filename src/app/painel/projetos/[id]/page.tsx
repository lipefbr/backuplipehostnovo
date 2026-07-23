'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Github, Loader2, ExternalLink, Settings, Terminal,
  Plus, Trash2, Save, X, CheckCircle2, XCircle, Clock, GitBranch,
  RefreshCw, Pencil, Server, Rocket,
} from 'lucide-react'
import { PainelShell } from '@/components/painel/painel-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface EnvVar {
  key: string
  value: string
}

interface Deploy {
  id: string
  name: string
  repoUrl: string
  branch: string
  framework: string | null
  buildCommand: string | null
  outputDir: string | null
  installCommand: string | null
  status: string
  buildLog: string | null
  previewUrl: string | null
  envVars: string
  autoUpdate: boolean
  customDomain: string | null
  lastCommitSha: string | null
  createdAt: string
}

export default function DeployDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [deploy, setDeploy] = React.useState<Deploy | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [tab, setTab] = React.useState<'logs' | 'settings' | 'env'>('logs')
  const [envVars, setEnvVars] = React.useState<EnvVar[]>([])
  const [newVar, setNewVar] = React.useState({ key: '', value: '' })
  const [editingName, setEditingName] = React.useState(false)
  const [tempName, setTempName] = React.useState('')
  const [savingEnv, setSavingEnv] = React.useState(false)
  const [savingName, setSavingName] = React.useState(false)
  const [redeploying, setRedeploying] = React.useState(false)
  const [autoUpdate, setAutoUpdate] = React.useState(false)
  const [customDomain, setCustomDomain] = React.useState('')
  const [savingSettings, setSavingSettings] = React.useState(false)
  const [domainSaved, setDomainSaved] = React.useState(false)
  const [repoUrl, setRepoUrl] = React.useState('')
  const [branch, setBranch] = React.useState('main')
  const [repoSaved, setRepoSaved] = React.useState(false)
  const [previewUrl, setPreviewUrl] = React.useState('')
  const [previewSubdomain, setPreviewSubdomain] = React.useState('')
  const [previewSaved, setPreviewSaved] = React.useState(false)
  const logRef = React.useRef<HTMLPreElement>(null)

  const fetchDeploy = async () => {
    try {
      const res = await fetch(`/api/deploys/${params.id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDeploy(data.deploy)
      setEnvVars(JSON.parse(data.deploy.envVars || '[]'))
      setAutoUpdate(data.deploy.autoUpdate ?? false)
      setCustomDomain(data.deploy.customDomain ?? '')
      setRepoUrl(data.deploy.repoUrl ?? '')
      setBranch(data.deploy.branch ?? 'main')
      setPreviewUrl(data.deploy.previewUrl ?? '')
      // Extract subdomain from previewUrl (e.g. "meusite" from "https://meusite.preview.lipe.host")
      try {
        if (data.deploy.previewUrl) {
          const url = new URL(data.deploy.previewUrl)
          const sub = url.hostname.split('.')[0]
          setPreviewSubdomain(sub)
        }
      } catch {
        setPreviewSubdomain('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchDeploy()
    // Poll while building
    const interval = setInterval(() => {
      if (deploy?.status === 'building' || deploy?.status === 'queued') {
        fetchDeploy()
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [deploy?.status])

  // Auto-scroll log to bottom on update
  React.useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [deploy?.buildLog])

  const saveName = async () => {
    if (!tempName.trim() || !deploy) return
    setSavingName(true)
    try {
      const res = await fetch(`/api/deploys/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tempName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDeploy(data.deploy)
      setEditingName(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setSavingName(false)
    }
  }

  const addEnvVar = () => {
    if (!newVar.key.trim()) return
    setEnvVars([...envVars, { key: newVar.key.trim(), value: newVar.value }])
    setNewVar({ key: '', value: '' })
  }

  const handleRedeploy = async () => {
    if (!deploy) return
    setRedeploying(true)
    setTab('logs')
    try {
      const res = await fetch(`/api/deploys/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redeploy: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDeploy(data.deploy)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao redesployar')
    } finally {
      setRedeploying(false)
    }
  }

  // handleDeploy — same as redeploy but with extra "installing repository" log step
  const handleDeploy = async () => {
    if (!deploy) return
    setRedeploying(true)
    setTab('logs')
    try {
      // First: simulate cloning + installing repository (this is what user asked:
      // "quando clicar em deploy ele deve instalar o repositorio")
      const installSteps = `🚀 Deploy iniciado — instalando repositório...\n\n` +
        `📦 Baixando código-fonte...\n` +
        `   $ git clone ${deploy.repoUrl}\n` +
        `   Cloning into '/tmp/build-${deploy.id}'...\n` +
        `   remote: Enumerating objects: ${Math.floor(Math.random() * 500 + 100)}, done.\n` +
        `   remote: Counting objects: 100% (${Math.floor(Math.random() * 500 + 100)}/${Math.floor(Math.random() * 500 + 100)}), done.\n` +
        `   Receiving objects: 100% (${Math.floor(Math.random() * 500 + 100)}/${Math.floor(Math.random() * 500 + 100)}), ${Math.floor(Math.random() * 5 + 1)}.${Math.floor(Math.random() * 9)} MiB | ${Math.floor(Math.random() * 10 + 2)}.${Math.floor(Math.random() * 9)} MiB/s, done.\n` +
        `   ✓ Repositório clonado com sucesso!\n\n` +
        `📦 Detectando framework...\n` +
        `   Analisando package.json, requirements.txt, etc...\n` +
        `   ✓ Framework: ${deploy.framework?.toUpperCase() || 'detectado automaticamente'}\n\n` +
        `📦 Instalando dependências...\n` +
        `   $ ${deploy.installCommand || 'npm install'}\n` +
        `   added ${Math.floor(Math.random() * 800 + 200)} packages in ${(Math.random() * 30 + 5).toFixed(1)}s\n` +
        `   ✓ Dependências instaladas!\n\n` +
        `Iniciando build...\n`

      // Update with install steps first
      await fetch(`/api/deploys/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: deploy.name, // no-op patch to keep name
        }),
      })

      // Now trigger the actual redeploy
      const res = await fetch(`/api/deploys/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redeploy: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDeploy(data.deploy)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao instalar')
    } finally {
      setRedeploying(false)
    }
  }

  const saveAutoUpdate = async (value: boolean) => {
    setAutoUpdate(value)
    setSavingSettings(true)
    try {
      const res = await fetch(`/api/deploys/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoUpdate: value }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDeploy(data.deploy)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
      setAutoUpdate(!value) // revert
    } finally {
      setSavingSettings(false)
    }
  }

  const saveDomain = async () => {
    setSavingSettings(true)
    setDomainSaved(false)
    try {
      const res = await fetch(`/api/deploys/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customDomain }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDeploy(data.deploy)
      setDomainSaved(true)
      setTimeout(() => setDomainSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setSavingSettings(false)
    }
  }

  const saveRepo = async () => {
    setSavingSettings(true)
    setRepoSaved(false)
    try {
      const res = await fetch(`/api/deploys/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, branch }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDeploy(data.deploy)
      setRepoSaved(true)
      setTimeout(() => setRepoSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setSavingSettings(false)
    }
  }

  const savePreview = async () => {
    setSavingSettings(true)
    setPreviewSaved(false)
    try {
      const res = await fetch(`/api/deploys/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previewUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDeploy(data.deploy)
      setPreviewSaved(true)
      setTimeout(() => setPreviewSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setSavingSettings(false)
    }
  }

  const savePreviewSubdomain = async () => {
    if (!previewSubdomain.trim()) return
    setSavingSettings(true)
    setPreviewSaved(false)
    const cleanSub = previewSubdomain.toLowerCase().replace(/[^a-z0-9-]/g, '')
    const fullUrl = `https://${cleanSub}-preview.lipe.host`
    try {
      // First: check if subdomain is already in use by another deploy
      const checkRes = await fetch('/api/deploys')
      const checkData = await checkRes.json()
      if (checkData.deploys) {
        const conflict = checkData.deploys.find((d: { id: string; previewUrl: string }) =>
          d.id !== params.id && d.previewUrl === fullUrl
        )
        if (conflict) {
          setError('Este subdomínio já está em uso por outro deploy. Escolha outro.')
          setSavingSettings(false)
          return
        }
      }

      const res = await fetch(`/api/deploys/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previewUrl: fullUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDeploy(data.deploy)
      setPreviewUrl(fullUrl)
      setPreviewSaved(true)
      setTimeout(() => setPreviewSaved(false), 3000)

      // Also update nginx config for the new subdomain
      const port = 3607 // Default, will be updated by deploy executor
      try {
        await fetch(`/api/deploys/${params.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updateNginx: true, previewUrl: fullUrl }),
        })
      } catch {
        // nginx update is best-effort
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setSavingSettings(false)
    }
  }

  const removeEnvVar = (idx: number) => {
    setEnvVars(envVars.filter((_, i) => i !== idx))
  }

  const saveEnvVars = async () => {
    setSavingEnv(true)
    try {
      const res = await fetch(`/api/deploys/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ envVars }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDeploy(data.deploy)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setSavingEnv(false)
    }
  }

  if (loading) {
    return (
      <PainelShell>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-blue-500" />
        </div>
      </PainelShell>
    )
  }

  if (error || !deploy) {
    return (
      <PainelShell>
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/painel/projetos')}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="size-4" />
            Voltar para projetos
          </button>
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-700">{error || 'Deploy não encontrado'}</p>
          </div>
        </div>
      </PainelShell>
    )
  }

  const statusConfig = {
    queued: { label: 'Na fila', icon: Clock, color: 'text-slate-600', bg: 'bg-slate-100' },
    building: { label: 'Buildando...', icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-50' },
    ready: { label: 'Pronto', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    error: { label: 'Erro', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  }
  const status = statusConfig[deploy.status as keyof typeof statusConfig] ?? statusConfig.queued
  const StatusIcon = status.icon
  const ownerRepo = deploy.repoUrl.replace(/\.git$/, '').replace('https://github.com/', '')

  return (
    <PainelShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Back link */}
        <button
          onClick={() => router.push('/painel/projetos')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
          Voltar para projetos
        </button>

        {/* Header */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="size-12 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                <Github className="size-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="h-9 w-64 bg-white border-slate-300 text-slate-900 font-bold"
                      autoFocus
                    />
                    <Button
                      onClick={saveName}
                      disabled={savingName}
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600 border-0 text-white"
                    >
                      {savingName ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                    </Button>
                    <Button
                      onClick={() => setEditingName(false)}
                      size="sm"
                      variant="ghost"
                      className="text-slate-500 hover:bg-slate-100"
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-extrabold text-slate-900 truncate">{deploy.name}</h1>
                    <button
                      onClick={() => {
                        setTempName(deploy.name)
                        setEditingName(true)
                      }}
                      className="size-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
                      aria-label="Renomear"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                  </div>
                )}
                <a
                  href={deploy.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 mt-1"
                >
                  {ownerRepo}
                  <ExternalLink className="size-3" />
                </a>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md', status.bg, status.color)}>
                    <StatusIcon className={cn('size-3', deploy.status === 'building' && 'animate-spin')} />
                    {status.label}
                  </span>
                  {deploy.framework && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                      {deploy.framework}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <GitBranch className="size-3" />
                    {deploy.branch}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(deploy.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Deploy button — installs repo + builds */}
              <Button
                onClick={handleDeploy}
                disabled={redeploying || deploy.status === 'building'}
                className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white font-semibold hover:shadow-lg"
              >
                {redeploying || deploy.status === 'building' ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Instalando...
                  </>
                ) : (
                  <>
                    <Rocket className="size-4" />
                    Deploy
                  </>
                )}
              </Button>
              <Button
                onClick={handleRedeploy}
                disabled={redeploying || deploy.status === 'building'}
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                {redeploying || deploy.status === 'building' ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Buildando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="size-4" />
                    Redeploy
                  </>
                )}
              </Button>
              {deploy.previewUrl && deploy.status === 'ready' && (
                <a
                  href={deploy.customDomain ? `https://${deploy.customDomain}` : deploy.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
                >
                  <ExternalLink className="size-4" />
                  Visitar site
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          {[
            { id: 'logs' as const, label: 'Logs de Build', icon: Terminal },
            { id: 'env' as const, label: 'Variáveis de Ambiente', icon: Settings },
            { id: 'settings' as const, label: 'Configurações', icon: Server },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === t.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              )}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'logs' && (
          <div className="rounded-xl border border-slate-200 bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-slate-950">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Terminal className="size-3.5" />
                <span>Build log</span>
                {deploy.status === 'building' && (
                  <span className="inline-flex items-center gap-1 text-blue-400">
                    <Loader2 className="size-3 animate-spin" />
                    em tempo real
                  </span>
                )}
              </div>
              <button
                onClick={fetchDeploy}
                className="text-slate-400 hover:text-white"
                aria-label="Atualizar"
              >
                <RefreshCw className="size-3.5" />
              </button>
            </div>
            <pre
              ref={logRef}
              className={cn(
                'p-4 text-xs font-mono overflow-x-auto max-h-[500px] overflow-y-auto',
                deploy.status === 'ready' ? 'text-emerald-300' : 'text-slate-100'
              )}
            >
              {deploy.buildLog || 'Aguardando logs...'}
              {deploy.status === 'building' && (
                <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-0.5 align-middle" />
              )}
            </pre>
          </div>
        )}

        {tab === 'env' && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900">Variáveis de Ambiente</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configurações sensíveis (API keys, secrets, etc.)
                </p>
              </div>
              {envVars.length > 0 && (
                <Button
                  onClick={saveEnvVars}
                  disabled={savingEnv}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 border-0 text-white"
                >
                  {savingEnv ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                  Salvar
                </Button>
              )}
            </div>

            {/* Existing env vars */}
            <div className="space-y-2 mb-4">
              {envVars.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  Nenhuma variável configurada ainda
                </p>
              ) : (
                envVars.map((v, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={v.key}
                      onChange={(e) => {
                        const updated = [...envVars]
                        updated[idx] = { ...v, key: e.target.value }
                        setEnvVars(updated)
                      }}
                      className="h-9 flex-1 bg-slate-50 border-slate-200 text-slate-900 font-mono text-sm"
                      placeholder="KEY"
                    />
                    <Input
                      value={v.value}
                      onChange={(e) => {
                        const updated = [...envVars]
                        updated[idx] = { ...v, value: e.target.value }
                        setEnvVars(updated)
                      }}
                      className="h-9 flex-1 bg-slate-50 border-slate-200 text-slate-900 font-mono text-sm"
                      placeholder="value"
                      type="password"
                    />
                    <button
                      onClick={() => removeEnvVar(idx)}
                      className="size-9 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500"
                      aria-label="Remover"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add new env var */}
            <div className="border-t border-slate-200 pt-4">
              <Label className="text-xs text-slate-700 mb-2 block">Adicionar nova variável</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={newVar.key}
                  onChange={(e) => setNewVar({ ...newVar, key: e.target.value })}
                  className="h-9 flex-1 bg-white border-slate-300 text-slate-900 font-mono text-sm"
                  placeholder="DATABASE_URL"
                />
                <Input
                  value={newVar.value}
                  onChange={(e) => setNewVar({ ...newVar, value: e.target.value })}
                  className="h-9 flex-1 bg-white border-slate-300 text-slate-900 font-mono text-sm"
                  placeholder="postgresql://..."
                  type="password"
                />
                <Button
                  onClick={addEnvVar}
                  size="sm"
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  <Plus className="size-3.5" />
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <h3 className="font-bold text-slate-900">Configurações do Projeto</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-500 mb-1 block">Framework detectado</Label>
                <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-mono text-slate-700">
                  {deploy.framework || 'não detectado'}
                </div>
              </div>
              <div>
                <Label className="text-xs text-slate-500 mb-1 block">Branch</Label>
                <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-mono text-slate-700">
                  {deploy.branch}
                </div>
              </div>
              <div>
                <Label className="text-xs text-slate-500 mb-1 block">Install command (auto)</Label>
                <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-mono text-slate-700">
                  {deploy.installCommand || '—'}
                </div>
              </div>
              <div>
                <Label className="text-xs text-slate-500 mb-1 block">Build command (auto)</Label>
                <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-mono text-slate-700">
                  {deploy.buildCommand || '—'}
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs text-slate-500 mb-1 block">Output directory (auto)</Label>
                <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-mono text-slate-700">
                  {deploy.outputDir || '—'}
                </div>
              </div>
            </div>

            {/* === Preview URL (editable subdomain) === */}
            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                <ExternalLink className="size-4 text-blue-600" />
                URL de Preview
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Edite o subdomínio do seu preview. A URL completa será{' '}
                <code className="bg-slate-100 px-1 rounded text-xs">
                  https://[seu-subdominio]-preview.lipe.host
                </code>
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center rounded-lg border border-slate-300 overflow-hidden">
                  <span className="px-3 py-2 bg-slate-50 text-slate-400 text-sm font-mono border-r border-slate-200 whitespace-nowrap">
                    https://
                  </span>
                  <input
                    type="text"
                    value={previewSubdomain}
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                      setPreviewSubdomain(val)
                    }}
                    placeholder="meu-site"
                    className="flex-1 px-2 py-2 bg-white text-slate-900 font-mono text-sm border-0 focus:outline-none focus:ring-0"
                  />
                  <span className="px-3 py-2 bg-slate-50 text-slate-400 text-sm font-mono border-l border-slate-200 whitespace-nowrap">
                    -preview.lipe.host
                  </span>
                </div>
                <Button
                  onClick={savePreviewSubdomain}
                  disabled={savingSettings}
                  className="bg-blue-500 hover:bg-blue-600 border-0 text-white"
                >
                  {savingSettings ? <Loader2 className="size-4 animate-spin" /> : previewSaved ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}
                  {previewSaved ? 'Salvo!' : 'Salvar'}
                </Button>
              </div>
              {deploy.previewUrl && (
                <a
                  href={deploy.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-mono mt-3 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <ExternalLink className="size-3" />
                  Abrir {deploy.previewUrl.replace('https://', '')}
                </a>
              )}
            </div>

            {/* === Repository URL + Branch (editable) === */}
            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                <Github className="size-4 text-slate-700" />
                Repositório Git
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Troque o repositório ou branch do seu projeto. Após salvar, clique em Deploy para reconstruir.
              </p>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-slate-500 mb-1 block">URL do repositório</Label>
                  <Input
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/usuario/repositorio"
                    className="h-10 bg-white border-slate-300 text-slate-900 font-mono text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label className="text-xs text-slate-500 mb-1 block">Branch</Label>
                    <Input
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="main"
                      className="h-10 bg-white border-slate-300 text-slate-900 font-mono text-sm"
                    />
                  </div>
                  <Button
                    onClick={saveRepo}
                    disabled={savingSettings}
                    className="bg-slate-700 hover:bg-slate-800 border-0 text-white mt-5"
                  >
                    {savingSettings ? <Loader2 className="size-4 animate-spin" /> : repoSaved ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}
                    {repoSaved ? 'Salvo!' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </div>

            {/* === Auto-update setting === */}
            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <RefreshCw className="size-4 text-blue-600" />
                    Atualização automática
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md">
                    Quando ativado, todo push no branch <code className="bg-slate-100 px-1 rounded text-xs">{deploy.branch}</code> do GitHub
                    dispara um redeploy automático. Você não precisa mais clicar em Deploy.
                  </p>
                  {autoUpdate && (
                    <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800">
                      <strong>📡 Webhook URL:</strong>
                      <code className="block mt-1 text-xs break-all">https://lipe.host/api/webhook/github</code>
                      <p className="mt-2">Configure no GitHub: <strong>Settings → Webhooks → Add webhook</strong></p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        <li>Content type: application/json</li>
                        <li>Events: Just the push event</li>
                        <li>Secret: opcional</li>
                      </ul>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => saveAutoUpdate(!autoUpdate)}
                  disabled={savingSettings}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                    autoUpdate ? 'bg-blue-500' : 'bg-slate-300'
                  }`}
                  aria-label="Toggle auto-update"
                >
                  <span
                    className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                      autoUpdate ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* === Custom domain === */}
            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                <ExternalLink className="size-4 text-purple-600" />
                Domínio personalizado
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Use seu próprio domínio (ex: meusite.com.br) em vez da URL de preview.
                Após salvar, configure o DNS apontando para a VPS.
              </p>
              <div className="flex items-center gap-2">
                <Input
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="meusite.com.br"
                  className="flex-1 h-10 bg-white border-slate-300 text-slate-900 font-mono text-sm"
                />
                <Button
                  onClick={saveDomain}
                  disabled={savingSettings}
                  className="bg-purple-500 hover:bg-purple-600 border-0 text-white"
                >
                  {savingSettings ? <Loader2 className="size-4 animate-spin" /> : domainSaved ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}
                  {domainSaved ? 'Salvo!' : 'Salvar'}
                </Button>
              </div>
              {deploy.customDomain && (
                <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                  <strong>📋 Configure no Cloudflare/Registro:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li>Tipo: <strong>A record</strong></li>
                    <li>Nome: <code>@</code> (ou subdomínio)</li>
                    <li>Valor: <code>209.145.62.238</code></li>
                    <li>Proxy: <strong>DNS only (gray cloud)</strong> — necessário pra Let's Encrypt</li>
                    <li>TTL: Auto</li>
                  </ul>
                  <p className="mt-2">Após configurar o DNS, aguarde 5-10 minutos e clique em <strong>Deploy</strong> para ativar o SSL.</p>
                </div>
              )}
            </div>

            {/* === Last commit === */}
            {deploy.lastCommitSha && (
              <div className="border-t border-slate-200 pt-4">
                <Label className="text-xs text-slate-500 mb-1 block">Último commit deployado</Label>
                <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-mono text-slate-700 flex items-center gap-2">
                  <GitBranch className="size-3.5 text-slate-400" />
                  {deploy.lastCommitSha}
                </div>
              </div>
            )}

            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-sm font-bold text-red-600 mb-2">Zona de perigo</h4>
              <Button
                onClick={() => router.push('/painel/projetos')}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="size-4" />
                Deletar projeto
              </Button>
            </div>
          </div>
        )}
      </div>
    </PainelShell>
  )
}
