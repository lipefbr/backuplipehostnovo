'use client'

import * as React from 'react'
import { Bell, CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'info'
  title: string
  description: string
  time: string
  read: boolean
}

// Static demo notifications — will be replaced with real ones later
const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Bem-vindo ao LipeHost! 🎉',
    description: 'Seu painel está pronto. Crie seu primeiro deploy agora.',
    time: 'agora',
    read: false,
  },
  {
    id: '2',
    type: 'info',
    title: 'Novos sistemas disponíveis',
    description: 'Adicionamos 13 sistemas prontos na loja.',
    time: '2h atrás',
    read: false,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Configure SSL no seu domínio',
    description: 'Aponte o DNS e ative o SSL gratuito para lipe.host.',
    time: '1d atrás',
    read: true,
  },
]

export function NotificationsBell({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const [open, setOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<Notification[]>(DEMO_NOTIFICATIONS)
  const ref = React.useRef<HTMLDivElement>(null)

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const iconFor = (type: Notification['type']) => {
    if (type === 'success') return <CheckCircle2 className="size-4 text-emerald-500" />
    if (type === 'warning') return <AlertCircle className="size-4 text-amber-500" />
    return <Info className="size-4 text-blue-500" />
  }

  const isLight = theme === 'light'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'relative size-9 rounded-lg flex items-center justify-center transition-colors',
          isLight
            ? 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            : 'hover:bg-white/5 text-white/60 hover:text-white'
        )}
        aria-label="Notificações"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className={cn(
            'absolute top-1.5 right-1.5 size-2 rounded-full ring-2',
            isLight ? 'bg-red-500 ring-white' : 'bg-red-500 ring-[#0c0c0c]'
          )} />
        )}
      </button>

      {open && (
        <div className={cn(
          'absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border shadow-xl overflow-hidden z-50',
          isLight ? 'bg-white border-slate-200' : 'bg-[#0c0c0c] border-white/10'
        )}>
          {/* Header */}
          <div className={cn(
            'flex items-center justify-between px-4 py-3 border-b',
            isLight ? 'border-slate-200' : 'border-white/10'
          )}>
            <div className="flex items-center gap-2">
              <h3 className={cn('text-sm font-bold', isLight ? 'text-slate-900' : 'text-white')}>
                Notificações
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className={cn(
                    'text-[11px] font-medium hover:underline',
                    isLight ? 'text-blue-600' : 'text-blue-400'
                  )}
                >
                  Marcar todas como lidas
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className={cn(
                  'size-6 rounded flex items-center justify-center',
                  isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-white/5 text-white/40'
                )}
                aria-label="Fechar"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className={cn('py-12 text-center text-sm', isLight ? 'text-slate-400' : 'text-white/40')}>
                <Bell className="size-8 mx-auto mb-2 opacity-30" />
                Sem notificações
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-colors',
                    isLight
                      ? `border-slate-100 ${!n.read ? 'bg-blue-50/50' : ''} hover:bg-slate-50`
                      : `border-white/5 ${!n.read ? 'bg-blue-500/5' : ''} hover:bg-white/5`
                  )}
                >
                  <div className={cn(
                    'size-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    isLight ? 'bg-slate-100' : 'bg-white/5'
                  )}>
                    {iconFor(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={cn('text-xs font-semibold leading-tight', isLight ? 'text-slate-900' : 'text-white')}>
                        {n.title}
                      </h4>
                      {!n.read && <span className="size-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1" />}
                    </div>
                    <p className={cn('text-xs mt-0.5 leading-relaxed', isLight ? 'text-slate-500' : 'text-white/50')}>
                      {n.description}
                    </p>
                    <p className={cn('text-[10px] mt-1', isLight ? 'text-slate-400' : 'text-white/30')}>
                      {n.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className={cn('px-4 py-2.5 border-t', isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/[0.02]')}>
            <button className={cn('text-xs font-medium w-full text-center', isLight ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400')}>
              Ver todas as notificações
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
