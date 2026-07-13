'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { WHAT_WE_DO_TAGS } from '@/lib/content'
import { Reveal } from '@/components/reveal'

export function CustomDev() {
  return (
    <section id="custom-dev" className="relative py-24 section-padding border-t border-white/5 overflow-hidden">
      {/* big glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-gradient-to-br from-blue-500/15 to-purple-500/15 blur-[140px] rounded-full pointer-events-none" />

      <div className="container-x relative">
        <div className="relative rounded-3xl border border-white/10 bg-[#0c0c0c] p-10 sm:p-16 overflow-hidden">
          {/* grid bg */}
          <div className="absolute inset-0 grid-bg grid-bg-radial opacity-50" />

          <div className="relative grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <Reveal direction="right">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-medium text-blue-300 mb-6">
                <Sparkles className="size-3.5" />
                Desenvolvimento personalizado
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-5">
                Não encontrou o sistema ideal?
              </h2>
              <p className="text-base text-white/60 leading-relaxed mb-8">
                Criamos qualquer sistema sob medida para sua empresa. Desde um MVP para validar sua
                ideia até plataformas complexas com milhões de usuários. Nossa equipe domina todo o
                ciclo: discovery, design, desenvolvimento, infraestrutura e suporte.
              </p>

              <div className="flex flex-wrap gap-2 mb-9">
                {WHAT_WE_DO_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-300 transition-all cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <Link href="#contato">
                <button className="group inline-flex items-center gap-2 h-12 px-7 rounded-xl gradient-bg text-white font-semibold hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:scale-[1.02]">
                  Solicitar Projeto
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
            </Reveal>

            {/* Right — visual */}
            <Reveal direction="left" delay={0.15} className="relative h-[400px] hidden lg:block">
              {/* Big stacked cards */}
              <div className="absolute top-0 right-0 w-[320px] rounded-2xl border border-white/10 bg-[#111] p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-white/50">Sistema Personalizado</div>
                  <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-2xl font-bold gradient-text mb-4">Build #4271</div>
                <div className="space-y-2">
                  {['Setup do projeto', 'Design system', 'Backend API', 'Frontend', 'Tests', 'Deploy'].map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                      <div className={`size-4 rounded-full flex items-center justify-center text-[8px] ${i < 4 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/40'}`}>
                        {i < 4 ? '✓' : i + 1}
                      </div>
                      <div className={`text-xs ${i < 4 ? 'text-white/80' : 'text-white/40'}`}>{s}</div>
                      {i < 4 && <div className="ml-auto text-[9px] text-emerald-400">done</div>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-12 left-0 w-[260px] rounded-2xl border border-white/10 bg-[#111] p-5 shadow-2xl">
                <div className="text-xs text-white/50 mb-2">Tempo médio</div>
                <div className="text-3xl font-extrabold mb-1">6 sem</div>
                <div className="text-xs text-white/40 mb-3">do conceito ao deploy</div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-[70%] gradient-bg rounded-full" />
                </div>
              </div>

              <div className="absolute top-32 left-12 w-[200px] rounded-2xl border border-white/10 bg-[#111] p-4 shadow-2xl">
                <div className="text-xs text-white/50 mb-2">Tecnologias</div>
                <div className="flex flex-wrap gap-1">
                  {['Flutter', 'Next.js', 'Laravel', 'PostgreSQL', 'Docker', 'AWS'].map((t) => (
                    <span key={t} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
