'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Check, MessageCircle, Star, ChevronRight,
  Play, Shield, Cpu, Zap,
} from 'lucide-react'
import type { System } from '@/lib/content'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Reveal, Stagger, StaggerItem } from '@/components/reveal'

interface Props {
  system: System
  related: System[]
}

export function SystemDetailClient({ system, related }: Props) {
  const whatsappLink = `https://wa.me/5500000000000?text=Ol%C3%A1%2C%20tenho%20interesse%20no%20sistema%20${encodeURIComponent(
    system.name
  )}`

  return (
    <>
      {/* Breadcrumb */}
      <div className="container-x">
        <nav className="flex items-center gap-1.5 text-xs text-white/50 mb-8">
          <Link href="/" className="hover:text-white">Início</Link>
          <ChevronRight className="size-3" />
          <Link href="/loja" className="hover:text-white">Loja</Link>
          <ChevronRight className="size-3" />
          <span className="text-white/80">{system.name}</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 grid-bg grid-bg-radial opacity-50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] blur-[140px] rounded-full pointer-events-none" style={{ background: `${system.accentColor}30` }} />

        <div className="container-x relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left copy */}
            <Reveal direction="right">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 mb-5">
                <span className="size-1.5 rounded-full" style={{ background: system.accentColor }} />
                {system.category}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mb-5">
                {system.name}
              </h1>
              <p className="text-lg text-white/60 leading-relaxed mb-8">
                {system.longDescription}
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {system.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 h-12 px-7 rounded-xl gradient-bg text-white font-semibold hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:scale-[1.02]"
                >
                  <MessageCircle className="size-4" />
                  Solicitar orçamento
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </a>
                {system.startingPrice && (
                  <div className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5">
                    <div className="text-[10px] text-white/50 uppercase tracking-wide">A partir de</div>
                    <div className="text-lg font-bold text-white">{system.startingPrice}</div>
                  </div>
                )}
              </div>
            </Reveal>

            {/* Right visual */}
            <Reveal direction="left" delay={0.15} className="relative h-[400px] lg:h-[500px]">
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${system.screenshots[0].gradient} opacity-20 blur-3xl`} />

              {/* Main screenshot mockup */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-x-0 top-0 mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-[#0e0e0e] overflow-hidden shadow-2xl"
                style={{ boxShadow: `0 30px 80px ${system.accentColor}40` }}
              >
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/10">
                  <div className="size-2 rounded-full bg-red-500/80" />
                  <div className="size-2 rounded-full bg-amber-500/80" />
                  <div className="size-2 rounded-full bg-emerald-500/80" />
                  <div className="ml-3 text-[10px] text-white/40 font-mono">lipe.host/{system.slug}</div>
                </div>
                <div className={`aspect-[16/10] bg-gradient-to-br ${system.screenshots[0].gradient} relative`}>
                  <div className="absolute inset-0 noise-overlay" />
                  <div className="absolute inset-6 rounded-lg bg-[#0a0a0a]/85 backdrop-blur-sm border border-white/10 overflow-hidden">
                    <div className="p-4 space-y-2">
                      <div className="h-2.5 w-1/3 rounded bg-white/30" />
                      <div className="h-2.5 w-2/3 rounded bg-white/15" />
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="h-12 rounded bg-white/10" />
                        <div className="h-12 rounded bg-white/10" />
                        <div className="h-12 rounded bg-white/10" />
                      </div>
                      <div className="h-16 rounded bg-white/10 mt-2 flex items-center justify-center">
                        <Play className="size-5 text-white/40" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating chips */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -bottom-2 -left-2 glass-strong rounded-xl p-3 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <Shield className="size-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-white">SLA 99.9%</div>
                    <div className="text-[9px] text-white/50">Garantido</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-2 -right-2 glass-strong rounded-xl p-3 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <Zap className="size-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-white">3-6 semanas</div>
                    <div className="text-[9px] text-white/50">Implantação</div>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Highlights bar */}
      <section className="border-y border-white/5 bg-[#0a0a0a]">
        <div className="container-x py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {system.highlights.map((h, i) => (
              <Reveal key={h} delay={i * 0.05} direction="up">
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <Check className="size-3.5 text-emerald-400" />
                  {h}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-24 section-padding">
        <div className="container-x">
          <Reveal direction="up" className="max-w-2xl mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 mb-5">
              <Cpu className="size-3.5 text-blue-400" />
              Funcionalidades
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Tudo que o sistema{' '}
              <span className="gradient-text">inclui</span>
            </h2>
            <p className="mt-5 text-base text-white/60">
              Cada módulo foi projetado para ser robusto, intuitivo e pronto para produção.
            </p>
          </Reveal>

          <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {system.features.map((f, i) => (
              <StaggerItem key={f.title}>
                <div className="relative h-full rounded-2xl border border-white/8 bg-[#111] p-6 card-hover overflow-hidden">
                  <div className="absolute top-4 right-4 text-5xl font-extrabold text-white/5">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2.5 relative">{f.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed relative">{f.description}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Screenshots gallery */}
      <section className="py-24 section-padding border-t border-white/5 bg-[#0a0a0a]">
        <div className="container-x">
          <Reveal direction="up" className="max-w-2xl mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 mb-5">
              <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
              Screenshots
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Veja o sistema em{' '}
              <span className="gradient-text">ação</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5">
            {system.screenshots.map((shot, i) => (
              <Reveal key={shot.label} delay={i * 0.1} direction={i % 2 === 0 ? 'right' : 'left'}>
                <div className={`relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/8 bg-gradient-to-br ${shot.gradient}`}>
                  <div className="absolute inset-0 noise-overlay" />
                  {/* mockup */}
                  <div className="absolute inset-5 rounded-lg bg-[#0a0a0a]/85 backdrop-blur-sm border border-white/10 overflow-hidden">
                    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/10">
                      <div className="size-1.5 rounded-full bg-white/30" />
                      <div className="size-1.5 rounded-full bg-white/30" />
                      <div className="size-1.5 rounded-full bg-white/30" />
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="h-2.5 w-1/3 rounded bg-white/20" />
                      <div className="h-2.5 w-2/3 rounded bg-white/10" />
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="h-12 rounded bg-white/10" />
                        <div className="h-12 rounded bg-white/10" />
                        <div className="h-12 rounded bg-white/10" />
                      </div>
                      <div className="h-20 rounded bg-white/10 mt-2 flex items-center justify-center">
                        <Play className="size-6 text-white/30" />
                      </div>
                    </div>
                  </div>
                  {/* label */}
                  <div className="absolute bottom-3 left-3 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 px-3 py-1.5 text-xs font-medium text-white">
                    {shot.label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 section-padding border-t border-white/5">
        <div className="container-x">
          <Reveal direction="up" className="max-w-2xl mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 mb-5">
              <Star className="size-3.5 text-amber-400" />
              Benefícios
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Por que escolher{' '}
              <span className="gradient-text">{system.name}</span>
            </h2>
          </Reveal>

          <Stagger className="grid md:grid-cols-2 gap-4">
            {system.benefits.map((b) => (
              <StaggerItem key={b}>
                <div className="flex items-start gap-4 p-5 rounded-xl border border-white/8 bg-[#111] card-hover">
                  <div className="size-9 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
                    <Check className="size-5 text-white" strokeWidth={3} />
                  </div>
                  <p className="text-sm text-white/75 leading-relaxed pt-1">{b}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Plans */}
      <section id="planos" className="py-24 section-padding border-t border-white/5 bg-[#0a0a0a]">
        <div className="container-x">
          <Reveal direction="up" className="max-w-2xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 mb-5">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Planos e valores
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Escolha o plano{' '}
              <span className="gradient-text">ideal</span>
            </h2>
            <p className="mt-5 text-base text-white/60">
              Todos os planos incluem código-fonte, painel administrativo e suporte.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {system.plans.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.1} direction="up">
                <div
                  className={`relative h-full rounded-2xl p-7 ${
                    plan.highlighted
                      ? 'gradient-border bg-[#0c0c0c] shadow-2xl shadow-blue-500/20'
                      : 'border border-white/8 bg-[#111]'
                  } card-hover`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-bg px-4 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      Mais popular
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-1">
                    <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                    {plan.period && (
                      <span className="text-xs text-white/50 ml-1">/ {plan.period}</span>
                    )}
                  </div>
                  <p className="text-xs text-white/55 mt-2 mb-5 min-h-[2.5rem]">{plan.description}</p>

                  <ul className="space-y-3 mb-7">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-white/75">
                        <div className="size-4 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="size-3 text-blue-400" strokeWidth={3} />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block text-center h-11 leading-[2.75rem] rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] ${
                      plan.highlighted
                        ? 'gradient-bg text-white hover:shadow-xl hover:shadow-blue-500/30'
                        : 'border border-white/15 bg-white/5 hover:bg-white/10 text-white'
                    }`}
                  >
                    Solicitar orçamento
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 section-padding border-t border-white/5">
        <div className="container-x max-w-3xl">
          <Reveal direction="up" className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 mb-5">
              <span className="size-1.5 rounded-full bg-violet-400 animate-pulse" />
              Perguntas frequentes
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Dúvidas sobre o sistema?
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <Accordion type="single" collapsible className="space-y-3">
              {system.faq.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="rounded-xl border border-white/8 bg-[#111] px-5 data-[state=open]:border-blue-500/30 transition-colors"
                >
                  <AccordionTrigger className="text-left text-base font-semibold hover:no-underline py-5">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-white/60 leading-relaxed pb-5 pt-0">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-white/5">
        <div className="container-x">
          <Reveal direction="scale" className="relative rounded-3xl overflow-hidden border border-white/10">
            <div className="absolute inset-0 gradient-bg opacity-95" />
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="absolute inset-0 bg-[#0a0a0a]/40" />
            <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-white/20 blur-[120px] rounded-full" />

            <div className="relative px-6 py-12 sm:px-16 sm:py-16 text-center">
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
                Pronto para implantar o {system.name}?
              </h2>
              <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto mb-8">
                Fale com nossa equipe. Orçamento sem custo, resposta em até 24 horas úteis.
              </p>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-white text-[#0a0a0a] font-semibold hover:bg-white/90 transition-all hover:scale-[1.02]"
              >
                <MessageCircle className="size-4" />
                Falar pelo WhatsApp
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="py-20 border-t border-white/5 bg-[#0a0a0a]">
          <div className="container-x">
            <Reveal direction="up" className="mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Sistemas relacionados
              </h2>
            </Reveal>
            <Stagger className="grid md:grid-cols-3 gap-5">
              {related.map((r) => (
                <StaggerItem key={r.slug}>
                  <Link href={`/loja/${r.slug}`} className="group block">
                    <article className="relative rounded-2xl border border-white/8 bg-[#111] overflow-hidden card-hover">
                      <div className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${r.screenshots[0].gradient}`}>
                        <div className="absolute inset-0 noise-overlay" />
                        <div className="absolute inset-4 rounded-lg bg-[#0a0a0a]/80 backdrop-blur-sm border border-white/10 overflow-hidden">
                          <div className="flex items-center gap-1 px-3 py-2 border-b border-white/10">
                            <div className="size-1.5 rounded-full bg-white/30" />
                            <div className="size-1.5 rounded-full bg-white/30" />
                            <div className="size-1.5 rounded-full bg-white/30" />
                          </div>
                          <div className="p-3 space-y-2">
                            <div className="h-2 w-1/3 rounded bg-white/20" />
                            <div className="h-2 w-1/2 rounded bg-white/10" />
                          </div>
                        </div>
                        <div className="absolute top-3 left-3 z-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 px-3 py-1 text-[10px] font-medium text-white">
                          {r.category}
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-base font-bold text-white mb-1 group-hover:gradient-text transition-all">
                          {r.name}
                        </h3>
                        <p className="text-xs text-white/55 line-clamp-2">{r.shortDescription}</p>
                      </div>
                    </article>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}
    </>
  )
}
