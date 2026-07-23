'use client'

import * as React from 'react'
import {
  Users, Search, Loader2, Crown, User as UserIcon, Trash2, Shield,
} from 'lucide-react'
import { AdminShell } from '@/components/painel/admin-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSession } from 'next-auth/react'

interface UserRow {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  _count?: { projects: number; orders: number }
}

export default function AdminUsuariosPage() {
  const { data: session } = useSession()
  const [users, setUsers] = React.useState<UserRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [search, setSearch] = React.useState('')

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro')
      setUsers(data.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchUsers()
  }, [])

  const filtered = users.filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  return (
    <AdminShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Usuários
          </h1>
          <p className="text-sm text-slate-900/55 mt-1">
            {users.length} usuário(s) cadastrado(s)
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-900/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="h-11 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-900/40 rounded-xl"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-amber-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="size-12 text-slate-900/20 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">Nenhum usuário</h3>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full hidden md:table">
              <thead className="border-b border-slate-200">
                <tr className="text-left text-xs uppercase tracking-wider text-slate-900/40">
                  <th className="px-5 py-3 font-medium">Usuário</th>
                  <th className="px-5 py-3 font-medium">Tipo</th>
                  <th className="px-5 py-3 font-medium">Projetos</th>
                  <th className="px-5 py-3 font-medium">Pedidos</th>
                  <th className="px-5 py-3 font-medium">Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`size-9 rounded-full flex items-center justify-center text-slate-900 text-xs font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                            : 'gradient-bg'
                        }`}>
                          {u.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">
                            {u.name}
                            {u.id === (session?.user as { id?: string })?.id && (
                              <span className="ml-2 text-[10px] text-amber-400">(você)</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-900/40">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {u.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
                          <Crown className="size-3" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-400">
                          <UserIcon className="size-3" /> Usuário
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-900/70">{u._count?.projects ?? 0}</td>
                    <td className="px-5 py-4 text-sm text-slate-900/70">{u._count?.orders ?? 0}</td>
                    <td className="px-5 py-4 text-xs text-slate-900/50">
                      {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-white/5">
              {filtered.map((u) => (
                <div key={u.id} className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`size-10 rounded-full flex items-center justify-center text-slate-900 text-xs font-bold ${
                      u.role === 'ADMIN' ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'gradient-bg'
                    }`}>
                      {u.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 text-sm">{u.name}</div>
                      <div className="text-xs text-slate-900/40">{u.email}</div>
                    </div>
                    {u.role === 'ADMIN' ? (
                      <Crown className="size-4 text-amber-400" />
                    ) : (
                      <UserIcon className="size-4 text-blue-400" />
                    )}
                  </div>
                  <div className="text-xs text-slate-900/50">
                    {u._count?.projects ?? 0} projetos · {u._count?.orders ?? 0} pedidos
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
