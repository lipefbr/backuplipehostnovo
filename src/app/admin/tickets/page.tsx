'use client'

import * as React from 'react'
import Link from 'next/link'
import { Ticket, Loader2, RefreshCw } from 'lucide-react'
import { AdminShell } from '@/components/painel/admin-shell'
import { Button } from '@/components/ui/button'

interface TicketItem {
  id: string
  ticketNumber: number
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
              <Link key={t.id} href={`/painel/tickets/${t.id}`} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-amber-300 hover:bg-amber-50/30 transition-colors">
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
                      }`}>{t.status === 'open' ? 'Aberto' : t.status === 'in_progress' ? 'Em andamento' : t.status === 'resolved' ? 'Resolvido' : 'Fechado'}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        t.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        t.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{t.priority}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {t.user.name} · {t.user.email} · {new Date(t.createdAt).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-slate-700 mt-2 line-clamp-2">{t.message}</p>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0">Abrir →</Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  )
}
