'use client'

import { PROCESS_STEPS } from '@/lib/content'
import { Reveal } from '@/components/reveal'

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative py-24 section-padding border-t border-white/5 bg-[#0a0a0a]">
      <div className="container-x">
        <Reveal direction="up" className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 mb-5">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Como funciona
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Do conceito à{' '}
            <span className="gradient-text">produção</span>
          </h2>
          <p className="mt-5 text-base text-white/60">
            Um processo claro e transparente. Você sabe exatamente o que esperar em cada etapa.
          </p>
        </Reveal>

        <div className="relative">
          {/* connecting line */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {PROCESS_STEPS.map((step, i) => (
              <Reveal key={step.number} delay={i * 0.12} direction="up">
                <div className="relative text-center lg:text-left">
                  {/* step circle */}
                  <div className="relative mx-auto lg:mx-0 mb-6 size-24 rounded-full bg-[#111] border border-white/10 flex items-center justify-center group hover:border-blue-500/40 transition-colors">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all" />
                    <span className="relative text-2xl font-extrabold gradient-text">{step.number}</span>
                    {/* pulse */}
                    <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-ping" style={{ animationDuration: '3s' }} />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/55 leading-relaxed">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
