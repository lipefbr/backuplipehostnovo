'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, Loader2, Bot, User, Headphones, CheckCircle2 } from 'lucide-react'
import { PainelShell } from '@/components/painel/painel-shell'
import { AdminShell } from '@/components/painel/admin-shell'
import { useSession } from 'next-auth/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Message {
  id: string
  author: string // 'user' | 'admin' | 'ai'
  message: string
  createdAt: string
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const Shell = isAdmin ? AdminShell : PainelShell

  const ticketId = (params.id as string) || new URLSearchParams(window.location.search).get('id')
  const [ticket, setTicket] = React.useState<any>(null)
  const [messages, setMessages] = React.useState<Message[]>([])
  const [loading, setLoading] = React.useState(true)
  const [newMessage, setNewMessage] = React.useState('')
  const [sending, setSending] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}`)
      const data = await res.json()
      if (res.ok) {
        setTicket(data.ticket)
        setMessages(data.ticket.messages || [])
      }
    } catch {}
    finally { setLoading(false) }
  }, [ticketId])

  React.useEffect(() => {
    if (ticketId) load()
  }, [ticketId, load])

  // Poll for new messages every 5s
  React.useEffect(() => {
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [load])

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessages(prev => [...prev, data.message])
        setNewMessage('')
        await load() // reload to get any AI responses
      }
    } catch {}
    finally { setSending(false) }
  }

  const handleResolve = async () => {
    await fetch(`/api/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' }),
    })
    await load()
  }

  if (loading) {
    return <Shell><div className="max-w-3xl mx-auto p-8"><Loader2 className="size-8 text-slate-400 animate-spin mx-auto" /></div></Shell>
  }

  if (!ticket) {
    return <Shell><div className="max-w-3xl mx-auto p-8 text-center text-slate-500">Ticket não encontrado</div></Shell>
  }

  return (
    <Shell>
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="size-10 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600">
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">
              <span className="text-slate-400">#{ticket.ticketNumber}</span> · {ticket.subject}
            </h1>
            <p className="text-xs text-slate-500">
              {ticket.user?.name} · {ticket.user?.email}
            </p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full ${
            ticket.status === 'open' ? 'bg-blue-100 text-blue-700' :
            ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
            ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
            'bg-slate-100 text-slate-600'
          }`}>
            {ticket.status === 'open' ? 'Aberto' :
             ticket.status === 'in_progress' ? 'Em andamento' :
             ticket.status === 'resolved' ? 'Resolvido' : 'Fechado'}
          </span>
        </div>

        {/* Messages */}
        <div className="rounded-xl border border-slate-200 bg-white flex flex-col" style={{ minHeight: '400px', maxHeight: '600px' }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => {
              const isUser = msg.author === 'user'
              const isAI = msg.author === 'ai'
              const isAdminMsg = msg.author === 'admin'

              return (
                <div key={msg.id} className={`flex gap-2 ${isUser ? 'justify-start' : 'justify-end'}`}>
                  {isUser && (
                    <div className="size-8 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
                      <User className="size-4" />
                    </div>
                  )}
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isUser ? 'bg-blue-50 border border-blue-200 text-slate-900' :
                    isAI ? 'bg-purple-50 border border-purple-200 text-slate-900' :
                    'bg-emerald-50 border border-emerald-200 text-slate-900'
                  }`}>
                    {isAI && <p className="text-xs font-bold text-purple-600 mb-1 flex items-center gap-1"><Bot className="size-3" /> IA LipeHost</p>}
                    {isAdminMsg && <p className="text-xs font-bold text-emerald-600 mb-1 flex items-center gap-1"><Headphones className="size-3" /> Suporte</p>}
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(msg.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                  {!isUser && (
                    <div className={`size-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                      isAI ? 'bg-purple-500' : 'bg-emerald-500'
                    }`}>
                      {isAI ? <Bot className="size-4" /> : <Headphones className="size-4" />}
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {ticket.status !== 'closed' && (
            <div className="border-t border-slate-200 p-3 flex items-center gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder="Digite sua mensagem..."
                className="flex-1 h-10 text-slate-900"
              />
              <Button onClick={handleSend} disabled={sending || !newMessage.trim()} className="bg-blue-600 hover:bg-blue-700 text-white h-10">
                {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
              {ticket.status !== 'resolved' && (
                <Button onClick={handleResolve} variant="outline" size="sm" className="text-emerald-700 border-emerald-300">
                  <CheckCircle2 className="size-4" /> Resolver
                </Button>
              )}
            </div>
          )}
        </div>

        {ticket.status === 'resolved' && (
          <div className="mt-4 text-center text-sm text-slate-500">
            ✓ Este ticket foi resolvido. Você pode enviar uma nova mensagem para reabrir.
          </div>
        )}
      </div>
    </Shell>
  )
}
