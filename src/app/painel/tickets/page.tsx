'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Ticket as TicketIcon, Plus, Loader2, Trash2, Clock,
  CheckCircle2, AlertCircle, MessageSquare, ExternalLink, X,
} from 'lucide-react'
import { PainelShell } from '@/components/painel/painel-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface Deploy {
  id: string
  name: string
}

interface Ticket {
  id: string
  subject: string
  message: string
  status: string
  priority: string
  response: string | null
  createdAt: string
  deploy: { id: string; name: string } | null
}

const statusConfig = {
  open: { label: 'Aberto', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
  in_progress: { label: 'Em andamento', icon: Loader2, color: 'text-amber-600', bg: 'bg-amber-50' },
  resolved: { label: 'Resolvido', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  closed: { label: 'Fechado', icon: CheckCircle2, color: 'text-slate-500', bg: 'bg-slate-100' },
}

const priorityConfig = {
  low: { label: 'Baixa', color: 'text-slate-500' },
  normal: { label: 'Normal', color: 'text-blue-600' },
  high: { label: 'Alta', color: 'text-amber-600' },
  urgent: { label: 'Urgente', color: 'text-red-600' },
}

export default function TicketsPage() {
  const [tickets, setTickets] = React.useState<Ticket[]>([])
  const [deploys, setDeploys] = React.useState<Deploy[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [showForm, setShowForm] = React.useState(false)
  const [form, setForm] = React.useState({
    subject: '',
    message: '',
    deployId: '',
    priority: 'normal',
  })
  const [saving, setSaving] = React.useState(false)

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTickets(data.tickets)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setLoading(false)
    }
  }

  const fetchDeploys = async () => {
    try {
      const res = await fetch('/api/deploys')
      const data = await res.json()
      if (res.ok) setDeploys(data.deploys)
    } catch {
      // ignore
    }
  }

  React.useEffect(() => {
    fetchTickets()
    fetchDeploys()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setShowForm(false)
      setForm({ subject: '', message: '', deployId: '', priority: 'normal' })
      await fetchTickets()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PainelShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <TicketIcon className="size-7 text-blue-600" />
              Tickets de Suporte
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Acompanhe seus tickets e crie novos quando precisar de ajuda humana
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white font-semibold"
          >
            <Plus className="size-4" />
            Abrir ticket
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
        ) : tickets.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <TicketIcon className="size-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum ticket aberto</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              Precisa de ajuda humana? Abra um ticket e nossa equipe vai responder.
              Para dúvidas rápidas, use o <Link href="/painel/chat" className="text-blue-600 hover:underline">chat com IA</Link>.
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white font-semibold"
            >
              <Plus className="size-4" />
              Abrir primeiro ticket
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {tickets.map((ticket) => {
              const status = statusConfig[ticket.status as keyof typeof statusConfig] ?? statusConfig.open
              const StatusIcon = status.icon
              const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig] ?? priorityConfig.normal

              return (
                <div
                  key={ticket.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-slate-900">{ticket.subject}</h3>
                        <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md', status.bg, status.color)}>
                          <StatusIcon className={cn('size-3', ticket.status === 'in_progress' && 'animate-spin')} />
                          {status.label}
                        </span>
                        <span className={cn('text-xs font-medium', priority.color)}>
                          {priority.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{ticket.message}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 flex-wrap">
                        <span>{new Date(ticket.createdAt).toLocaleString('pt-BR')}</span>
                        {ticket.deploy && (
                          <>
                            <span>·</span>
                            <Link
                              href={`/painel/projetos/${ticket.deploy.id}`}
                              className="inline-flex items-center gap-1 hover:text-blue-600"
                            >
                              <MessageSquare className="size-3" />
                              {ticket.deploy.name}
                            </Link>
                          </>
                        )}
                      </div>
                      {ticket.response && (
                        <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1">
                            <CheckCircle2 className="size-3.5" />
                            Resposta do suporte
                          </div>
                          <p className="text-sm text-emerald-900">{ticket.response}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Create ticket modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg my-8 shadow-2xl">
              <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Abrir ticket de suporte</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <Label className="text-xs text-slate-700 mb-1.5 block">Assunto *</Label>
                  <Input
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="h-10 bg-white border-slate-300 text-slate-900"
                    placeholder="Meu site não está abrindo"
                  />
                </div>

                <div>
                  <Label className="text-xs text-slate-700 mb-1.5 block">Mensagem *</Label>
                  <textarea
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg text-sm focus:outline-none focus:border-blue-500/50"
                    placeholder="Descreva o problema em detalhes..."
                  />
                </div>

                {deploys.length > 0 && (
                  <div>
                    <Label className="text-xs text-slate-700 mb-1.5 block">Projeto relacionado (opcional)</Label>
                    <select
                      value={form.deployId}
                      onChange={(e) => setForm({ ...form, deployId: e.target.value })}
                      className="h-10 w-full px-3 bg-white border border-slate-300 text-slate-900 rounded-lg text-sm focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="">Nenhum projeto específico</option>
                      {deploys.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <Label className="text-xs text-slate-700 mb-1.5 block">Prioridade</Label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="h-10 w-full px-3 bg-white border border-slate-300 text-slate-900 rounded-lg text-sm focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="low">Baixa</option>
                    <option value="normal">Normal</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
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
                        <TicketIcon className="size-4" />
                        Criar ticket
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
      </div>
    </PainelShell>
  )
}
