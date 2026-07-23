import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { SYSTEMS } from '@/lib/content'

const siteUrl = 'https://lipe.host'

export const metadata: Metadata = {
  title: 'Mapa do Site — LipeHost | Todos os Links',
  description: 'Mapa do site LipeHost com todas as páginas organizadas para facilitar sua navegação e a indexação pelos buscadores.',
  alternates: { canonical: '/sitemap-html' },
  robots: { index: true, follow: true },
}

const CATEGORIES = [
  { slug: 'mobilidade', name: 'Mobilidade' },
  { slug: 'delivery', name: 'Delivery' },
  { slug: 'marketplace', name: 'Marketplace' },
  { slug: 'saude', name: 'Saúde' },
  { slug: 'saas', name: 'SaaS' },
  { slug: 'ia', name: 'IA' },
  { slug: 'erp', name: 'ERP' },
  { slug: 'crm', name: 'CRM' },
  { slug: 'educacao', name: 'Educação' },
  { slug: 'turismo', name: 'Turismo' },
  { slug: 'financeiro', name: 'Financeiro' },
]

export default function SitemapHtmlPage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="container-x">
          <header className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              <span className="gradient-text">Mapa do Site</span>
            </h1>
            <p className="mt-5 text-base text-white/60 max-w-2xl">
              Todas as páginas da LipeHost organizadas em um só lugar para facilitar sua navegação.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Páginas principais */}
            <section>
              <h2 className="text-lg font-bold mb-4 text-white/80">Páginas principais</h2>
              <ul className="space-y-2">
                <li><Link href="/" className="text-sm text-blue-400 hover:underline">Início — LipeHost</Link></li>
                <li><Link href="/loja" className="text-sm text-blue-400 hover:underline">Loja de Sistemas</Link></li>
                <li><Link href="/loja/categorias" className="text-sm text-blue-400 hover:underline">Categorias de Sistemas</Link></li>
                <li><Link href="/login" className="text-sm text-blue-400 hover:underline">Login / Registrar-se</Link></li>
                <li><Link href="/painel" className="text-sm text-blue-400 hover:underline">Painel do Cliente</Link></li>
              </ul>
            </section>

            {/* Categorias */}
            <section>
              <h2 className="text-lg font-bold mb-4 text-white/80">Categorias de sistemas</h2>
              <ul className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/loja/categoria/${cat.slug}`}
                      className="text-sm text-blue-400 hover:underline"
                    >
                      Lipe {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* Sistemas */}
            <section>
              <h2 className="text-lg font-bold mb-4 text-white/80">Sistemas disponíveis</h2>
              <ul className="space-y-2">
                {SYSTEMS.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/loja/${s.slug}`}
                      className="text-sm text-blue-400 hover:underline"
                    >
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
