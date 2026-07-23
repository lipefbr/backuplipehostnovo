'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { LogOut, LayoutDashboard, User as UserIcon, ChevronDown, Crown, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * UserMenu — shows either:
 * - "Entrar" button (when logged out)
 * - Avatar + name + dropdown with 'Painel'/'Admin' + 'Sair' (when logged in)
 */
export function UserMenu({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Loading state — show "Entrar" as placeholder (will update when session loads)
  // This prevents showing "Entrar" to logged-in users while session is loading
  if (status === 'loading') {
    return (
      <Link href="/login">
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            'font-medium gap-1.5 opacity-50',
            variant === 'light'
              ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          )}
        >
          <LogIn className="size-4" />
          Entrar
        </Button>
      </Link>
    )
  }

  // Not logged in — show "Entrar" button
  if (!session?.user) {
    return (
      <Link href="/login">
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            'font-medium gap-1.5',
            variant === 'light'
              ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          )}
        >
          <LogIn className="size-4" />
          Entrar
        </Button>
      </Link>
    )
  }

  // Logged in — show avatar + name + dropdown
  const userName = session?.user?.name ?? 'Usuário'
  const userEmail = session?.user?.email ?? ''
  const userRole = (session?.user as { role?: string })?.role
  const isAdmin = userRole === 'ADMIN'
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const dashboardUrl = isAdmin ? '/admin' : '/painel'

  return (
    <div className="flex items-center gap-2">
      {/* Painel button — visible next to avatar */}
      <Link href={dashboardUrl}>
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            'font-medium gap-1.5',
            variant === 'light'
              ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          )}
        >
          <LayoutDashboard className="size-4" />
          <span className="hidden sm:inline">{isAdmin ? 'Admin' : 'Painel'}</span>
        </Button>
      </Link>

      {/* Avatar + name + dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'flex items-center gap-2 h-9 pl-1.5 pr-2.5 rounded-full transition-colors',
            variant === 'light'
              ? 'hover:bg-slate-100'
              : 'hover:bg-white/10'
          )}
        >
          <div className={cn(
            'size-7 rounded-full flex items-center justify-center text-white text-xs font-bold',
            isAdmin
              ? 'bg-gradient-to-br from-amber-500 to-orange-500'
              : 'bg-gradient-to-br from-blue-500 to-purple-600'
          )}>
            {initials}
          </div>
          <span className={cn(
            'hidden sm:block text-sm font-semibold max-w-[100px] truncate',
            variant === 'light' ? 'text-slate-900' : 'text-white'
          )}>
            {userName.split(' ')[0]}
          </span>
          <ChevronDown className={cn(
            'size-3.5 transition-transform',
            open && 'rotate-180',
            variant === 'light' ? 'text-slate-500' : 'text-white/50'
          )} />
        </button>

      {open && (
        <div className={cn(
          'absolute right-0 top-full mt-2 w-64 rounded-xl border shadow-xl overflow-hidden z-50',
          variant === 'light' ? 'bg-white border-slate-200' : 'bg-[#0c0c0c] border-white/10'
        )}>
          {/* User info */}
          <div className={cn(
            'p-4 border-b',
            variant === 'light' ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/[0.02]'
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                'size-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0',
                isAdmin
                  ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                  : 'bg-gradient-to-br from-blue-500 to-purple-600'
              )}>
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className={cn(
                  'text-sm font-bold truncate',
                  variant === 'light' ? 'text-slate-900' : 'text-white'
                )}>
                  {userName}
                </div>
                <div className={cn(
                  'text-xs truncate',
                  variant === 'light' ? 'text-slate-500' : 'text-white/50'
                )}>
                  {userEmail}
                </div>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                    <Crown className="size-2.5" />
                    ADMIN
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            <Link
              href={dashboardUrl}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors',
                variant === 'light'
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              )}
            >
              <LayoutDashboard className="size-4" />
              {isAdmin ? 'Painel Admin' : 'Meu Painel'}
            </Link>
            <Link
              href={isAdmin ? '/admin/sistemas' : '/painel/projetos'}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors',
                variant === 'light'
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              )}
            >
              <UserIcon className="size-4" />
              {isAdmin ? 'Gerenciar Sistemas' : 'Meus Projetos'}
            </Link>
          </div>

          {/* Logout */}
          <div className={cn('border-t py-1.5', variant === 'light' ? 'border-slate-200' : 'border-white/10')}>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className={cn(
                'w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors',
                variant === 'light'
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-red-400 hover:bg-red-500/10'
              )}
            >
              <LogOut className="size-4" />
              Sair
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
