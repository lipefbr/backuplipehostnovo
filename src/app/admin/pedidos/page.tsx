'use client'

import * as React from 'react'
import { ShoppingCart, Loader2, RefreshCw } from 'lucide-react'
import { AdminShell } from '@/components/painel/admin-shell'
import { Button } from '@/components/ui/button'

interface Order {
  id: string
  planName: string | null
  price: string | null
  status: string
  createdAt: string
  user: { name: string; email: string }
}

export default function AdminPedidosPage() {
  const [orders, setOrders] = React.useState<Order[]>([])
  const [loading, setLoading] = React.useState(true)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      if (res.ok) setOrders(data.orders || [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  React.useEffect(() => { load() }, [load])

  return (
    <AdminShell>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <ShoppingCart className="size-7 text-amber-600" />
              Pedidos
            </h1>
            <p className="text-sm text-slate-500 mt-1">{orders.length} pedidos no total</p>
          </div>
          <Button variant="ghost" size="sm" onClick={load} className="text-slate-600">
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center"><Loader2 className="size-8 text-slate-400 animate-spin mx-auto" /></div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <ShoppingCart className="size-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Nenhum pedido</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Cliente</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Plano/Sistema</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Preço</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{o.user.name}</p>
                        <p className="text-xs text-slate-500">{o.user.email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{o.planName || '—'}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-900">{o.price || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          o.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                          o.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>{o.status}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{new Date(o.createdAt).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
