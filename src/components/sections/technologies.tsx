'use client'

import * as React from 'react'
import {
  Smartphone, Code2, Triangle, Atom, Hexagon, FileCode, Container,
  Database, Flame, Sparkles, MapPin, Github, Terminal, Server, type LucideIcon
} from 'lucide-react'
import { TECHNOLOGIES } from '@/lib/content'
import { Reveal, Stagger, StaggerItem } from '@/components/reveal'

const iconMap: Record<string, LucideIcon> = {
  Smartphone, Code2, Triangle, Atom, Hexagon, FileCode, Container,
  Database, Flame, Sparkles, MapPin, Github, Terminal, Server,
}

export function Technologies() {
  return (
    <section id="tecnologias" className="relative py-24 section-padding border-t border-white/5 bg-[#0a0a0a]">
      <div className="container-x">
        <Reveal direction="up" className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 mb-5">
            <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Tecnologias
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Stack moderna e{' '}
            <span className="gradient-text">escalável</span>
          </h2>
          <p className="mt-5 text-base text-white/60">
            Trabalhamos com as tecnologias mais robustas e modernas do mercado, escolhidas para
            garantir performance, segurança e escalabilidade ao seu projeto.
          </p>
        </Reveal>

        <Stagger className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {TECHNOLOGIES.map((tech) => {
            const Icon = iconMap[tech.icon] ?? Code2
            return (
              <StaggerItem key={tech.name}>
                <div className="group relative rounded-2xl border border-white/8 bg-[#111] p-5 card-hover overflow-hidden h-full">
                  <div
                    className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${tech.color}15, transparent 70%)` }}
                  />
                  <div className="relative flex items-center gap-3">
                    <div
                      className="size-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: `${tech.color}15`,
                        border: `1px solid ${tech.color}30`,
                      }}
                    >
                      <Icon className="size-5" style={{ color: tech.color }} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{tech.name}</div>
                      <div className="text-[10px] text-white/40">Production ready</div>
                    </div>
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
