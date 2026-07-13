'use client'

import Link from 'next/link'
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
            <Link href="/" className="flex items-center gap-2 mb-5">
              <div className="size-9 rounded-lg gradient-bg flex items-center justify-center">
                <Rocket className="size-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-extrabold text-xl">
                LIPE<span className="gradient-text">.HOST</span>
              </span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs mb-6">
              Criamos sistemas que aceleram empresas. Desenvolvimento de software, inteligência artificial e infraestrutura profissional.
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
            © {new Date().getFullYear()} LIPE.HOST — Todos os direitos reservados. CNPJ 00.000.000/0001-00
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
      </div>
    </footer>
  )
}
