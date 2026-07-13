'use client'

import Link from 'next/link'
import { ArrowRight, MessageCircle, Rocket } from 'lucide-react'
import { Reveal } from '@/components/reveal'

export function FinalCta() {
  return (
    <section id="contato" className="relative py-24 section-padding border-t border-white/5 overflow-hidden">
      <div className="container-x relative">
        <Reveal direction="scale" className="relative rounded-3xl overflow-hidden border border-white/10">
          {/* gradient bg */}
          <div className="absolute inset-0 gradient-bg opacity-95" />
          {/* grid overlay */}
          <div className="absolute inset-0 grid-bg opacity-30" />
          {/* dark overlay for contrast */}
          <div className="absolute inset-0 bg-[#0a0a0a]/40" />
          {/* glow */}
          <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-white/20 blur-[120px] rounded-full" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-purple-500/40 blur-[140px] rounded-full" />

          <div className="relative px-6 py-16 sm:px-16 sm:py-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm mb-7">
              <Rocket className="size-3.5" />
              Vamos começar
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-white max-w-3xl mx-auto">
              Vamos transformar sua ideia em um sistema profissional?
            </h2>

            <p className="mt-6 text-base sm:text-lg text-white/80 max-w-xl mx-auto">
              Fale com nossa equipe. Sem compromisso, sem custo para orçamento. Resposta em até
              24 horas úteis.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://wa.me/5500000000000?text=Ol%C3%A1%2C%20quero%20solicitar%20um%20or%C3%A7amento"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-white text-[#0a0a0a] font-semibold hover:bg-white/90 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/30"
              >
                <MessageCircle className="size-4" />
                Solicitar orçamento
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </a>
              <Link
                href="/loja"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-xl border border-white/40 bg-white/10 backdrop-blur-sm text-white font-semibold hover:bg-white/20 transition-all"
              >
                Conhecer Loja
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-white/70">
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-emerald-300 animate-pulse" />
                Resposta em 24h
              </div>
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-emerald-300" />
                Orçamento sem custo
              </div>
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-emerald-300" />
                Atendimento humano
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
