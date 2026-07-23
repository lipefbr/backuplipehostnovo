'use client'

import * as React from 'react'
import Link from 'next/link'
import { Ticket, Plus, Loader2, X, Send, RefreshCw } from 'lucide-react'
import { PainelShell } from '@/components/painel/painel-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TicketItem {
  id: string
  ticketNumber: number
  subject: string
  status: string
  priority: string
  createdAt: string
  messagesCount: number
}

export default function PainelTicketsPage() {
  const [tickets, setTickets] = React.useState<TicketItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showForm, setShowForm] = React.useState(false)
  const [form, setForm] = React.useState({ subject: '', message: '' })
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tickets')
      const data = await res.json()
      if (res.ok) setTickets(data.tickets || [])
    } catch {}
    finally { setLoading(false) }
  }, [])

  React.useEffect(() => { load() }, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setShowForm(false)
      setForm({ subject: '', message: '' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PainelShell>
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Ticket className="size-7 text-blue-600" />
              Meus Tickets
            </h1>
            <p className="text-sm text-slate-500 mt-1">Abra chamados de suporte e acompanhe suas conversas</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={load} className="text-slate-600">
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="size-4" /> Novo Ticket
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center"><Loader2 className="size-8 text-slate-400 animate-spin mx-auto" /></div>
        ) : tickets.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <Ticket className="size-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-900">Nenhum ticket</p>
            <p className="text-xs text-slate-500 mt-1">Precisa de ajuda? Abra um ticket e nossa equipe vai te responder.</p>
            <Button onClick={() => setShowForm(true)} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="size-4" /> Abrir primeiro ticket
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {tickets.map((t) => (
              <Link key={t.id} href={`/painel/tickets/${t.id}`} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-slate-400">#{t.ticketNumber}</span>
                      <h3 className="font-bold text-slate-900">{t.subject}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        t.status === 'open' ? 'bg-blue-100 text-blue-700' :
                        t.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                        t.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {t.status === 'open' ? 'Aberto' : t.status === 'in_progress' ? 'Em andamento' : t.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(t.createdAt).toLocaleString('pt-BR')} · {t.messagesCount} mensagem{t.messagesCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-blue-600">Abrir →</Button>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Create modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white text-slate-900 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Novo Ticket</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-500"><X className="size-4" /></button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <Label className="text-xs text-slate-700 mb-1.5 block">Assunto *</Label>
                  <Input required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="h-10 text-slate-900" placeholder="Meu site não está abrindo" />
                </div>
                <div>
                  <Label className="text-xs text-slate-700 mb-1.5 block">Mensagem *</Label>
                  <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full h-32 px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm" placeholder="Descreva seu problema..." />
                </div>
                {error && <p className="text-sm text-red-700">{error}</p>}
                <Button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Criar ticket
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </PainelShell>
  )
}
