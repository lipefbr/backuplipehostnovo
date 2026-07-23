'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Send, User, Sparkles, Trash2, Loader2, X,
  RefreshCw, AlertCircle, FileText, ExternalLink, ChevronRight,
} from 'lucide-react'
import { PainelShell } from '@/components/painel/painel-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
  // Optional: deploy IDs the user can click to navigate
  deployLinks?: { id: string; name: string }[]
}

interface Deploy {
  id: string
  name: string
  status: string
  previewUrl: string | null
  customDomain: string | null
  framework: string | null
}

const SUGGESTIONS = [
  { icon: AlertCircle, text: 'Meu site não está abrindo' },
  { icon: RefreshCw, text: 'Como faço redeploy?' },
  { icon: FileText, text: 'Quero abrir um ticket' },
  { icon: Sparkles, text: 'Quais são meus projetos?' },
]

// Detect if user is reporting a site problem (multiple phrasings)
const SITE_PROBLEM_PATTERNS = [
  'site não abre', 'site nao abre', 'site não esta abrindo', 'site nao esta abrindo',
  'meu site', 'site fora do ar', 'site fora', 'site down', 'site caiu',
  'não consigo acessar', 'nao consigo acessar', 'site parou', 'site erro',
  'página não carrega', 'pagina nao carrega', 'tela branca', 'tela preta',
  'meu site não está abrindo', 'meu site nao esta abrindo',
  'aplicação não abre', 'aplicacao nao abre', 'app não abre', 'app nao abre',
]

function isSiteProblemIntent(text: string): boolean {
  const lower = text.toLowerCase().trim()
  return SITE_PROBLEM_PATTERNS.some((p) => lower.includes(p))
}

export default function ChatPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Busca os deploys do usuário (usado pra listar sites quando ele relatar problema)
  const [userDeploys, setUserDeploys] = React.useState<Deploy[]>([])
  React.useEffect(() => {
    fetch('/api/deploys')
      .then((r) => r.json())
      .then((data) => {
        if (data.deploys) setUserDeploys(data.deploys)
      })
      .catch(() => {})
  }, [])

  // Initial greeting from AI
  React.useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'greeting',
          role: 'assistant',
          content: `Olá ${session?.user?.name?.split(' ')[0] ?? ''}! 👋\n\nSou o assistente de suporte da LipeHost. Posso te ajudar com:\n- Diagnosticar problemas nos seus deploys\n- Refazer deploy de sites que não abrem\n- Configurar variáveis de ambiente\n- Abrir tickets de suporte\n\nO que você precisa hoje?`,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }
  }, [session?.user?.name, messages.length])

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    setError('')
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      time: now,
    }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    // ===== Site problem flow: list user's sites as clickable buttons =====
    if (isSiteProblemIntent(text)) {
      // Wait briefly to show "thinking"
      await new Promise((r) => setTimeout(r, 600))

      if (userDeploys.length === 0) {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Estou analisando...\n\nVi que você ainda não tem nenhum deploy criado. Para eu diagnosticar um site, primeiro você precisa fazer um deploy.\n\n**Como criar:**\n1. Vá em **Meus Projetos**\n2. Clique em **Novo Deploy**\n3. Cole a URL do seu repositório GitHub\n\nQuer que eu te ajude com isso?`,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          deployLinks: [],
        }
        setMessages((prev) => [...prev, aiMsg])
        setLoading(false)
        return
      }

      if (userDeploys.length === 1) {
        // Only 1 deploy — auto-diagnose it directly via AI
        const deploy = userDeploys[0]
        const aiPrelude: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Estou analisando seu site **${deploy.name}**...\n\nAguarde, verificando o status HTTP real.`,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          deployLinks: [{ id: deploy.id, name: deploy.name }],
        }
        setMessages((prev) => [...prev, aiPrelude])

        // Now call the AI with the original message + context
        try {
          const historyForApi = newMessages
            .filter((m) => m.id !== 'greeting')
            .map((m) => ({ role: m.role, content: m.content }))

          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: historyForApi }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Erro na IA')

          const aiMsg: ChatMessage = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: data.message,
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            deployLinks: [{ id: deploy.id, name: deploy.name }],
          }
          setMessages((prev) => [...prev, aiMsg])
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erro ao falar com a IA')
        } finally {
          setLoading(false)
        }
        return
      }

      // Multiple deploys — list them as buttons for the user to choose
      const deployList = userDeploys.map((d, i) => `${i + 1}. ${d.name} (${d.status})`).join('\n')
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Estou analisando...\n\nEncontrei **${userDeploys.length} sites** na sua conta. Qual deles está com problema? Clique no site abaixo para que eu verifique:\n\n${deployList}`,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        deployLinks: userDeploys.map((d) => ({ id: d.id, name: d.name })),
      }
      setMessages((prev) => [...prev, aiMsg])
      setLoading(false)
      return
    }

    // ===== Default: call AI directly =====
    try {
      const historyForApi = newMessages
        .filter((m) => m.id !== 'greeting')
        .map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyForApi }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro na IA')

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao falar com a IA')
    } finally {
      setLoading(false)
    }
  }

  // When user clicks a deploy button, navigate to project detail page
  const handleDeployClick = (deployId: string, deployName: string) => {
    // First add a user message indicating the choice
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const userChoice: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `Verificar site: ${deployName}`,
      time: now,
    }
    setMessages((prev) => [...prev, userChoice])

    // Navigate to the project detail page (where they can click Deploy button)
    router.push(`/painel/projetos/${deployId}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const clearChat = () => {
    setMessages([])
    setTimeout(() => {
      setMessages([
        {
          id: 'greeting',
          role: 'assistant',
          content: 'Chat reiniciado. Como posso ajudar?',
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }, 100)
  }

  return (
    <PainelShell>
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Image
              src="/chat-bot-icon-small.png"
              alt="LipeHost Bot"
              width={48}
              height={48}
              className="size-12 rounded-xl"
            />
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Chat de Suporte
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                IA powered por LipeHost · Conhece seus projetos
              </p>
            </div>
          </div>
          {messages.length > 1 && (
            <Button
              onClick={clearChat}
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-600 hover:bg-slate-100"
            >
              <Trash2 className="size-3.5" />
              Limpar
            </Button>
          )}
        </div>

        {/* Chat container */}
        <div className="flex-1 rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col">
          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex items-start gap-3 max-w-[85%]',
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                )}
              >
                {msg.role === 'user' ? (
                  <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <User className="size-4 text-white" />
                  </div>
                ) : (
                  <Image
                    src="/chat-bot-icon-small.png"
                    alt="Bot"
                    width={32}
                    height={32}
                    className="size-8 rounded-full flex-shrink-0 object-cover"
                  />
                )}
                <div className={cn(
                  'rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap',
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-tr-sm'
                    : 'bg-white border border-slate-200 text-slate-900 rounded-tl-sm shadow-sm'
                )}>
                  {msg.content}
                  {/* Render deploy links as clickable buttons */}
                  {msg.deployLinks && msg.deployLinks.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {msg.deployLinks.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => handleDeployClick(d.id, d.name)}
                          className="group flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-400 transition-all text-blue-700 text-xs font-medium"
                        >
                          <ExternalLink className="size-3.5 flex-shrink-0" />
                          <span className="flex-1 truncate">{d.name}</span>
                          <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className={cn(
                    'text-[10px] mt-1.5',
                    msg.role === 'user' ? 'text-white/70' : 'text-slate-400'
                  )}>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-3">
                <Image
                  src="/chat-bot-icon-small.png"
                  alt="Bot"
                  width={32}
                  height={32}
                  className="size-8 rounded-full flex-shrink-0 object-cover"
                />
                <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="size-3 animate-spin text-blue-500" />
                    <span className="text-xs text-slate-500">IA pensando...</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-start gap-2">
                <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Erro</p>
                  <p className="text-xs mt-0.5">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions (only shown initially) */}
          {messages.length <= 1 && (
            <div className="px-4 py-3 border-t border-slate-200 bg-white">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="size-3.5 text-blue-500" />
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Sugestões
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.text}
                    onClick={() => sendMessage(s.text)}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors text-xs text-left disabled:opacity-50"
                  >
                    <s.icon className="size-3.5 flex-shrink-0" />
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 h-11 bg-slate-50 border-slate-200 text-slate-900"
              disabled={loading}
              autoFocus
            />
            <Button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white size-11 p-0"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-[11px] text-slate-400 text-center mt-3">
          A IA tem acesso aos seus deploys para melhor te ajudar. Não compartilhe dados sensíveis.
        </p>
      </div>
    </PainelShell>
  )
}
