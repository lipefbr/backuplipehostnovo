'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Rocket, ArrowRight, MessageCircle, Check, Database, Cloud, ShieldCheck, Activity, Zap, Cpu } from 'lucide-react'
import Link from 'next/link'

const statusCards = [
  { icon: Check, label: 'Deploy realizado', color: 'text-emerald-400', delay: 0 },
  { icon: Database, label: 'PostgreSQL Online', color: 'text-blue-400', delay: 0.6 },
  { icon: Zap, label: 'API conectada', color: 'text-amber-400', delay: 1.2 },
  { icon: ShieldCheck, label: 'Backup automático', color: 'text-violet-400', delay: 1.8 },
  { icon: Cloud, label: 'SSL ativo', color: 'text-cyan-400', delay: 2.4 },
  { icon: Activity, label: 'Aplicação publicada', color: 'text-pink-400', delay: 3.0 },
]

export function Hero() {
  return (
    <section id="inicio" className="relative min-h-screen pt-32 pb-20 overflow-hidden noise-overlay">
      {/* Background grid */}
      <div className="absolute inset-0 grid-bg grid-bg-radial pointer-events-none" />

      {/* Background glows */}
      <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-blue-500/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-purple-500/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container-x relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* LEFT — copy */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
            }}
            className="max-w-xl"
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-300 backdrop-blur-sm mb-7"
            >
              <Rocket className="size-3.5" />
              Tecnologia para empresas
            </motion.div>

            <motion.h1
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.05] tracking-tight"
            >
              Criamos sistemas que{' '}
              <span className="gradient-text">aceleram empresas</span>.
            </motion.h1>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-7 text-base sm:text-lg text-white/60 leading-relaxed max-w-xl"
            >
              Desenvolvemos aplicativos, sistemas web, marketplaces, CRMs, plataformas SaaS e
              soluções com Inteligência Artificial. Também implantamos toda a infraestrutura para
              colocar seu projeto em produção.
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Link href="#solucoes">
                <button className="group inline-flex items-center gap-2 h-12 px-7 rounded-xl gradient-bg text-white font-semibold hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:scale-[1.02]">
                  Conhecer Sistemas
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
              <Link href="#contato">
                <button className="inline-flex items-center gap-2 h-12 px-7 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 text-white font-medium transition-all backdrop-blur-sm">
                  <MessageCircle className="size-4" />
                  Solicitar Orçamento
                </button>
              </Link>
            </motion.div>

            {/* trust row */}
            <motion.div
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-12 flex items-center gap-7 text-xs text-white/50"
            >
              <div>
                <div className="text-2xl font-bold text-white">100+</div>
                <div>Projetos entregues</div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div>
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div>Disponibilidade</div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div>
                <div className="text-2xl font-bold text-white">24/7</div>
                <div>Suporte técnico</div>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT — futuristic composition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block h-[560px]"
          >
            <HeroComposition />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function HeroComposition() {
  return (
    <div className="relative w-full h-full">
      {/* Glow background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20 rounded-3xl blur-2xl" />

      {/* Laptop / Dashboard */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-8 left-1/2 -translate-x-1/2 w-[440px] z-20"
      >
        <div className="relative rounded-xl border border-white/10 bg-[#0e0e0e] p-3 shadow-2xl shadow-blue-500/20">
          {/* dashboard */}
          <div className="rounded-lg overflow-hidden bg-[#0a0a0a]">
            {/* top bar */}
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5">
              <div className="size-2 rounded-full bg-red-500/80" />
              <div className="size-2 rounded-full bg-amber-500/80" />
              <div className="size-2 rounded-full bg-emerald-500/80" />
              <div className="ml-3 text-[10px] text-white/40 font-mono">lipe.host/dashboard</div>
            </div>
            {/* dashboard content */}
            <div className="p-4 grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-3">
                <div className="h-7 rounded bg-gradient-to-r from-blue-500/40 to-purple-500/40 flex items-center px-3">
                  <div className="text-[10px] font-bold text-white">Receita / Mês</div>
                  <div className="ml-auto text-[10px] font-bold text-emerald-400">+24%</div>
                </div>
                {/* mini chart */}
                <div className="h-20 rounded bg-white/[0.03] border border-white/5 relative overflow-hidden">
                  <svg viewBox="0 0 200 80" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 1 }}
                      d="M0,60 L25,55 L50,40 L75,45 L100,30 L125,35 L150,20 L175,15 L200,10"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                    />
                    <motion.path
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 1.8 }}
                      d="M0,60 L25,55 L50,40 L75,45 L100,30 L125,35 L150,20 L175,15 L200,10 L200,80 L0,80 Z"
                      fill="url(#chartGrad)"
                    />
                  </svg>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-12 rounded bg-white/[0.03] border border-white/5 p-2">
                    <div className="text-[8px] text-white/40">Usuários</div>
                    <div className="text-xs font-bold text-white">12.4k</div>
                  </div>
                  <div className="h-12 rounded bg-white/[0.03] border border-white/5 p-2">
                    <div className="text-[8px] text-white/40">Conversão</div>
                    <div className="text-xs font-bold text-emerald-400">8.7%</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-7 rounded bg-gradient-to-br from-purple-500/40 to-blue-500/40" />
                <div className="space-y-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-3 rounded bg-white/[0.04]" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* laptop base */}
        <div className="mx-auto mt-[-2px] w-[460px] h-3 bg-gradient-to-b from-[#222] to-[#0a0a0a] rounded-b-xl" />
      </motion.div>

      {/* Phone */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute bottom-0 left-2 w-[130px] z-30"
      >
        <div className="relative rounded-[1.5rem] border-2 border-white/10 bg-[#0a0a0a] p-1.5 shadow-2xl shadow-purple-500/30">
          <div className="rounded-[1.2rem] overflow-hidden bg-[#0e0e0e] aspect-[9/19]">
            {/* app screen */}
            <div className="h-full flex flex-col">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3">
                <div className="text-[8px] text-white/80">Olá,</div>
                <div className="text-xs font-bold text-white">Carlos Mendes</div>
              </div>
              <div className="flex-1 p-2 space-y-2">
                <div className="h-12 rounded-lg bg-white/[0.06] border border-white/10 p-1.5">
                  <div className="text-[7px] text-white/40">Saldo</div>
                  <div className="text-[10px] font-bold text-white">R$ 12.840,00</div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {['PIX', 'Cartão', 'Boleto'].map((t) => (
                    <div key={t} className="aspect-square rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[6px] text-blue-300">
                      {t}
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-5 rounded bg-white/[0.04] flex items-center px-1.5">
                      <div className="size-2 rounded-full bg-emerald-500/60" />
                      <div className="ml-1.5 h-1 flex-1 bg-white/10 rounded" />
                      <div className="text-[6px] text-white/60 ml-1">+R$ 50</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating status cards */}
      <div className="absolute inset-0 pointer-events-none">
        {statusCards.map((card, i) => {
          const positions = [
            'top-2 right-0',
            'top-32 right-4',
            'top-56 right-0',
            'bottom-32 right-8',
            'bottom-12 right-2',
            'bottom-0 right-20',
          ]
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 1 + i * 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={`absolute ${positions[i]}`}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: card.delay,
                }}
                className="glass-strong rounded-xl px-3 py-2 flex items-center gap-2 shadow-xl shadow-black/40"
              >
                <card.icon className={`size-3.5 ${card.color}`} />
                <span className="text-[10px] font-medium text-white whitespace-nowrap">{card.label}</span>
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                  className="size-1.5 rounded-full bg-emerald-400"
                />
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      {/* floating analytics card */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 left-0 z-40"
      >
        <div className="glass-strong rounded-2xl p-3 shadow-xl shadow-blue-500/20 w-[150px]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] text-white/60">Analytics</div>
            <Cpu className="size-3 text-blue-400" />
          </div>
          <div className="text-lg font-extrabold text-white">99.9%</div>
          <div className="text-[9px] text-white/40 mb-2">Uptime / 30 dias</div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '99%' }}
              transition={{ duration: 1.5, delay: 2 }}
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-400"
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
