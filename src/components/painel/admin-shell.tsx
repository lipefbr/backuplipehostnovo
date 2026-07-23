'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard, Boxes, Users, CreditCard, Settings,
  LogOut, Search, Menu, X, ExternalLink,
  Crown, ShoppingCart, TrendingUp, FolderKanban,
  Plus, Pencil, Trash2, Eye, EyeOff, Save, XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { NotificationsBell } from '@/components/painel/notifications-bell'

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/sistemas', label: 'Sistemas', icon: Boxes },
  { href: '/admin/projetos', label: 'Projetos', icon: FolderKanban },
  { href: '/admin/usuarios', label: 'Usuários', icon: Users },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/faturas', label: 'Faturas', icon: CreditCard },
  { href: '/admin/config', label: 'Configurações', icon: Settings },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  // NOTE: Auth redirect is handled by middleware (server-side).
  // No client-side redirect needed.
  // If user reaches this component, middleware already verified session cookie exists.

  // If session loaded but user is not admin, redirect to /painel
  React.useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/painel')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090909]">
        <div className="size-8 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
      </div>
    )
  }

  // Use session data if available, fallback to defaults
  // (middleware verified the cookie exists, so user IS logged in)

  const userName = session?.user?.name ?? 'Admin'
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Determine current page title from path
  const currentPage = adminNav.find((n) => n.href === pathname)?.label ?? 'Dashboard'

  return (
    <div className="theme-light min-h-screen flex bg-slate-50">
      {/* ===== Fixed sidebar (desktop) — black, full height ===== */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-shrink-0 bg-[#0a0a0a] border-r border-white/8 flex-col z-40">
        {/* Logo — centralized at top */}
        <div className="h-20 flex items-center justify-center border-b border-white/8 px-6">
          <Link href="/" className="flex items-center justify-center group" aria-label="LipeHost">
            <Image
              src="/lipehost-logo-navbar.png"
              alt="LipeHost"
              width={140}
              height={36}
              priority
              className="h-9 w-auto opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </Link>
        </div>

        {/* Admin badge */}
        <div className="px-3 pt-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30">
            <Crown className="size-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">Painel Admin</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {adminNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/8 space-y-1">
          <Link
            href="/painel"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
          >
            <ExternalLink className="size-4" />
            Ver painel usuário
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="size-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* ===== Mobile sidebar ===== */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-[#0a0a0a] border-r border-white/8 transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/8">
          <Link href="/" className="flex items-center" aria-label="LipeHost" onClick={() => setMobileOpen(false)}>
            <Image
              src="/lipehost-logo-navbar.png"
              alt="LipeHost"
              width={140}
              height={36}
              className="h-9 w-auto opacity-90"
            />
          </Link>
          <button onClick={() => setMobileOpen(false)} className="text-white/60 hover:text-white" aria-label="Fechar menu">
            <X className="size-5" />
          </button>
        </div>
        <div className="px-3 pt-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30">
            <Crown className="size-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">Painel Admin</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {adminNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="px-3 py-4 border-t border-white/8 space-y-1">
          <Link
            href="/painel"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
          >
            <ExternalLink className="size-4" />
            Ver painel usuário
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="size-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* ===== Main content — scrollable, white bg, left margin for fixed sidebar ===== */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-200 bg-white sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-slate-600 hover:text-slate-900"
              aria-label="Abrir menu"
            >
              <Menu className="size-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-amber-600">Admin</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-medium">{currentPage}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="h-9 w-64 pl-9 pr-3 rounded-lg bg-slate-100 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <NotificationsBell theme="light" />
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="size-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-slate-900 leading-tight">{userName}</div>
                <div className="text-[10px] text-amber-600 leading-tight">Administrador</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  )
}
