'use client'

import * as React from 'react'
import { Ticket, Loader2, RefreshCw, Send, X } from 'lucide-react'
import { AdminShell } from '@/components/painel/admin-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TicketItem {
  id: string
  subject: string
  message: string
  status: string
  priority: string
  response: string | null
  createdAt: string
  user: { name: string; email: string }
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = React.useState<TicketItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [responding, setResponding] = React.useState<TicketItem | null>(null)
  const [response, setResponse] = React.useState('')

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/tickets')
      const data = await res.json()
      if (res.ok) setTickets(data.tickets || [])
    } catch {}
    finally { setLoading(false) }
  }, [])

  React.useEffect(() => { load() }, [load])

  const handleRespond = async () => {
    if (!responding || !response.trim()) return
    const res = await fetch(`/api/admin/tickets/${responding.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response, status: 'resolved' }),
    })
    if (res.ok) {
      setResponding(null)
      setResponse('')
      load()
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/admin/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  return (
    <AdminShell>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Ticket className="size-7 text-amber-600" />
              Tickets de Suporte
            </h1>
            <p className="text-sm text-slate-500 mt-1">{tickets.length} tickets no total</p>
          </div>
          <Button variant="ghost" size="sm" onClick={load} className="text-slate-600">
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center"><Loader2 className="size-8 text-slate-400 animate-spin mx-auto" /></div>
        ) : tickets.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <Ticket className="size-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Nenhum ticket</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {tickets.map((t) => (
              <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900">{t.subject}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        t.status === 'open' ? 'bg-blue-100 text-blue-700' :
                        t.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                        t.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{t.status}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        t.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        t.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        t.priority === 'normal' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{t.priority}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {t.user.name} · {t.user.email} · {new Date(t.createdAt).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-slate-700 mt-2">{t.message}</p>
                    {t.response && (
                      <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                        <p className="text-xs font-semibold text-emerald-700 mb-1">Resposta:</p>
                        <p className="text-sm text-emerald-900">{t.response}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {t.status !== 'resolved' && (
                      <Button size="sm" onClick={() => { setResponding(t); setResponse(t.response || '') }} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Send className="size-3.5" /> Responder
                      </Button>
                    )}
                    {t.status === 'open' && (
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(t.id, 'in_progress')}>Em andamento</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {responding && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white text-slate-900 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Responder Ticket</h2>
                <button onClick={() => setResponding(null)} className="text-slate-500"><X className="size-4" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-slate-500">Cliente: {responding.user.name}</p>
                  <p className="text-xs text-slate-500">Assunto: {responding.subject}</p>
                  <p className="text-sm text-slate-700 mt-2 p-3 bg-slate-50 rounded-lg">{responding.message}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-700 mb-1.5 block">Sua resposta</Label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="w-full h-32 px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm"
                    placeholder="Digite sua resposta..."
                  />
                </div>
                <Button onClick={handleRespond} disabled={!response.trim()} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Send className="size-4" /> Enviar resposta
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
