'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  LifeBuoy, MessageCircle, Mail, Phone, Ticket as TicketIcon,
  CheckCircle2, ArrowUpRight,
} from 'lucide-react'
import { PainelShell } from '@/components/painel/painel-shell'

export default function PainelSuportePage() {
  return (
    <PainelShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Suporte
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Estamos aqui para ajudar — escolha o canal preferido
          </p>
        </div>

        {/* Main channels — Chat IA + Tickets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Chat IA */}
          <Link
            href="/painel/chat"
            className="group rounded-xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50 p-6 hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <div className="size-12 rounded-xl overflow-hidden flex items-center justify-center mb-3 group-hover:scale-110 transition-transform bg-[#0a0a0a]">
              <Image
                src="/chat-bot-icon-small.png"
                alt="LipeHost Bot"
                width={48}
                height={48}
                className="size-12 object-cover"
              />
            </div>
            <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              Chat com IA
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE
              </span>
            </h3>
            <p className="text-xs text-slate-600 mb-2">Resposta imediata, conhece seus projetos</p>
            <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold group-hover:gap-2 transition-all">
              Abrir chat
              <ArrowUpRight className="size-3" />
            </span>
          </Link>

          {/* Tickets */}
          <Link
            href="/painel/tickets"
            className="group rounded-xl border border-slate-200 bg-white p-6 hover:border-purple-300 hover:bg-purple-50 transition-all"
          >
            <div className="size-12 rounded-xl bg-purple-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <TicketIcon className="size-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Tickets de Suporte</h3>
            <p className="text-xs text-slate-500 mb-2">Para problemas que precisam de atendimento humano</p>
            <span className="inline-flex items-center gap-1 text-xs text-purple-600 font-semibold group-hover:gap-2 transition-all">
              Abrir ticket
              <ArrowUpRight className="size-3" />
            </span>
          </Link>
        </div>

        {/* Other channels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="https://wa.me/5500000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-slate-200 bg-white p-5 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
          >
            <div className="size-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
              <MessageCircle className="size-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-0.5">WhatsApp</h3>
            <p className="text-xs text-slate-500">Resposta em até 1h útil</p>
          </a>

          <a
            href="mailto:contato@lipe.host"
            className="rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <div className="size-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
              <Mail className="size-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-0.5">E-mail</h3>
            <p className="text-xs text-slate-500">contato@lipe.host</p>
          </a>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="size-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
              <Phone className="size-5 text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-0.5">Telefone</h3>
            <p className="text-xs text-slate-500">24/7 para clientes Pro</p>
          </div>
        </div>

        {/* Help card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <LifeBuoy className="size-4 text-blue-600" />
            Precisa de ajuda com deploy?
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Se você está tendo problemas para fazer deploy de um repositório,
            verifique se:
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              O repositório é público no GitHub
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              Há um arquivo <code className="bg-slate-100 px-1 rounded text-xs">package.json</code> na raiz
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              O build command e output directory estão corretos
            </li>
          </ul>
        </div>
      </div>
    </PainelShell>
  )
}
