'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Package, Plus, Edit2, Trash2, Loader2, X, Check, Crown,
} from 'lucide-react'
import { AdminShell } from '@/components/painel/admin-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Plan {
  id: string
  name: string
  slug: string
  description: string | null
  priceMonthly: number
  priceYearly: number | null
  features: string
  maxDeploys: number
  maxDatabases: number
  maxCustomDomains: number
  isActive: boolean
  sortOrder: number
  subscriptionsCount: number
}

export default function AdminPlansPage() {
  const [plans, setPlans] = React.useState<Plan[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [editing, setEditing] = React.useState<Plan | null>(null)
  const [showForm, setShowForm] = React.useState(false)

  const loadPlans = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/plans')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPlans(data.plans || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar planos')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadPlans()
  }, [loadPlans])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deletar plano "${name}"? Não será possível se houver assinaturas ativas.`)) return
    try {
      const res = await fetch(`/api/admin/plans/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await loadPlans()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar')
    }
  }

  const handleToggleActive = async (plan: Plan) => {
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !plan.isActive }),
      })
      if (!res.ok) throw new Error('Erro ao atualizar')
      await loadPlans()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    }
  }

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Package className="size-7 text-amber-600" />
              Planos de Assinatura
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Crie e gerencie planos que os clientes podem assinar
            </p>
          </div>
          <Button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Plus className="size-4" />
            Novo Plano
          </Button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700">✕</button>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="size-8 text-slate-400 animate-spin mx-auto" />
          </div>
        ) : plans.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <Package className="size-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">Nenhum plano</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">Crie seu primeiro plano de assinatura</p>
            <Button onClick={() => setShowForm(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
              <Plus className="size-4" /> Criar plano
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {plans.map((plan) => {
              const features = JSON.parse(plan.features || '[]') as string[]
              return (
                <div key={plan.id} className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                        <span className="text-xs font-mono text-slate-500">@{plan.slug}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          plan.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {plan.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          {plan.subscriptionsCount} assinatura{plan.subscriptionsCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {plan.description && (
                        <p className="text-sm text-slate-600 mt-1">{plan.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="font-bold text-slate-900">R$ {plan.priceMonthly.toFixed(2)}/mês</span>
                        {plan.priceYearly && (
                          <span className="text-slate-500">R$ {plan.priceYearly.toFixed(2)}/ano</span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                        <div className="bg-slate-50 p-2 rounded">
                          <p className="text-slate-500">Deploys</p>
                          <p className="font-bold text-slate-900">{plan.maxDeploys}</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                          <p className="text-slate-500">Bancos</p>
                          <p className="font-bold text-slate-900">{plan.maxDatabases}</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                          <p className="text-slate-500">Domínios</p>
                          <p className="font-bold text-slate-900">{plan.maxCustomDomains}</p>
                        </div>
                      </div>
                      {features.length > 0 && (
                        <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {features.map((f, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-center gap-1">
                              <Check className="size-3 text-emerald-600" /> {f}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleActive(plan)}
                        className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-blue-600"
                        title={plan.isActive ? 'Desativar' : 'Ativar'}
                      >
                        <Crown className={`size-4 ${plan.isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                      </button>
                      <button
                        onClick={() => { setEditing(plan); setShowForm(true) }}
                        className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-blue-600"
                        title="Editar"
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id, plan.name)}
                        className="size-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-500 hover:text-red-600"
                        title="Deletar"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {showForm && (
          <PlanForm
            plan={editing}
            onClose={() => { setShowForm(false); setEditing(null) }}
            onSaved={() => { setShowForm(false); setEditing(null); loadPlans() }}
          />
        )}
      </div>
    </AdminShell>
  )
}

function PlanForm({ plan, onClose, onSaved }: { plan: Plan | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = React.useState({
    name: plan?.name || '',
    slug: plan?.slug || '',
    description: plan?.description || '',
    priceMonthly: plan?.priceMonthly?.toString() || '',
    priceYearly: plan?.priceYearly?.toString() || '',
    features: (plan ? JSON.parse(plan.features || '[]') : []).join('\n'),
    maxDeploys: plan?.maxDeploys?.toString() || '1',
    maxDatabases: plan?.maxDatabases?.toString() || '1',
    maxCustomDomains: plan?.maxCustomDomains?.toString() || '0',
    sortOrder: plan?.sortOrder?.toString() || '0',
    isActive: plan?.isActive ?? true,
  })
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const body = {
        name: form.name,
        slug: form.slug.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        description: form.description,
        priceMonthly: parseFloat(form.priceMonthly),
        priceYearly: form.priceYearly ? parseFloat(form.priceYearly) : null,
        features: form.features.split('\n').map((f) => f.trim()).filter(Boolean),
        maxDeploys: parseInt(form.maxDeploys),
        maxDatabases: parseInt(form.maxDatabases),
        maxCustomDomains: parseInt(form.maxCustomDomains),
        sortOrder: parseInt(form.sortOrder),
        isActive: form.isActive,
      }
      const url = plan ? `/api/admin/plans/${plan.id}` : '/api/admin/plans'
      const method = plan ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-slate-900">{plan ? 'Editar Plano' : 'Novo Plano'}</h2>
          <button onClick={onClose} className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-slate-700 mb-1.5 block">Nome *</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="PRO"
                className="h-10"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-700 mb-1.5 block">Slug *</Label>
              <Input
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="pro"
                className="h-10 font-mono"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-slate-700 mb-1.5 block">Descrição</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Plano para profissionais"
              className="h-10"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-slate-700 mb-1.5 block">Preço mensal (R$) *</Label>
              <Input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.priceMonthly}
                onChange={(e) => setForm({ ...form, priceMonthly: e.target.value })}
                placeholder="49.90"
                className="h-10"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-700 mb-1.5 block">Preço anual (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.priceYearly}
                onChange={(e) => setForm({ ...form, priceYearly: e.target.value })}
                placeholder="499.00"
                className="h-10"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-slate-700 mb-1.5 block">Máx. deploys</Label>
              <Input
                type="number"
                min="0"
                value={form.maxDeploys}
                onChange={(e) => setForm({ ...form, maxDeploys: e.target.value })}
                className="h-10"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-700 mb-1.5 block">Máx. bancos</Label>
              <Input
                type="number"
                min="0"
                value={form.maxDatabases}
                onChange={(e) => setForm({ ...form, maxDatabases: e.target.value })}
                className="h-10"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-700 mb-1.5 block">Máx. domínios</Label>
              <Input
                type="number"
                min="0"
                value={form.maxCustomDomains}
                onChange={(e) => setForm({ ...form, maxCustomDomains: e.target.value })}
                className="h-10"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-slate-700 mb-1.5 block">Benefícios (um por linha)</Label>
            <textarea
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              placeholder={`Deploys ilimitados
Bancos ilimitados
Suporte 24/7`}
              className="w-full h-32 px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-slate-700 mb-1.5 block">Ordem</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="size-4"
                />
                Plano ativo (visível para clientes)
              </label>
            </div>
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              {plan ? 'Salvar' : 'Criar plano'}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
