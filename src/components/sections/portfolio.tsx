'use client'

import { ArrowUpRight } from 'lucide-react'
import { PORTFOLIO_PROJECTS } from '@/lib/content'
import { Reveal, Stagger, StaggerItem } from '@/components/reveal'

export function Portfolio() {
  return (
    <section id="projetos" className="relative py-24 section-padding border-t border-white/5">
      <div className="container-x">
        <Reveal direction="up" className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 mb-5">
            <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
            Portfólio
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Projetos que entregamos com{' '}
            <span className="gradient-text">orgulho</span>
          </h2>
          <p className="mt-5 text-base text-white/60">
            Uma amostra de sistemas reais em produção, gerando receita e impacto para nossos
            clientes pelo Brasil.
          </p>
        </Reveal>

        <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PORTFOLIO_PROJECTS.map((project) => (
            <StaggerItem key={project.name}>
              <article className="group relative rounded-2xl overflow-hidden border border-white/8 bg-[#111] card-hover cursor-pointer">
                {/* visual */}
                <div className={`relative aspect-[16/11] bg-gradient-to-br ${project.gradient} overflow-hidden`}>
                  <div className="absolute inset-0 noise-overlay" />
                  {/* mockup desktop */}
                  <div className="absolute inset-x-6 top-6 bottom-12 rounded-lg bg-[#0a0a0a]/85 backdrop-blur-sm border border-white/10 overflow-hidden">
                    <div className="flex items-center gap-1 px-2 py-1.5 border-b border-white/10">
                      <div className="size-1 rounded-full bg-white/30" />
                      <div className="size-1 rounded-full bg-white/30" />
                      <div className="size-1 rounded-full bg-white/30" />
                    </div>
                    <div className="p-2 space-y-1">
                      <div className="h-1.5 w-1/4 rounded bg-white/20" />
                      <div className="grid grid-cols-3 gap-1 mt-1.5">
                        <div className="h-6 rounded bg-white/10" />
                        <div className="h-6 rounded bg-white/10" />
                        <div className="h-6 rounded bg-white/10" />
                      </div>
                      <div className="h-1.5 w-2/3 rounded bg-white/10 mt-1.5" />
                      <div className="h-1.5 w-1/2 rounded bg-white/10" />
                    </div>
                  </div>
                  {/* mockup phone */}
                  <div className="absolute right-4 bottom-2 w-10 h-16 rounded-md bg-[#0a0a0a]/90 border border-white/15 overflow-hidden">
                    <div className="h-3 bg-gradient-to-br from-blue-500/60 to-purple-500/60" />
                    <div className="p-1 space-y-0.5">
                      <div className="h-0.5 bg-white/20 rounded" />
                      <div className="h-0.5 bg-white/10 rounded w-2/3" />
                      <div className="h-0.5 bg-white/10 rounded w-1/2" />
                    </div>
                  </div>

                  {/* hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="size-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                      <ArrowUpRight className="size-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* info */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-bold text-white group-hover:gradient-text transition-all">
                      {project.name}
                    </h3>
                    <span className="text-xs text-white/40">{project.year}</span>
                  </div>
                  <p className="text-xs text-white/55">{project.category}</p>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
