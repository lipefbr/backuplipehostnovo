'use client'

import * as React from 'react'
import { Settings, Save, Loader2, Check, Eye, EyeOff, Key } from 'lucide-react'
import { AdminShell } from '@/components/painel/admin-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminConfigPage() {
  const [settings, setSettings] = React.useState({
    mp_access_token: '',
    mp_public_key: '',
    mp_client_id: '',
    mp_client_secret: '',
    mp_sandbox: 'true',
    cron_secret: '',
    support_whatsapp: '',
    support_email: '',
  })
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showSecrets, setShowSecrets] = React.useState<Record<string, boolean>>({})

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (res.ok) setSettings(data.settings)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  React.useEffect(() => { load() }, [load])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const toggleSecret = (key: string) => {
    setShowSecrets({ ...showSecrets, [key]: !showSecrets[key] })
  }

  if (loading) {
    return (
      <AdminShell>
        <div className="max-w-2xl mx-auto p-8">
          <Loader2 className="size-8 text-slate-400 animate-spin mx-auto" />
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Settings className="size-7 text-amber-600" />
            Configurações
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Edite as credenciais de pagamento e configurações do sistema
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            {error}
          </div>
        )}

        {/* Mercado Pago credentials */}
        <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Key className="size-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">Credenciais do Mercado Pago</h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Configure as credenciais da sua conta do Mercado Pago. Use credenciais de teste (sandbox) para testar
            e credenciais de produção para cobranças reais.
          </p>

          {/* Access Token */}
          <div>
            <Label className="text-xs text-slate-700 mb-1.5 block">Access Token</Label>
            <div className="relative">
              <Input
                type={showSecrets.mp_access_token ? 'text' : 'password'}
                value={settings.mp_access_token}
                onChange={(e) => setSettings({ ...settings, mp_access_token: e.target.value })}
                className="h-10 pr-10 font-mono text-sm text-slate-900"
                placeholder="APP_USR-xxxxx..."
              />
              <button type="button" onClick={() => toggleSecret('mp_access_token')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showSecrets.mp_access_token ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Public Key */}
          <div>
            <Label className="text-xs text-slate-700 mb-1.5 block">Public Key</Label>
            <Input
              value={settings.mp_public_key}
              onChange={(e) => setSettings({ ...settings, mp_public_key: e.target.value })}
              className="h-10 font-mono text-sm text-slate-900"
              placeholder="APP_USR-xxxxx..."
            />
          </div>

          {/* Client ID */}
          <div>
            <Label className="text-xs text-slate-700 mb-1.5 block">Client ID</Label>
            <Input
              value={settings.mp_client_id}
              onChange={(e) => setSettings({ ...settings, mp_client_id: e.target.value })}
              className="h-10 font-mono text-sm text-slate-900"
              placeholder="7328670002668756"
            />
          </div>

          {/* Client Secret */}
          <div>
            <Label className="text-xs text-slate-700 mb-1.5 block">Client Secret</Label>
            <div className="relative">
              <Input
                type={showSecrets.mp_client_secret ? 'text' : 'password'}
                value={settings.mp_client_secret}
                onChange={(e) => setSettings({ ...settings, mp_client_secret: e.target.value })}
                className="h-10 pr-10 font-mono text-sm text-slate-900"
                placeholder="sdKJxxxxx..."
              />
              <button type="button" onClick={() => toggleSecret('mp_client_secret')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showSecrets.mp_client_secret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Sandbox toggle */}
          <div>
            <Label className="text-xs text-slate-700 mb-1.5 block">Modo Sandbox</Label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sandbox"
                  checked={settings.mp_sandbox === 'true'}
                  onChange={() => setSettings({ ...settings, mp_sandbox: 'true' })}
                  className="size-4"
                />
                <span className="text-sm text-slate-700">Sandbox (teste)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sandbox"
                  checked={settings.mp_sandbox === 'false'}
                  onChange={() => setSettings({ ...settings, mp_sandbox: 'false' })}
                  className="size-4"
                />
                <span className="text-sm text-slate-700">Produção (real)</span>
              </label>
            </div>
          </div>

          {/* Cron Secret */}
          <div className="pt-4 border-t border-slate-100">
            <Label className="text-xs text-slate-700 mb-1.5 block">Cron Secret (token do cron job)</Label>
            <Input
              value={settings.cron_secret}
              onChange={(e) => setSettings({ ...settings, cron_secret: e.target.value })}
              className="h-10 font-mono text-sm text-slate-900"
              placeholder="lipehost-cron-secret-2026"
            />
            <p className="text-xs text-slate-400 mt-1">
              URL do cron: <code className="font-mono bg-slate-100 px-1 rounded">/api/payments/cron?token=TOKEN</code>
            </p>
          </div>

          {/* Support contact */}
          <div className="pt-4 border-t border-slate-100">
            <Label className="text-xs text-slate-700 mb-1.5 block">WhatsApp de Suporte (com DDI)</Label>
            <Input
              value={settings.support_whatsapp}
              onChange={(e) => setSettings({ ...settings, support_whatsapp: e.target.value })}
              className="h-10 font-mono text-sm text-slate-900"
              placeholder="5511999999999"
            />
            <p className="text-xs text-slate-400 mt-1">Formato: 55 + DDD + número (ex: 5511987654321)</p>
          </div>
          <div>
            <Label className="text-xs text-slate-700 mb-1.5 block">E-mail de Suporte</Label>
            <Input
              value={settings.support_email}
              onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
              className="h-10 text-sm text-slate-900"
              placeholder="contato@lipe.host"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Salvar configurações
            </Button>
            {saved && (
              <p className="text-sm text-emerald-700 flex items-center gap-1">
                <Check className="size-4" /> Salvo com sucesso!
              </p>
            )}
          </div>
        </form>

        {/* Webhook info */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
          <h3 className="text-sm font-bold text-slate-900">Configuração do Webhook</h3>
          <p className="text-xs text-slate-600">
            Configure no painel do Mercado Pago a URL de notificação:
          </p>
          <div className="px-3 py-2 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono">
            https://lipe.host/api/payments/webhook
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Eventos a serem notificados: <code className="font-mono bg-slate-100 px-1 rounded">payment</code>
          </p>
        </div>
      </div>
    </AdminShell>
  )
}
