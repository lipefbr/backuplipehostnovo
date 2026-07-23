'use client'

import * as React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft, User as UserIcon, Rocket, Database as DbIcon, CreditCard,
  Ticket as TicketIcon, Save, Loader2, Eye, EyeOff, Crown, Plus, ExternalLink,
} from 'lucide-react'
import { AdminShell } from '@/components/painel/admin-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Tab = 'info' | 'deploys' | 'databases' | 'payments' | 'tickets'

export default function AdminUserDetailPage() {
  const params = useParams()
  const userId = params.id as string
  const [userData, setUserData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [tab, setTab] = React.useState<Tab>('info')
  const [editing, setEditing] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', email: '', role: '', plan: '', planStatus: '', phone: '', cpf: '', password: '', sitesForcedOffline: false })
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [showPass, setShowPass] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`)
      const data = await res.json()
      if (res.ok) {
        setUserData(data.user)
        setForm({
          name: data.user.name || '', email: data.user.email || '', role: data.user.role || 'USER',
          plan: data.user.plan || 'FREE', planStatus: data.user.planStatus || 'active',
          phone: data.user.phone || '', cpf: data.user.cpf || '', password: '', sitesForcedOffline: data.user.sitesForcedOffline || false,
        })
      }
    } catch {}
    finally { setLoading(false) }
  }, [userId])

  React.useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    const body: any = { ...form }
    if (!body.password) delete body.password
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
      load()
    }
    setSaving(false)
  }

  if (loading) {
    return <AdminShell><div className="max-w-5xl mx-auto p-8"><Loader2 className="size-8 text-slate-400 animate-spin mx-auto" /></div></AdminShell>
  }

  if (!userData) {
    return <AdminShell><div className="max-w-5xl mx-auto p-8 text-center text-slate-500">Usuário não encontrado</div></AdminShell>
  }

  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: 'info', label: 'Dados', icon: UserIcon },
    { key: 'deploys', label: 'Deploys', icon: Rocket, count: userData.deploys?.length },
    { key: 'databases', label: 'Bancos', icon: DbIcon, count: userData.databases?.length },
    { key: 'payments', label: 'Pagamentos', icon: CreditCard, count: userData.payments?.length },
    { key: 'tickets', label: 'Tickets', icon: TicketIcon, count: userData.tickets?.length },
  ]

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/admin/usuarios" className="size-10 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{userData.name}</h1>
            <p className="text-sm text-slate-500">{userData.email} · {userData.role === 'ADMIN' ? '👑 Admin' : '👤 Usuário'}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full ${userData.sitesForcedOffline ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {userData.sitesForcedOffline ? '🔴 Sites offline' : '🟢 Ativo'}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
                tab === t.key ? 'border-amber-600 text-amber-700 bg-amber-50/50' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}>
              <t.icon className="size-4" /> {t.label}
              {typeof t.count === 'number' && <span className="text-xs bg-slate-100 px-1.5 rounded">{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'info' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900">Dados do Usuário</h3>
              {!editing ? (
                <Button size="sm" onClick={() => setEditing(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
                  <UserIcon className="size-3.5" /> Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
                  <Button size="sm" onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
                    {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />} Salvar
                  </Button>
                </div>
              )}
              {saved && <span className="text-sm text-emerald-700">✓ Salvo!</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs text-slate-600 mb-1 block">Nome</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} readOnly={!editing} className="h-10 text-slate-900" /></div>
              <div><Label className="text-xs text-slate-600 mb-1 block">E-mail</Label>
                <Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} readOnly={!editing} className="h-10 text-slate-900" /></div>
              <div><Label className="text-xs text-slate-600 mb-1 block">Função</Label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} disabled={!editing} className="h-10 w-full px-3 border rounded-lg text-slate-900">
                  <option value="USER">Usuário</option><option value="ADMIN">Admin</option>
                </select></div>
              <div><Label className="text-xs text-slate-600 mb-1 block">Plano</Label>
                <Input value={form.plan} onChange={e => setForm({...form, plan: e.target.value})} readOnly={!editing} className="h-10 text-slate-900" /></div>
              <div><Label className="text-xs text-slate-600 mb-1 block">Status do plano</Label>
                <select value={form.planStatus} onChange={e => setForm({...form, planStatus: e.target.value})} disabled={!editing} className="h-10 w-full px-3 border rounded-lg text-slate-900">
                  <option value="active">Ativo</option><option value="past_due">Atrasado</option><option value="suspended">Suspensa</option><option value="canceled">Cancelada</option>
                </select></div>
              <div><Label className="text-xs text-slate-600 mb-1 block">Telefone</Label>
                <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} readOnly={!editing} className="h-10 text-slate-900" /></div>
              <div><Label className="text-xs text-slate-600 mb-1 block">CPF</Label>
                <Input value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} readOnly={!editing} className="h-10 font-mono text-slate-900" /></div>
              {editing && (
                <div><Label className="text-xs text-slate-600 mb-1 block">Nova senha (deixe vazio para não alterar)</Label>
                  <div className="relative">
                    <Input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="h-10 pr-10 text-slate-900" placeholder="••••••" />
                    <button onClick={() => setShowPass(!showPass)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div></div>
              )}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" checked={form.sitesForcedOffline} onChange={e => setForm({...form, sitesForcedOffline: e.target.checked})} disabled={!editing} className="size-4" />
              <Label className="text-sm text-slate-700">Forçar sites offline</Label>
            </div>
          </div>
        )}

        {tab === 'deploys' && (
          <div className="space-y-3">
            {userData.deploys?.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">Nenhum deploy</div>
            ) : userData.deploys.map((d: any) => (
              <div key={d.id} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{d.name}</h3>
                  <p className="text-xs text-slate-500">{d.framework} · {d.status} · {new Date(d.createdAt).toLocaleDateString('pt-BR')}</p>
                  {d.previewUrl && <a href={d.previewUrl} target="_blank" rel="noopener" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"><ExternalLink className="size-3" /> {d.previewUrl.replace('https://', '')}</a>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${d.status === 'ready' ? 'bg-emerald-100 text-emerald-700' : d.status === 'building' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{d.status}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'databases' && (
          <div className="space-y-3">
            {userData.databases?.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">Nenhum banco de dados</div>
            ) : userData.databases.map((d: any) => (
              <div key={d.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="font-bold text-slate-900">{d.name}</h3>
                <p className="text-xs text-slate-500">{d.engine} · {d.dbName} · {d.status}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'payments' && (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b"><tr>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Plano</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Valor</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Método</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Status</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Data</th>
              </tr></thead>
              <tbody>
                {userData.payments?.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Nenhum pagamento</td></tr>
                ) : userData.payments.map((p: any) => (
                  <tr key={p.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-2">{p.plan?.name || '—'}</td>
                    <td className="px-4 py-2 font-mono">R$ {p.amount.toFixed(2)}</td>
                    <td className="px-4 py-2">{p.paymentMethod === 'pix' ? 'PIX' : 'Cartão'}</td>
                    <td className="px-4 py-2"><span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : p.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{p.status}</span></td>
                    <td className="px-4 py-2 text-xs text-slate-500">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'tickets' && (
          <div className="space-y-3">
            {userData.tickets?.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">Nenhum ticket</div>
            ) : userData.tickets.map((t: any) => (
              <Link key={t.id} href={`/admin/tickets?id=${t.id}`} className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-amber-300 hover:bg-amber-50/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">#{t.ticketNumber} · {t.subject}</h3>
                    <p className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === 'open' ? 'bg-blue-100 text-blue-700' : t.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{t.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  )
}
