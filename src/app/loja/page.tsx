'use client'

import * as React from 'react'
import Link from 'next/link'
import { Search, ArrowRight, ArrowLeft, SlidersHorizontal, X } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CursorGlow } from '@/components/cursor-glow'
import { Reveal, Stagger, StaggerItem } from '@/components/reveal'
import { SYSTEMS, CATEGORIES } from '@/lib/content'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function LojaPage() {
  const [query, setQuery] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState<string>('Todos')

  const filtered = React.useMemo(() => {
    return SYSTEMS.filter((s) => {
      const matchesCategory =
        activeCategory === 'Todos' || s.category === activeCategory
      const q = query.toLowerCase().trim()
      const matchesQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.shortDescription.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.technologies.some((t) => t.toLowerCase().includes(q)) ||
        s.highlights.some((h) => h.toLowerCase().includes(q))
      return matchesCategory && matchesQuery
    })
  }, [query, activeCategory])

  return (
    <div className="relative min-h-screen flex flex-col">
      <CursorGlow />
      <Navbar />

      <main className="flex-1 pt-32">
        {/* Hero header */}
        <section className="relative py-12 border-b border-white/5 overflow-hidden">
          <div className="absolute inset-0 grid-bg grid-bg-radial opacity-50" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-500/15 blur-[120px] rounded-full pointer-events-none" />

          <div className="container-x relative">
            <Reveal direction="up">
              <div className="mb-5">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
                >
                  <ArrowLeft className="size-3.5" />
                  Voltar para o site
                </Link>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-medium text-blue-300 mb-5">
                <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
                Catálogo de Sistemas
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Sistemas prontos para{' '}
                <span className="gradient-text">implantação imediata</span>
              </h1>
              <p className="mt-5 text-base text-white/60 max-w-2xl">
                Mais de 12 sistemas desenvolvidos, testados e em produção. Escolha o sistema ideal
                para o seu negócio e entre em operação em semanas.
              </p>
            </Reveal>

            {/* Search + filter bar */}
            <Reveal direction="up" delay={0.1} className="mt-10">
              <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Pesquisar sistemas pelo nome, tecnologia ou recurso..."
                  className="h-12 pl-11 pr-11 bg-[#111] border-white/10 text-white placeholder:text-white/40 rounded-xl focus-visible:border-blue-500/50"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 size-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60"
                    aria-label="Limpar"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                <SlidersHorizontal className="size-4 text-white/40 flex-shrink-0 mr-1" />
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                      activeCategory === cat
                        ? 'gradient-bg text-white border-transparent'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Grid */}
        <section className="py-12">
          <div className="container-x">
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-white/50">
                <span className="text-white font-semibold">{filtered.length}</span> sistema(s) encontrado(s)
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-24">
                <div className="size-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
                  <Search className="size-7 text-white/40" />
                </div>
                <h3 className="text-xl font-bold mb-2">Nenhum sistema encontrado</h3>
                <p className="text-sm text-white/50 mb-6">Tente outro termo ou categoria.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery('')
                    setActiveCategory('Todos')
                  }}
                  className="border-white/15 bg-white/5 hover:bg-white/10"
                >
                  Limpar filtros
                </Button>
              </div>
            ) : (
              <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((sys) => (
                  <StaggerItem key={sys.slug}>
                    <Link href={`/loja/${sys.slug}`} className="group block h-full">
                      <article className="relative h-full rounded-2xl border border-white/8 bg-[#111] overflow-hidden card-hover">
                        {/* image area */}
                        <div className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${sys.screenshots[0].gradient}`}>
                          <div className="absolute inset-0 noise-overlay" />
                          {/* mockup browser frame */}
                          <div className="absolute inset-4 rounded-lg bg-[#0a0a0a]/80 backdrop-blur-sm border border-white/10 overflow-hidden">
                            <div className="flex items-center gap-1 px-3 py-2 border-b border-white/10">
                              <div className="size-1.5 rounded-full bg-white/30" />
                              <div className="size-1.5 rounded-full bg-white/30" />
                              <div className="size-1.5 rounded-full bg-white/30" />
                            </div>
                            <div className="p-3 space-y-2">
                              <div className="h-2 w-1/3 rounded bg-white/20" />
                              <div className="h-2 w-1/2 rounded bg-white/10" />
                              <div className="grid grid-cols-3 gap-1.5 mt-2">
                                <div className="h-8 rounded bg-white/10" />
                                <div className="h-8 rounded bg-white/10" />
                                <div className="h-8 rounded bg-white/10" />
                              </div>
                            </div>
                          </div>
                          {/* category chip */}
                          <div className="absolute top-3 left-3 z-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 px-3 py-1 text-[10px] font-medium text-white">
                            {sys.category}
                          </div>
                          {/* price tag */}
                          {sys.startingPrice && (
                            <div className="absolute top-3 right-3 z-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 px-3 py-1 text-[10px] font-semibold text-emerald-300">
                              a partir de {sys.startingPrice}
                            </div>
                          )}
                        </div>

                        {/* content */}
                        <div className="p-5">
                          <h3 className="text-lg font-bold text-white mb-1.5 group-hover:gradient-text transition-all">
                            {sys.name}
                          </h3>
                          <p className="text-xs text-white/50 mb-3">{sys.tagline}</p>
                          <p className="text-sm text-white/60 leading-relaxed mb-4 line-clamp-2">
                            {sys.shortDescription}
                          </p>

                          {/* highlights chips */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {sys.highlights.slice(0, 5).map((h) => (
                              <span
                                key={h}
                                className="text-[10px] font-medium px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white/60"
                              >
                                {h}
                              </span>
                            ))}
                          </div>

                          {/* tech chips */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {sys.technologies.slice(0, 4).map((tech) => (
                              <span
                                key={tech}
                                className="text-[10px] font-medium px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300"
                              >
                                {tech}
                              </span>
                            ))}
                            {sys.technologies.length > 4 && (
                              <span className="text-[10px] font-medium px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white/40">
                                +{sys.technologies.length - 4}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-white/8">
                            <span className="text-xs text-white/40">
                              {sys.startingPrice ? `a partir de ${sys.startingPrice}` : 'Sob consulta'}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 group-hover:gap-2 transition-all">
                              Ver detalhes
                              <ArrowRight className="size-3.5" />
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 border-t border-white/5">
          <div className="container-x">
            <Reveal className="relative rounded-2xl border border-white/10 bg-[#0c0c0c] p-8 sm:p-12 text-center overflow-hidden">
              <div className="absolute inset-0 grid-bg grid-bg-radial opacity-50" />
              <div className="relative">
                <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">
                  Não encontrou o sistema ideal?
                </h3>
                <p className="text-sm text-white/60 max-w-lg mx-auto mb-7">
                  Desenvolvemos qualquer sistema sob medida para sua empresa. Conte sua ideia e
                  cuidamos do resto.
                </p>
                <Link
                  href="/#contato"
                  className="inline-flex items-center gap-2 h-12 px-7 rounded-xl gradient-bg text-white font-semibold hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:scale-[1.02]"
                >
                  Solicitar projeto personalizado
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
