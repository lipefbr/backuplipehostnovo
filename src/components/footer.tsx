'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Rocket, Github, Linkedin, Instagram, Mail, MessageCircle, ArrowUpRight } from 'lucide-react'

const footerCols = [
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre nós', href: '#inicio' },
      { label: 'Projetos', href: '#projetos' },
      { label: 'Loja', href: '/loja' },
      { label: 'Consultoria', href: '#consultoria' },
    ],
  },
  {
    title: 'Serviços',
    links: [
      { label: 'Desenvolvimento de Sistemas', href: '#solucoes' },
      { label: 'Aplicativos Mobile', href: '#solucoes' },
      { label: 'Plataformas SaaS', href: '#solucoes' },
      { label: 'Inteligência Artificial', href: '#solucoes' },
    ],
  },
  {
    title: 'Tecnologias',
    links: [
      { label: 'Flutter', href: '#tecnologias' },
      { label: 'Next.js & React', href: '#tecnologias' },
      { label: 'Laravel & Node.js', href: '#tecnologias' },
      { label: 'Docker & Cloud', href: '#consultoria' },
    ],
  },
]

const socials = [
  { icon: MessageCircle, href: 'https://wa.me/5500000000000', label: 'WhatsApp' },
  { icon: Github, href: 'https://github.com/lipehost', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/company/lipehost', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://instagram.com/lipehost', label: 'Instagram' },
  { icon: Mail, href: 'mailto:contato@lipe.host', label: 'E-mail' },
]

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#070707] overflow-hidden">
      {/* glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container-x relative py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center mb-5" aria-label="LIPE.HOST">
              <Image
                src="/lipehost-logo-navbar.png"
                alt="LIPE.HOST"
                width={161}
                height={40}
                className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs mb-6">
              A LIPE.HOST (lipehost) é uma empresa de desenvolvimento de software que cria sistemas,
              aplicativos, SaaS, marketplaces e soluções com Inteligência Artificial. Consultoria em
              infraestrutura e DevOps para colocar seu projeto em produção.
            </p>
            <div className="flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="size-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-500/30 flex items-center justify-center text-white/70 hover:text-white transition-all"
                >
                  <s.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerCols.map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-sm text-white mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('#') ? (
                      <a
                        href={link.href}
                        className="text-sm text-white/55 hover:text-white transition-colors flex items-center gap-1 group"
                      >
                        {link.label}
                        <ArrowUpRight className="size-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-white/55 hover:text-white transition-colors flex items-center gap-1 group"
                      >
                        {link.label}
                        <ArrowUpRight className="size-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} LIPE.HOST (lipehost) — Todos os direitos reservados. CNPJ 00.000.000/0001-00
          </p>
          <div className="flex items-center gap-6">
            <a href="/politica-de-privacidade" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              Política de Privacidade
            </a>
            <a href="/termos" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              Termos de Uso
            </a>
          </div>
        </div>

        {/* SEO descriptive block — visually hidden but indexed by Google */}
        <div className="sr-only" aria-hidden="false">
          <h2>Sobre a LIPE.HOST (lipehost)</h2>
          <p>
            A LIPE.HOST, também conhecida como lipehost ou LIPE HOST, é uma empresa brasileira de
            desenvolvimento de software fundada para ajudar empresas a acelerarem seus negócios com
            tecnologia. Atuamos no desenvolvimento de sistemas web, aplicativos mobile Android e
            iOS em Flutter, plataformas SaaS multiempresa, marketplaces multi-vendedores, CRMs,
            ERPs, sistemas de gestão, PDV e frente de caixa, além de soluções com Inteligência
            Artificial como agentes IA, chatbots e automações.
          </p>
          <p>
            Nossa stack inclui Flutter, Laravel, Next.js, React, Node.js, TypeScript, PostgreSQL,
            Redis, Docker, Firebase, OpenAI, AWS, Google Maps e Cloud. Oferecemos também
            consultoria completa em infraestrutura: Docker, cloud (AWS, Hetzner, Oracle Cloud,
            Azure, Digital Ocean), NGINX, CI/CD, deploy, monitoramento, backups, escalabilidade,
            load balance, firewall e SSL. Não vendemos hospedagem compartilhada — implantamos
            infraestrutura profissional para seu sistema.
          </p>
          <p>
            Na loja da LIPE.HOST você encontra sistemas prontos como aplicativo de mobilidade
            (Uber clone), sistema de delivery completo, marketplace multi-vendedores, sistema de
            vendas de passagens fluviais (EmbarqueTur), sistema de gestão de plantões hospitalares
            (Plantão Help), PDV completo, CRM de vendas, plataforma SaaS multiempresa, agente IA
            de atendimento, plataforma de ensino EAD, sistema financeiro ERP e portal imobiliário.
            Todos os sistemas podem ser personalizados e implantados com a sua marca.
          </p>
          <p>
            Além do desenvolvimento de software, a LIPE.HOST também oferece servidores dedicados,
            cloud servers (VPS) e servidores gerenciados em AWS, Hetzner, Oracle Cloud, Azure e
            Digital Ocean. Configuramos servidores profissionais com Docker, NGINX, PostgreSQL,
            Redis, SSL, firewall, proteção DDoS, backup automático e monitoramento 24/7. Não
            vendemos hospedagem compartilhada — entregamos infraestrutura de servidor profissional
            para garantir máximo desempenho, segurança e escalabilidade para seu sistema. Valores
            sob consulta, conforme a demanda de cada projeto.
          </p>
        </div>
      </div>
    </footer>
  )
}
