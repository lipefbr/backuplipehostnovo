'use client'

import * as React from 'react'
import {
  Code2, Smartphone, LayoutGrid, ShoppingCart, BrainCircuit, Server,
  type LucideIcon,
} from 'lucide-react'
import { SERVICES } from '@/lib/content'
import { Reveal, Stagger, StaggerItem } from '@/components/reveal'

const iconMap: Record<string, LucideIcon> = {
  Code2,
  Smartphone,
  LayoutGrid,
  ShoppingCart,
  BrainCircuit,
  Server,
}

export function Services() {
  return (
    <section id="solucoes" className="relative py-24 section-padding">
      <div className="container-x">
        <Reveal direction="up" className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 mb-5">
            <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
            O que fazemos
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Soluções completas para{' '}
            <span className="gradient-text">sua empresa</span>
          </h2>
          <p className="mt-5 text-base text-white/60">
            Do aplicativo mobile ao painel administrativo, da inteligência artificial à
            infraestrutura — cobrimos todo o ciclo de tecnologia do seu negócio.
          </p>
        </Reveal>

        <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((service) => {
            const Icon = iconMap[service.icon] ?? Code2
            return (
              <StaggerItem key={service.title}>
                <div className="group relative h-full rounded-2xl border border-white/8 bg-[#111] p-7 card-hover overflow-hidden">
                  {/* hover glow */}
                  <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-blue-500/0 via-transparent to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500 pointer-events-none" />

                  <div className="relative">
                    {/* icon */}
                    <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <Icon className="size-6 text-blue-400" />
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2.5">
                      {service.title}
                    </h3>
                    <p className="text-sm text-white/60 leading-relaxed mb-5">
                      {service.description}
                    </p>

                    <ul className="space-y-2">
                      {service.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-white/70">
                          <div className="size-1 rounded-full bg-blue-400" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}
