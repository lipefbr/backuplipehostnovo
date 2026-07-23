'use client'

import * as React from 'react'
import {
  Plus, Pencil, Trash2, Search, Loader2, Save, X, Eye,
  Boxes, Tag, DollarSign, Star, CheckCircle2, XCircle,
} from 'lucide-react'
import { AdminShell } from '@/components/painel/admin-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface System {
  id: string
  slug: string
  name: string
  tagline: string
  category: string
  shortDescription: string
  longDescription: string
  technologies: string
  highlights: string
  startingPrice: string | null
  status: string
  featured: boolean
  accentColor: string
  createdAt: string
  _count?: { features: number; plans: number; faq: number; orders: number }
}

const emptyForm = {
  slug: '',
  name: '',
  tagline: '',
  category: 'Mobilidade',
  shortDescription: '',
  longDescription: '',
  technologies: '',
  highlights: '',
  startingPrice: '',
  status: 'disponivel',
  featured: false,
  accentColor: '#3b82f6',
}

const categories = [
  'Mobilidade', 'Delivery', 'Marketplace', 'Saúde', 'Educação',
  'Turismo', 'Financeiro', 'SaaS', 'IA', 'ERP', 'CRM',
]

export default function AdminSistemasPage() {
  const [systems, setSystems] = React.useState<System[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [showForm, setShowForm] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState(emptyForm)
  const [saving, setSaving] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const fetchSystems = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/systems')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao carregar')
      setSystems(data.systems)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchSystems()
  }, [])

  const filtered = systems.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      s.name.toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    )
  })

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (sys: System) => {
    setForm({
      slug: sys.slug,
      name: sys.name,
      tagline: sys.tagline,
      category: sys.category,
      shortDescription: sys.shortDescription,
      longDescription: sys.longDescription,
      technologies: JSON.parse(sys.technologies || '[]').join(', '),
      highlights: JSON.parse(sys.highlights || '[]').join(', '),
      startingPrice: sys.startingPrice || '',
      status: sys.status,
      featured: sys.featured,
      accentColor: sys.accentColor,
    })
    setEditingId(sys.id)
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload = {
        ...form,
        technologies: form.technologies.split(',').map((t) => t.trim()).filter(Boolean),
        highlights: form.highlights.split(',').map((t) => t.trim()).filter(Boolean),
        startingPrice: form.startingPrice || null,
      }

      const url = editingId
        ? `/api/admin/systems/${editingId}`
        : '/api/admin/systems'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar')

      setShowForm(false)
      await fetchSystems()
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
      const res = await fetch(`/api/admin/systems/${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao deletar')
      setDeleteId(null)
      await fetchSystems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Gerenciar Sistemas
            </h1>
            <p className="text-sm text-slate-900/55 mt-1">
              {systems.length} sistema(s) no catálogo
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-slate-900 font-semibold hover:shadow-lg hover:shadow-amber-500/30"
          >
            <Plus className="size-4" />
            Adicionar sistema
          </Button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-900/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, slug ou categoria..."
            className="h-11 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-900/40 rounded-xl"
          />
        </div>

        {/* Table (desktop) / cards (mobile) */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-amber-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Boxes className="size-12 text-slate-900/20 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">Nenhum sistema</h3>
            <p className="text-sm text-slate-900/50 mt-1 mb-4">
              {search ? 'Tente outro termo.' : 'Comece adicionando seu primeiro sistema.'}
            </p>
            {!search && (
              <Button onClick={openCreate} className="bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-slate-900 font-semibold">
                <Plus className="size-4" />
                Adicionar sistema
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block rounded-xl border border-slate-200 bg-white overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-slate-200">
                  <tr className="text-left text-xs uppercase tracking-wider text-slate-900/40">
                    <th className="px-5 py-3 font-medium">Sistema</th>
                    <th className="px-5 py-3 font-medium">Categoria</th>
                    <th className="px-5 py-3 font-medium">Preço</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Destaque</th>
                    <th className="px-5 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sys) => (
                    <tr key={sys.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 text-sm">{sys.name}</div>
                        <div className="text-xs text-slate-900/40 font-mono">/{sys.slug}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-medium px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-900/70">
                          {sys.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-900/80">
                        {sys.startingPrice || 'Sob consulta'}
                      </td>
                      <td className="px-5 py-4">
                        {sys.status === 'disponivel' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                            <CheckCircle2 className="size-3" />
                            Disponível
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400">
                            <XCircle className="size-3" />
                            Sob consulta
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {sys.featured ? (
                          <Star className="size-4 fill-amber-400 text-amber-400" />
                        ) : (
                          <Star className="size-4 text-slate-900/20" />
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`/loja/${sys.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-900/60 hover:text-slate-900 transition-colors"
                            aria-label="Ver no site"
                          >
                            <Eye className="size-4" />
                          </a>
                          <button
                            onClick={() => openEdit(sys)}
                            className="size-8 rounded-lg hover:bg-amber-500/10 flex items-center justify-center text-slate-900/60 hover:text-amber-400 transition-colors"
                            aria-label="Editar"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(sys.id)}
                            className="size-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-slate-900/60 hover:text-red-400 transition-colors"
                            aria-label="Deletar"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden space-y-3">
              {filtered.map((sys) => (
                <div key={sys.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 text-sm">{sys.name}</h3>
                      <p className="text-xs text-slate-900/40 font-mono">/{sys.slug}</p>
                    </div>
                    {sys.featured && <Star className="size-4 fill-amber-400 text-amber-400" />}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-900/70">
                      {sys.category}
                    </span>
                    <span className="text-xs text-slate-900/60">
                      {sys.startingPrice || 'Sob consulta'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(sys)}
                      className="flex-1 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium flex items-center justify-center gap-1.5"
                    >
                      <Pencil className="size-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => setDeleteId(sys.id)}
                      className="size-9 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ===== Create / Edit Modal ===== */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId ? 'Editar sistema' : 'Adicionar sistema'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-900/60 hover:text-slate-900"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-900/70 mb-1.5 block">Nome *</Label>
                    <Input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="h-10 bg-slate-50 border-slate-200 text-slate-900"
                      placeholder="Sistema Mobilidade"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-900/70 mb-1.5 block">Slug (URL) *</Label>
                    <Input
                      required
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                      className="h-10 bg-slate-50 border-slate-200 text-slate-900 font-mono"
                      placeholder="sistema-mobilidade"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-slate-900/70 mb-1.5 block">Tagline</Label>
                  <Input
                    value={form.tagline}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                    className="h-10 bg-slate-50 border-slate-200 text-slate-900"
                    placeholder="App de transporte completo"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-900/70 mb-1.5 block">Categoria *</Label>
                    <select
                      required
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="h-10 w-full px-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg text-sm focus:outline-none focus:border-amber-500/50"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-900/70 mb-1.5 block">Preço inicial</Label>
                    <Input
                      value={form.startingPrice}
                      onChange={(e) => setForm({ ...form, startingPrice: e.target.value })}
                      className="h-10 bg-slate-50 border-slate-200 text-slate-900"
                      placeholder="R$ 18.000"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-slate-900/70 mb-1.5 block">Descrição curta *</Label>
                  <textarea
                    required
                    value={form.shortDescription}
                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg text-sm focus:outline-none focus:border-amber-500/50"
                    placeholder="Resumo do sistema em 1-2 frases"
                  />
                </div>

                <div>
                  <Label className="text-xs text-slate-900/70 mb-1.5 block">Descrição longa</Label>
                  <textarea
                    value={form.longDescription}
                    onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg text-sm focus:outline-none focus:border-amber-500/50"
                    placeholder="Descrição completa do sistema..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-900/70 mb-1.5 block">Tecnologias (vírgula)</Label>
                    <Input
                      value={form.technologies}
                      onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                      className="h-10 bg-slate-50 border-slate-200 text-slate-900"
                      placeholder="Flutter, Laravel, PostgreSQL"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-900/70 mb-1.5 block">Destaques (vírgula)</Label>
                    <Input
                      value={form.highlights}
                      onChange={(e) => setForm({ ...form, highlights: e.target.value })}
                      className="h-10 bg-slate-50 border-slate-200 text-slate-900"
                      placeholder="PIX, Cartão, Mapa, Tempo Real"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-slate-900/70 mb-1.5 block">Status</Label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="h-10 w-full px-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg text-sm focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="disponivel">Disponível</option>
                      <option value="sob-consulta">Sob consulta</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-900/70 mb-1.5 block">Cor</Label>
                    <input
                      type="color"
                      value={form.accentColor}
                      onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                      className="h-10 w-full bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-900/70 mb-1.5 block">Destacar</Label>
                    <label className="flex items-center h-10 gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                        className="size-4"
                      />
                      <span className="text-sm text-slate-900/80">Destaque na home</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-slate-900 font-semibold"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="size-4" />
                        {editingId ? 'Salvar alterações' : 'Criar sistema'}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowForm(false)}
                    className="text-slate-900/70 hover:bg-slate-100"
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
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="size-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="size-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Deletar sistema?</h3>
                  <p className="text-sm text-slate-900/60">
                    Esta ação não pode ser desfeita. Todos os dados relacionados
                    (features, planos, FAQ, screenshots) serão removidos permanentemente.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleDelete}
                  disabled={saving}
                  className="bg-red-500 hover:bg-red-600 border-0 text-slate-900"
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  Sim, deletar
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setDeleteId(null)}
                  className="text-slate-900/70 hover:bg-slate-100"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
