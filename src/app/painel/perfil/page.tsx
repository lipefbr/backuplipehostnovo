'use client'

import * as React from 'react'
import { useSession } from 'next-auth/react'
import {
  User, Mail, Phone, MapPin, Camera, Key, CreditCard, Crown,
  Save, Loader2, Check, Eye, EyeOff, Calendar, Package, Database,
  Rocket, ShoppingBag, X,
} from 'lucide-react'
import { PainelShell } from '@/components/painel/painel-shell'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  avatar: string | null
  username: string | null
  phone: string | null
  addressStreet: string | null
  addressNumber: string | null
  addressComplement: string | null
  addressNeighborhood: string | null
  addressCity: string | null
  addressState: string | null
  addressZip: string | null
  plan: string
  planStatus: string
  planRenewalDate: string | null
  totalSpent: string
  ordersCount: number
  deploysCount: number
  databasesCount: number
  recentOrders: Array<{ id: string; planName: string | null; price: string | null; status: string; date: string }>
  recentDeploys: Array<{ id: string; name: string; status: string; createdAt: string }>
  recentDatabases: Array<{ id: string; name: string; engine: string; status: string; createdAt: string }>
  createdAt: string
}

const PLAN_INFO: Record<string, { label: string; color: string; icon: React.ReactNode; benefits: string[] }> = {
  FREE: {
    label: 'FREE',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: <User className="size-3" />,
    benefits: ['1 deploy', '1 banco de dados', 'Suporte por ticket'],
  },
  STARTER: {
    label: 'STARTER',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <Rocket className="size-3" />,
    benefits: ['10 deploys', '5 bancos de dados', 'Suporte prioritário', 'Domínio personalizado'],
  },
  PRO: {
    label: 'PRO',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: <Crown className="size-3" />,
    benefits: ['Deploys ilimitados', 'Bancos ilimitados', 'Suporte 24/7', 'Domínios ilimitados', 'SSL dedicado'],
  },
  ENTERPRISE: {
    label: 'ENTERPRISE',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: <Crown className="size-3" />,
    benefits: ['Tudo do PRO', 'Servidor dedicado', 'SLA garantido', 'Onboarding personalizado', 'Gerente de conta'],
  },
}

export default function PainelPerfilPage() {
  const { data: session, update: updateSession } = useSession()
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [savedMessage, setSavedMessage] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  // Form state
  const [form, setForm] = React.useState({
    name: '',
    username: '',
    phone: '',
    addressStreet: '',
    addressNumber: '',
    addressComplement: '',
    addressNeighborhood: '',
    addressCity: '',
    addressState: '',
    addressZip: '',
  })

  // Password form
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = React.useState({ current: false, new: false, confirm: false })
  const [savingPassword, setSavingPassword] = React.useState(false)
  const [passwordMessage, setPasswordMessage] = React.useState<string | null>(null)

  // Avatar
  const [avatar, setAvatar] = React.useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const loadProfile = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/user/profile')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setProfile(data.user)
      setAvatar(data.user.avatar)
      setForm({
        name: data.user.name || '',
        username: data.user.username || '',
        phone: data.user.phone || '',
        addressStreet: data.user.addressStreet || '',
        addressNumber: data.user.addressNumber || '',
        addressComplement: data.user.addressComplement || '',
        addressNeighborhood: data.user.addressNeighborhood || '',
        addressCity: data.user.addressCity || '',
        addressState: data.user.addressState || '',
        addressZip: data.user.addressZip || '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfil')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSavedMessage(null)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSavedMessage('Perfil atualizado com sucesso!')
      setTimeout(() => setSavedMessage(null), 3000)
      // Update session display name if name changed
      if (data.user?.name !== session?.user?.name) {
        await updateSession({ user: { name: data.user.name } })
      }
      await loadProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage('❌ As senhas novas não coincidem')
      return
    }
    setSavingPassword(true)
    setPasswordMessage(null)
    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPasswordMessage('✓ Senha alterada com sucesso!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setPasswordMessage(null), 3000)
    } catch (err) {
      setPasswordMessage(`❌ ${err instanceof Error ? err.message : 'Erro ao alterar senha'}`)
    } finally {
      setSavingPassword(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 1024 * 1024) {
      setError('Imagem muito grande (máx 1MB)')
      return
    }
    setUploadingAvatar(true)
    try {
      // Convert to base64 data URL
      const reader = new FileReader()
      reader.onload = async () => {
        const dataUrl = reader.result as string
        const res = await fetch('/api/user/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: dataUrl }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setAvatar(dataUrl)
        setUploadingAvatar(false)
        await loadProfile()
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar avatar')
      setUploadingAvatar(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!confirm('Remover foto de perfil?')) return
    setUploadingAvatar(true)
    try {
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: '' }),
      })
      if (!res.ok) throw new Error('Erro ao remover avatar')
      setAvatar(null)
      await loadProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setUploadingAvatar(false)
    }
  }

  if (loading) {
    return (
      <PainelShell>
        <div className="max-w-3xl mx-auto p-8">
          <Loader2 className="size-8 text-slate-400 animate-spin mx-auto" />
          <p className="text-center text-sm text-slate-500 mt-3">Carregando perfil...</p>
        </div>
      </PainelShell>
    )
  }

  if (!profile) return null

  const planInfo = PLAN_INFO[profile.plan] || PLAN_INFO.FREE

  return (
    <PainelShell>
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Meu Perfil
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Visualize e atualize suas informações pessoais, assinatura e segurança
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <X className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-900 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Profile card with avatar */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-5 flex-wrap">
            {/* Avatar */}
            <div className="relative group">
              <div className="size-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="Avatar" className="size-full object-cover" />
                ) : (
                  <span>{profile.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 size-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
                title="Trocar foto"
              >
                {uploadingAvatar ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
                {profile.username && (
                  <span className="text-sm text-slate-500 font-mono">@{profile.username}</span>
                )}
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                <Mail className="size-3" /> {profile.email}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border ${planInfo.color}`}>
                  {planInfo.icon} Plano {planInfo.label}
                </span>
                {profile.role === 'ADMIN' && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 border border-amber-200">
                    <Crown className="size-3" /> Admin
                  </span>
                )}
                <span className="text-xs text-slate-500">
                  Membro desde {new Date(profile.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {avatar && (
                <button
                  onClick={handleRemoveAvatar}
                  className="text-xs text-red-500 hover:text-red-700 mt-2"
                >
                  Remover foto
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Personal info form */}
        <form onSubmit={handleSaveProfile} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="size-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Informações Pessoais</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-slate-700 mb-1.5 block">Nome completo *</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-10 bg-white border-slate-300 text-slate-900"
                placeholder="Seu nome completo"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-700 mb-1.5 block">Username (opcional)</Label>
              <Input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="h-10 bg-white border-slate-300 text-slate-900 font-mono"
                placeholder="seunome"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-700 mb-1.5 block">E-mail</Label>
              <Input
                value={profile.email}
                readOnly
                className="h-10 bg-slate-50 border-slate-200 text-slate-500"
              />
              <p className="text-xs text-slate-400 mt-1">E-mail não pode ser alterado</p>
            </div>
            <div>
              <Label className="text-xs text-slate-700 mb-1.5 block">Telefone (opcional)</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="h-10 bg-white border-slate-300 text-slate-900"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          {/* Address */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="size-4 text-slate-500" />
              <h4 className="text-sm font-bold text-slate-900">Endereço (opcional)</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Label className="text-xs text-slate-700 mb-1.5 block">Rua / Logradouro</Label>
                <Input
                  value={form.addressStreet}
                  onChange={(e) => setForm({ ...form, addressStreet: e.target.value })}
                  className="h-10 bg-white border-slate-300 text-slate-900"
                  placeholder="Rua Exemplo"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-700 mb-1.5 block">Número</Label>
                <Input
                  value={form.addressNumber}
                  onChange={(e) => setForm({ ...form, addressNumber: e.target.value })}
                  className="h-10 bg-white border-slate-300 text-slate-900"
                  placeholder="123"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs text-slate-700 mb-1.5 block">Complemento</Label>
                <Input
                  value={form.addressComplement}
                  onChange={(e) => setForm({ ...form, addressComplement: e.target.value })}
                  className="h-10 bg-white border-slate-300 text-slate-900"
                  placeholder="Apto 45, Bloco B"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-700 mb-1.5 block">Bairro</Label>
                <Input
                  value={form.addressNeighborhood}
                  onChange={(e) => setForm({ ...form, addressNeighborhood: e.target.value })}
                  className="h-10 bg-white border-slate-300 text-slate-900"
                  placeholder="Centro"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-700 mb-1.5 block">Cidade</Label>
                <Input
                  value={form.addressCity}
                  onChange={(e) => setForm({ ...form, addressCity: e.target.value })}
                  className="h-10 bg-white border-slate-300 text-slate-900"
                  placeholder="São Paulo"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-700 mb-1.5 block">Estado (UF)</Label>
                <Input
                  value={form.addressState}
                  onChange={(e) => setForm({ ...form, addressState: e.target.value.toUpperCase().slice(0, 2) })}
                  className="h-10 bg-white border-slate-300 text-slate-900 font-mono uppercase"
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
              <div>
                <Label className="text-xs text-slate-700 mb-1.5 block">CEP</Label>
                <Input
                  value={form.addressZip}
                  onChange={(e) => setForm({ ...form, addressZip: e.target.value })}
                  className="h-10 bg-white border-slate-300 text-slate-900 font-mono"
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Salvar alterações
            </Button>
            {savedMessage && (
              <p className="text-sm text-emerald-700 flex items-center gap-1">
                <Check className="size-4" /> {savedMessage}
              </p>
            )}
          </div>
        </form>

        {/* Subscription */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="size-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Assinatura</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Plano atual</p>
              <p className="text-lg font-bold text-slate-900 flex items-center gap-1 mt-1">
                {planInfo.icon} {planInfo.label}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Status</p>
              <p className={`text-sm font-semibold mt-1 ${
                profile.planStatus === 'active' ? 'text-emerald-700' :
                profile.planStatus === 'trialing' ? 'text-blue-700' :
                profile.planStatus === 'past_due' ? 'text-amber-700' :
                'text-red-700'
              }`}>
                {profile.planStatus === 'active' ? '✓ Ativo' :
                 profile.planStatus === 'trialing' ? 'Em trial' :
                 profile.planStatus === 'past_due' ? 'Pagamento pendente' :
                 'Cancelado'}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Renovação</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                {profile.planRenewalDate
                  ? new Date(profile.planRenewalDate).toLocaleDateString('pt-BR')
                  : '—'
                }
              </p>
            </div>
          </div>

          {/* Plan benefits */}
          <div className="rounded-lg border border-slate-200 p-4 mb-4">
            <p className="text-xs font-semibold text-slate-700 mb-2">Benefícios do plano {planInfo.label}:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {planInfo.benefits.map((b, i) => (
                <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                  <Check className="size-3 text-emerald-600" /> {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Usage stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <Rocket className="size-4 text-blue-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-blue-900">{profile.deploysCount}</p>
              <p className="text-xs text-blue-700">Deploys</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3 text-center">
              <Database className="size-4 text-purple-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-purple-900">{profile.databasesCount}</p>
              <p className="text-xs text-purple-700">Bancos</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 text-center">
              <ShoppingBag className="size-4 text-emerald-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-emerald-900">{profile.ordersCount}</p>
              <p className="text-xs text-emerald-700">Pedidos</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-center">
              <CreditCard className="size-4 text-amber-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-amber-900">R$ {profile.totalSpent}</p>
              <p className="text-xs text-amber-700">Total gasto</p>
            </div>
          </div>

          {profile.plan === 'FREE' && (
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <Crown className="size-4" /> Fazer upgrade de plano
            </Button>
          )}
        </div>

        {/* Payments history */}
        {profile.recentOrders.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="size-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Histórico de Pagamentos</h3>
            </div>
            <div className="space-y-2">
              {profile.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {order.planName || 'Pedido'}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(order.date).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-semibold text-slate-900">{order.price || '—'}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                      order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {order.status === 'paid' ? 'Pago' :
                       order.status === 'pending' ? 'Pendente' :
                       order.status === 'cancelled' ? 'Cancelado' :
                       order.status === 'refunded' ? 'Reembolsado' : order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Change password */}
        <form onSubmit={handleChangePassword} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Key className="size-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Alterar Senha</h3>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs text-slate-700 mb-1.5 block">Senha atual</Label>
              <div className="relative">
                <Input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                  className="h-10 bg-white border-slate-300 text-slate-900 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPasswords.current ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-700 mb-1.5 block">Nova senha</Label>
                <div className="relative">
                  <Input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    minLength={6}
                    className="h-10 bg-white border-slate-300 text-slate-900 pr-10"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.new ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label className="text-xs text-slate-700 mb-1.5 block">Confirmar nova senha</Label>
                <div className="relative">
                  <Input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                    className="h-10 bg-white border-slate-300 text-slate-900 pr-10"
                    placeholder="Repita a nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={savingPassword} className="bg-blue-600 hover:bg-blue-700 text-white">
              {savingPassword ? <Loader2 className="size-4 animate-spin" /> : <Key className="size-4" />}
              Alterar senha
            </Button>
            {passwordMessage && (
              <p className={`text-sm ${passwordMessage.startsWith('✓') ? 'text-emerald-700' : 'text-red-700'}`}>
                {passwordMessage}
              </p>
            )}
          </div>
        </form>

        {/* Account meta */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 space-y-1">
          <p>ID: <code className="font-mono">{profile.id}</code></p>
          <p>Conta criada em: {new Date(profile.createdAt).toLocaleString('pt-BR')}</p>
          <p>Função: {profile.role === 'ADMIN' ? 'Administrador' : 'Usuário'}</p>
        </div>
      </div>
    </PainelShell>
  )
}
