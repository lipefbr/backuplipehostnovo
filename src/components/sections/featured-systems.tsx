'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SYSTEMS } from '@/lib/content'
import { Reveal, Stagger, StaggerItem } from '@/components/reveal'

export function FeaturedSystems() {
  const featured = SYSTEMS.filter((s) => s.featured).slice(0, 6)

  return (
    <section id="sistemas" className="relative py-24 section-padding border-t border-white/5">
      {/* glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/8 blur-[140px] rounded-full pointer-events-none" />

      <div className="container-x relative">
        <Reveal direction="up" className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 mb-5">
            <span className="size-1.5 rounded-full bg-purple-400 animate-pulse" />
            Sistemas em destaque
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Conheça alguns sistemas da{' '}
            <span className="gradient-text">LIPE.HOST</span>
          </h2>
          <p className="mt-5 text-base text-white/60">
            Sistemas prontos e personalizados que podem ser implantados em semanas, não meses.
            Todos com código-fonte, painel administrativo e suporte completo.
          </p>
        </Reveal>

        <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((sys) => (
            <StaggerItem key={sys.slug}>
              <Link href={`/loja/${sys.slug}`} className="group block h-full">
                <article className="relative h-full rounded-2xl border border-white/8 bg-[#111] overflow-hidden card-hover">
                  {/* image area */}
                  <div className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${sys.screenshots[0].gradient}`}>
                    <div className="absolute inset-0 noise-overlay" />
                    {/* mockup browser frame */}
                    <div className="absolute inset-4 rounded-lg bg-[#0a0a0a]/80 backdrop-blur-sm border border-white/10 overflow-hidden">
                      <div className="flex items-center gap-1 px-3 py-2 border-b border-white/10">
                        <div className="size-1.5 rounded-full bg-white/30" />
                        <div className="size-1.5 rounded-full bg-white/30" />
                        <div className="size-1.5 rounded-full bg-white/30" />
                      </div>
                      <div className="p-3 space-y-2">
                        <div className="h-2 w-1/3 rounded bg-white/20" />
                        <div className="h-2 w-1/2 rounded bg-white/10" />
                        <div className="grid grid-cols-3 gap-1.5 mt-2">
                          <div className="h-8 rounded bg-white/10" />
                          <div className="h-8 rounded bg-white/10" />
                          <div className="h-8 rounded bg-white/10" />
                        </div>
                      </div>
                    </div>
                    {/* category chip */}
                    <div className="absolute top-3 left-3 z-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 px-3 py-1 text-[10px] font-medium text-white">
                      {sys.category}
                    </div>
                  </div>

                  {/* content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-1.5 group-hover:gradient-text transition-all">
                      {sys.name}
                    </h3>
                    <p className="text-sm text-white/55 leading-relaxed mb-4 line-clamp-2">
                      {sys.shortDescription}
                    </p>

                    {/* tech chips */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {sys.technologies.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] font-medium px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white/60"
                        >
                          {tech}
                        </span>
                      ))}
                      {sys.technologies.length > 4 && (
                        <span className="text-[10px] font-medium px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white/40">
                          +{sys.technologies.length - 4}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/8">
                      <span className="text-xs text-white/40">
                        {sys.startingPrice ? `a partir de ${sys.startingPrice}` : 'Sob consulta'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 group-hover:gap-2 transition-all">
                        Ver detalhes
                        <ArrowRight className="size-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.2} className="mt-12 text-center">
          <Link
            href="/loja"
            className="group inline-flex items-center gap-2 h-12 px-7 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-blue-500/30 text-white font-semibold transition-all"
          >
            Ver todos os sistemas
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
