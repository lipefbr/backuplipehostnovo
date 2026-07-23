'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Database, Plus, Trash2, Loader2, Copy, Check, Server,
  Terminal, Zap, X, AlertTriangle, Eye, EyeOff, RefreshCw, ChevronRight,
} from 'lucide-react'
import { PainelShell } from '@/components/painel/painel-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DatabaseItem {
  id: string
  name: string
  slug: string
  engine: string
  status: string
  host: string
  port: number
  dbName: string
  dbUser: string
  connectionString: string
  hasPassword?: boolean
  errorMessage?: string | null
  createdAt: string
}

export default function BancosPage() {
  const [databases, setDatabases] = React.useState<DatabaseItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showForm, setShowForm] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', engine: 'postgresql' })
  const [saving, setSaving] = React.useState(false)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [newlyCreated, setNewlyCreated] = React.useState<DatabaseItem | null>(null)
  const [revealedIds, setRevealedIds] = React.useState<Set<string>>(new Set())

  // Load databases from API
  const loadDatabases = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/databases')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDatabases(data.databases || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar bancos')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadDatabases()
  }, [loadDatabases])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/databases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNewlyCreated(data.database)
      setShowForm(false)
      setForm({ name: '', engine: 'postgresql' })
      await loadDatabases()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar banco')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza? Isso vai DELETAR o banco de dados e TODOS os dados dentro dele. Esta ação não pode ser desfeita.')) return
    try {
      const res = await fetch(`/api/databases/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      await loadDatabases()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar banco')
    }
  }

  const handleReveal = async (db: DatabaseItem) => {
    if (revealedIds.has(db.id)) {
      // Hide again
      const newSet = new Set(revealedIds)
      newSet.delete(db.id)
      setRevealedIds(newSet)
      // Reload to get masked version
      await loadDatabases()
      return
    }
    // Reveal — fetch with ?reveal=true
    try {
      const res = await fetch(`/api/databases/${db.id}?reveal=true`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      // Update this specific db in the list
      setDatabases((prev) => prev.map((d) => (d.id === db.id ? { ...d, connectionString: data.database.connectionString } : d)))
      const newSet = new Set(revealedIds)
      newSet.add(db.id)
      setRevealedIds(newSet)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao revelar senha')
    }
  }

  const copyConnection = (id: string, conn: string) => {
    navigator.clipboard.writeText(conn)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <PainelShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Database className="size-7 text-blue-600" />
              Banco de Dados
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Crie e gerencie bancos de dados PostgreSQL reais (MySQL e Redis em breve)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={loadDatabases}
              disabled={loading}
              className="text-slate-600"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white font-semibold"
            >
              <Plus className="size-4" />
              Novo Banco
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <AlertTriangle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Newly created database — show with full connection string + warning */}
        {newlyCreated && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="size-10 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                <Check className="size-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-emerald-900">Banco criado com sucesso!</h3>
                <p className="text-sm text-emerald-700 mt-1">
                  Copie a connection string abaixo agora — a senha <strong>não será mostrada novamente</strong> por segurança.
                  Você pode revelá-la depois, mas é mais seguro guardar agora.
                </p>
              </div>
              <button onClick={() => setNewlyCreated(null)} className="text-emerald-400 hover:text-emerald-600">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 rounded-lg bg-slate-900 text-emerald-300 text-xs font-mono overflow-x-auto">
                {newlyCreated.connectionString}
              </div>
              <button
                onClick={() => copyConnection('new', newlyCreated.connectionString)}
                className="size-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors flex-shrink-0"
              >
                {copiedId === 'new' ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Important info banner */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
          <Server className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <strong>Como usar seu banco:</strong> Os bancos rodam em PostgreSQL 16 na mesma VPS dos seus deploys.
            Apps deployados no LipeHost podem conectar diretamente via <code className="bg-blue-100 px-1 rounded">127.0.0.1:5432</code>.
            Para acessar de fora da VPS, use um túnel SSH.
          </div>
        </div>

        {/* Databases list */}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <Loader2 className="size-8 text-slate-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Carregando bancos...</p>
          </div>
        ) : databases.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Database className="size-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum banco de dados</h3>
            <p className="text-sm text-slate-500 mb-6">
              Crie seu primeiro banco PostgreSQL real em segundos. Banco e usuário são criados automaticamente.
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white font-semibold"
            >
              <Plus className="size-4" />
              Criar banco
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {databases.map((db) => (
              <div key={db.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="size-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0">
                      <Database className="size-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/painel/bancos/${db.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-1"
                        >
                          {db.name}
                          <ChevronRight className="size-3 opacity-50" />
                        </Link>
                        {db.status === 'active' && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Ativo
                          </span>
                        )}
                        {db.status === 'creating' && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                            <Loader2 className="size-3 animate-spin" />
                            Criando...
                          </span>
                        )}
                        {db.status === 'error' && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                            <AlertTriangle className="size-3" />
                            Erro
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                        <span className="font-mono">{db.engine === 'postgresql' ? 'PostgreSQL 16' : db.engine}</span>
                        <span>·</span>
                        <span className="font-mono">{db.host}:{db.port}</span>
                        <span>·</span>
                        <span className="font-mono">db: {db.dbName}</span>
                        <span>·</span>
                        <span className="font-mono">user: {db.dbUser}</span>
                        <span>·</span>
                        <span>{new Date(db.createdAt).toLocaleString('pt-BR')}</span>
                      </div>
                      {db.errorMessage && (
                        <p className="text-xs text-red-600 mt-2 font-mono">{db.errorMessage}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(db.id)}
                    className="size-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                    aria-label="Deletar"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {/* Connection string */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto">
                    {db.connectionString}
                  </div>
                  <button
                    onClick={() => handleReveal(db)}
                    className="size-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors flex-shrink-0"
                    aria-label={revealedIds.has(db.id) ? 'Ocultar senha' : 'Revelar senha'}
                    title={revealedIds.has(db.id) ? 'Ocultar senha' : 'Revelar senha'}
                  >
                    {revealedIds.has(db.id) ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                  <button
                    onClick={() => copyConnection(db.id, db.connectionString)}
                    className="size-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors flex-shrink-0"
                    aria-label="Copiar"
                  >
                    {copiedId === db.id ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  💡 Use esta connection string como <code className="bg-slate-100 px-1 rounded">DATABASE_URL</code> nas variáveis de ambiente do seu deploy.
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Features banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <Zap className="size-5 text-amber-500 mb-2" />
            <h4 className="text-sm font-bold text-slate-900">Provisionamento real</h4>
            <p className="text-xs text-slate-500 mt-1">Banco e usuário criados no PostgreSQL 16</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <Terminal className="size-5 text-blue-500 mb-2" />
            <h4 className="text-sm font-bold text-slate-900">Connection string segura</h4>
            <p className="text-xs text-slate-500 mt-1">Senha revelável apenas quando precisar</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <Server className="size-5 text-emerald-500 mb-2" />
            <h4 className="text-sm font-bold text-slate-900">PostgreSQL 16 na VPS</h4>
            <p className="text-xs text-slate-500 mt-1">Acessível pelos deploys via localhost</p>
          </div>
        </div>

        {/* Create modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Criar Banco de Dados</h2>
                <button onClick={() => setShowForm(false)} className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
                  <X className="size-4" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <Label className="text-xs text-slate-700 mb-1.5 block">Nome do banco *</Label>
                  <Input
                    required
                    minLength={3}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="meu-app-prod"
                    className="h-10 bg-white border-slate-300 text-slate-900 font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Mínimo 3 caracteres. Será sanitizado para lowercase + underscores.
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-slate-700 mb-1.5 block">Engine</Label>
                  <select
                    value={form.engine}
                    onChange={(e) => setForm({ ...form, engine: e.target.value })}
                    className="h-10 w-full px-3 bg-white border border-slate-300 text-slate-900 rounded-lg text-sm"
                  >
                    <option value="postgresql">PostgreSQL 16</option>
                    <option value="mysql" disabled>MySQL 8 (em breve)</option>
                    <option value="redis" disabled>Redis 7 (em breve)</option>
                  </select>
                </div>
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800">
                  <strong>✨ Criação real:</strong> Será criado um banco PostgreSQL 16 + usuário exclusivo com senha aleatória.
                  A connection string completa será mostrada <strong>uma única vez</strong> após a criação — guarde bem!
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" disabled={saving} className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white font-semibold">
                    {saving ? <><Loader2 className="size-4 animate-spin" /> Criando banco real...</> : <><Plus className="size-4" /> Criar banco</>}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="text-slate-600 hover:bg-slate-100">
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PainelShell>
  )
}
