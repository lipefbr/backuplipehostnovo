'use client'

import { Star, Quote } from 'lucide-react'
import { TESTIMONIALS } from '@/lib/content'
import { Reveal, Stagger, StaggerItem } from '@/components/reveal'

export function Testimonials() {
  return (
    <section className="relative py-24 section-padding border-t border-white/5 bg-[#0a0a0a] overflow-hidden">
      {/* glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-500/8 blur-[140px] rounded-full pointer-events-none" />

      <div className="container-x relative">
        <Reveal direction="up" className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 mb-5">
            <span className="size-1.5 rounded-full bg-pink-400 animate-pulse" />
            Depoimentos
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Empresas que confiam na{' '}
            <span className="gradient-text">LIPE.HOST</span>
          </h2>
          <p className="mt-5 text-base text-white/60">
            Mais de 100 projetos entregues. Veja o que nossos clientes dizem sobre trabalhar
            conosco.
          </p>
        </Reveal>

        <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <StaggerItem key={t.name}>
              <figure className="relative h-full rounded-2xl border border-white/8 bg-[#111] p-7 card-hover overflow-hidden">
                <Quote className="absolute top-5 right-5 size-10 text-white/5" />

                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <blockquote className="text-sm text-white/75 leading-relaxed mb-6 relative">
                  &ldquo;{t.content}&rdquo;
                </blockquote>

                <figcaption className="flex items-center gap-3 pt-5 border-t border-white/8">
                  <div className="size-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-white/50">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
