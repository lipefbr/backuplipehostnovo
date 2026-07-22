import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CursorGlow } from '@/components/cursor-glow'
import { SYSTEMS } from '@/lib/content'

const siteUrl = 'https://lipe.host'

export const metadata: Metadata = {
  title: 'Categorias de Sistemas — Todos os Tipos de Software',
  description: 'Explore todas as categorias de sistemas da LipeHost: mobilidade, delivery, marketplace, saúde, SaaS, IA, ERP, CRM, educação, turismo e financeiro. Encontre o software ideal para seu negócio.',
  alternates: { canonical: '/loja/categorias' },
  keywords: [
    'categorias de sistemas', 'tipos de software', 'sistemas por categoria',
    'lipehost categorias', 'software empresarial', 'sistemas prontos brasil',
    'aplicativos por categoria', 'sistemas web por setor'
  ],
  openGraph: {
    title: 'Categorias de Sistemas — LipeHost',
    description: 'Explore todas as categorias de sistemas da LipeHost: mobilidade, delivery, marketplace, saúde, SaaS, IA e mais.',
    type: 'website',
    url: `${siteUrl}/loja/categorias`,
    siteName: 'LipeHost',
  },
}

const CATEGORIES = [
  { slug: 'mobilidade', name: 'Mobilidade', icon: '🚗', description: 'Apps de transporte privado, tipo Uber, com motoristas, passageiros e mapa em tempo real.' },
  { slug: 'delivery', name: 'Delivery', icon: '🛵', description: 'Sistemas de entrega de comida, mercado e farmácia com rastreamento em tempo real.' },
  { slug: 'marketplace', name: 'Marketplace', icon: '🛒', description: 'Plataformas multi-vendedores tipo Mercado Livre e Shopee com comissões e split de pagamento.' },
  { slug: 'saude', name: 'Saúde', icon: '🏥', description: 'Sistemas para clínicas, hospitais e profissionais de saúde. Gestão de plantões, PEP, telemedicina.' },
  { slug: 'saas', name: 'SaaS', icon: '☁️', description: 'Plataformas SaaS multiempresa (multi-tenant) com cobrança recorrente e white-label.' },
  { slug: 'ia', name: 'IA', icon: '🤖', description: 'Agentes IA, chatbots inteligentes, automação de backoffice com GPT-4, Claude, GLM-4 e Llama.' },
  { slug: 'erp', name: 'ERP', icon: '📊', description: 'Sistemas financeiros completos: contas a pagar/receber, fluxo de caixa, NF-e, NFS-e, DRE.' },
  { slug: 'crm', name: 'CRM', icon: '💼', description: 'CRM de vendas com funil comercial, automação de follow-up, integração com WhatsApp e mobile.' },
  { slug: 'educacao', name: 'Educação', icon: '🎓', description: 'Plataformas EAD com vídeo aulas, provas online, certificados, marketplace de cursos e gamificação.' },
  { slug: 'turismo', name: 'Turismo', icon: '✈️', description: 'Sistemas para turismo: venda de passagens fluviais, rodoviárias, aéreas, pacotes e check-in online.' },
  { slug: 'financeiro', name: 'Financeiro', icon: '💰', description: 'Fintech, carteiras digitais, integração PIX, Open Finance, plataformas de empréstimo e investimento.' },
]

export default function CategoriesPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Loja', item: `${siteUrl}/loja` },
      { '@type': 'ListItem', position: 3, name: 'Categorias', item: `${siteUrl}/loja/categorias` },
    ],
  }

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Categorias de Sistemas LipeHost',
    description: 'Lista de todas as categorias de sistemas disponíveis na LipeHost.',
    url: `${siteUrl}/loja/categorias`,
    numberOfItems: CATEGORIES.length,
    itemListElement: CATEGORIES.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      url: `${siteUrl}/loja/categoria/${c.slug}`,
    })),
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      <CursorGlow />
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="container-x">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-white/40 mb-8">
            <Link href="/" className="hover:text-white/70">Início</Link>
            <span>/</span>
            <Link href="/loja" className="hover:text-white/70">Loja</Link>
            <span>/</span>
            <span className="text-white/60">Categorias</span>
          </nav>

          <header className="mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              <span className="gradient-text">Categorias de Sistemas</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/60 leading-relaxed max-w-3xl">
              Explore todas as categorias de sistemas prontos e personalizados desenvolvidos pela LipeHost.
              De apps de mobilidade a fintechs, temos a solução ideal para acelerar seu negócio.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => {
              const count = SYSTEMS.filter(s =>
                s.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ===
                cat.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
              ).length

              return (
                <Link
                  key={cat.slug}
                  href={`/loja/categoria/${cat.slug}`}
                  className="block glass p-6 rounded-2xl hover:border-white/20 transition-colors group"
                >
                  <div className="text-4xl mb-4">{cat.icon}</div>
                  <h2 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                    {cat.name}
                  </h2>
                  <p className="text-sm text-white/60 leading-relaxed mb-4">
                    {cat.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">{count} sistema{count !== 1 ? 's' : ''}</span>
                    <span className="text-xs text-blue-400 group-hover:underline">Ver sistemas →</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
