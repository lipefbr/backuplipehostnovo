'use client'

import { Server, Cloud, HardDrive, Cpu, Network, ShieldCheck, Activity, Globe, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Reveal, Stagger, StaggerItem } from '@/components/reveal'

const serverTypes = [
  {
    icon: Server,
    name: 'Servidor Dedicado',
    description: 'Servidor físico exclusivo para sua empresa, com recursos 100% dedicados e máximo desempenho.',
    specs: ['CPU dedicada', 'RAM dedicada', 'Storage NVMe', 'Rede dedicada'],
  },
  {
    icon: Cloud,
    name: 'Cloud Server (VPS)',
    description: 'Servidor virtual escalável sob demanda. Aumente CPU, RAM e storage em segundos.',
    specs: ['Escalável', 'Pay-as-you-go', 'Multi-region', 'Snapshots'],
  },
  {
    icon: Globe,
    name: 'Cloud Gerenciado',
    description: 'Servidores em AWS, Hetzner, Oracle Cloud, Azure ou Digital Ocean com gestão completa.',
    specs: ['Multi-cloud', 'Alta disponibilidade', 'Auto-scaling', 'CDN integrado'],
  },
]

const serverFeatures = [
  { icon: HardDrive, title: 'SSD / NVMe Enterprise', description: 'Storage de alta performance com replicação e backup automático.' },
  { icon: ShieldCheck, title: 'Segurança Hardened', description: 'Firewall dedicado, WAF, proteção DDoS e SSL gerenciado incluso.' },
  { icon: Activity, title: 'Monitoramento 24/7', description: 'Uptime, CPU, RAM, disco e rede monitorados em tempo real com alertas.' },
  { icon: Network, title: 'Rede Premium', description: 'Banda dedicada, baixa latência e roteamento otimizado para todo Brasil.' },
  { icon: Cpu, title: 'Hardware de Ponta', description: 'Processadores AMD EPYC / Intel Xeon última geração com turbo boost.' },
  { icon: Globe, title: 'Data Centers Globais', description: 'Presença em data centers no Brasil, EUA e Europa para menor latência.' },
]

export function Servers() {
  return (
    <section id="servidores" className="relative py-24 section-padding border-t border-white/5 bg-[#0a0a0a] overflow-hidden">
      {/* glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-[140px] rounded-full pointer-events-none" />
      {/* grid */}
      <div className="absolute inset-0 grid-bg grid-bg-radial opacity-40 pointer-events-none" />

      <div className="container-x relative">
        <Reveal direction="up" className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-medium text-blue-300 mb-5">
            <Server className="size-3.5" />
            Servidores & Infraestrutura
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Também temos{' '}
            <span className="gradient-text">servidores</span>
          </h2>
          <p className="mt-5 text-base text-white/60 leading-relaxed">
            A LIPE.HOST oferece servidores dedicados, cloud (VPS) e infraestrutura gerenciada para
            hospedar seu sistema, aplicativo ou plataforma com máximo desempenho e segurança.
            Não vendemos hospedagem compartilhada — entregamos servidores profissionais configurados
            sob medida para o seu projeto, com gestão completa e suporte 24/7.
          </p>
          <p className="mt-3 text-sm text-white/50">
            <span className="text-white/70 font-semibold">Valores sob consulta</span> — cada projeto
            tem necessidades diferentes. Solicite um orçamento personalizado.
          </p>
        </Reveal>

        {/* Server types - 3 main cards */}
        <Stagger className="grid md:grid-cols-3 gap-5 mb-12">
          {serverTypes.map((s) => (
            <StaggerItem key={s.name}>
              <div className="group relative h-full rounded-2xl border border-white/8 bg-[#111] p-7 card-hover overflow-hidden">
                {/* glow on hover */}
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500 pointer-events-none" />
                <div className="relative">
                  <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <s.icon className="size-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{s.name}</h3>
                  <p className="text-sm text-white/55 leading-relaxed mb-4">{s.description}</p>
                  <ul className="space-y-1.5">
                    {s.specs.map((spec) => (
                      <li key={spec} className="flex items-center gap-2 text-xs text-white/70">
                        <div className="size-1 rounded-full bg-blue-400" />
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Detailed features grid */}
        <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {serverFeatures.map((f) => (
            <StaggerItem key={f.title}>
              <div className="group flex gap-4 p-5 rounded-xl border border-white/8 bg-[#111] card-hover">
                <div className="size-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <f.icon className="size-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">{f.title}</h4>
                  <p className="text-xs text-white/55 leading-relaxed">{f.description}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Stats bar */}
        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-white/8 bg-gradient-to-br from-[#0c0c0c] to-[#111] p-7 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-extrabold gradient-text">99.9%</div>
              <div className="text-xs text-white/50 mt-1">Uptime garantido (SLA)</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold gradient-text">24/7</div>
              <div className="text-xs text-white/50 mt-1">Suporte e monitoramento</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold gradient-text">SSD</div>
              <div className="text-xs text-white/50 mt-1">NVMe Enterprise</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold gradient-text">DDoS</div>
              <div className="text-xs text-white/50 mt-1">Proteção inclusa</div>
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal delay={0.2} className="mt-10 text-center">
          <Link
            href="#contato"
            className="group inline-flex items-center gap-2 h-12 px-7 rounded-xl gradient-bg text-white font-semibold hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:scale-[1.02]"
          >
            Solicitar orçamento de servidor
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="mt-3 text-xs text-white/40">
            Configuração personalizada conforme sua demanda · Resposta em 24h
          </p>
        </Reveal>
      </div>
    </section>
  )
}
