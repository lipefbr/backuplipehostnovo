'use client'

import { Server, Cloud, ShieldCheck, Activity, Database, GitBranch, Zap, Lock } from 'lucide-react'
import { CONSULTING_TECH } from '@/lib/content'
import { Reveal, Stagger, StaggerItem } from '@/components/reveal'

const consultingFeatures = [
  { icon: GitBranch, title: 'CI/CD & Deploy', description: 'Pipeline automatizado com GitHub Actions, deploy contínuo e rollback em segundos.' },
  { icon: ShieldCheck, title: 'Backups & SSL', description: 'Backup automático, criptografia, SSL gerenciado e disaster recovery.' },
  { icon: Activity, title: 'Monitoramento', description: 'Observabilidade completa com Prometheus, Grafana, logs centralizados e alertas.' },
  { icon: Zap, title: 'Escalabilidade', description: 'Load balancer, auto-scaling, cache e CDN para crescer sem dor.' },
  { icon: Lock, title: 'Firewall & Segurança', description: 'Hardening de servidores, WAF, rate limiting e proteção contra ataques.' },
  { icon: Cloud, title: 'Cloud Multi-region', description: 'AWS, Hetzner, Oracle Cloud, Azure e Digital Ocean com arquitetura multi-region.' },
]

export function Consulting() {
  return (
    <section id="consultoria" className="relative py-24 section-padding border-t border-white/5">
      <div className="container-x">
        <Reveal direction="up" className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 mb-5">
            <Server className="size-3.5 text-blue-400" />
            Consultoria em Infraestrutura
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Infraestrutura profissional para{' '}
            <span className="gradient-text">seu sistema</span>
          </h2>
          <p className="mt-5 text-base text-white/60">
            Não vendemos hospedagem compartilhada. Oferecemos consultoria completa para implantação
            e gerenciamento da infraestrutura do seu projeto — do Docker ao Cloud, do deploy ao
            monitoramento 24/7.
          </p>
        </Reveal>

        {/* Tech grid */}
        <Reveal delay={0.1} className="mb-12">
          <div className="rounded-2xl border border-white/8 bg-[#0c0c0c] p-7">
            <div className="text-xs uppercase tracking-[0.2em] text-white/40 mb-5">Stack de infraestrutura</div>
            <div className="flex flex-wrap gap-2">
              {CONSULTING_TECH.map((tech) => (
                <div
                  key={tech.name}
                  className="group inline-flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-1.5 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all cursor-default"
                >
                  <span className="text-sm font-medium text-white/80 group-hover:text-white">{tech.name}</span>
                  <span className="text-[9px] uppercase tracking-wide text-white/30">{tech.category}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Feature cards */}
        <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {consultingFeatures.map((f) => (
            <StaggerItem key={f.title}>
              <div className="group h-full rounded-2xl border border-white/8 bg-[#111] p-6 card-hover">
                <div className="size-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="size-5 text-blue-400" />
                </div>
                <h3 className="text-base font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{f.description}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
