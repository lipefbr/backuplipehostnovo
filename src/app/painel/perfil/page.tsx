'use client'

import * as React from 'react'
import { useSession } from 'next-auth/react'
import { User, Mail, Crown, Shield } from 'lucide-react'
import { PainelShell } from '@/components/painel/painel-shell'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function PainelPerfilPage() {
  const { data: session } = useSession()

  return (
    <PainelShell>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Meu Perfil
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Visualize e atualize suas informações
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="size-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {session?.user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{session?.user?.name}</h2>
              <p className="text-sm text-slate-500">{session?.user?.email}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md mt-1 ${
                session?.user?.role === 'ADMIN'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {session?.user?.role === 'ADMIN' ? (
                  <><Crown className="size-3" /> Administrador</>
                ) : (
                  <><Shield className="size-3" /> Assinante</>
                )}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-xs text-slate-700 mb-1.5 block">Nome completo</Label>
              <Input
                value={session?.user?.name ?? ''}
                readOnly
                className="h-10 bg-slate-50 border-slate-200 text-slate-900"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-700 mb-1.5 block">E-mail</Label>
              <Input
                value={session?.user?.email ?? ''}
                readOnly
                className="h-10 bg-slate-50 border-slate-200 text-slate-900"
              />
            </div>
            <div className="pt-2">
              <Button
                disabled
                className="bg-slate-200 text-slate-500 cursor-not-allowed"
              >
                Edição disponível em breve
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PainelShell>
  )
}
