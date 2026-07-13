import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CursorGlow } from '@/components/cursor-glow'
import { SYSTEMS } from '@/lib/content'
import { SystemDetailClient } from '@/components/loja/system-detail-client'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return SYSTEMS.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const system = SYSTEMS.find((s) => s.slug === slug)
  if (!system) {
    return {
      title: 'Sistema não encontrado',
    }
  }

  return {
    title: `${system.name} — ${system.tagline}`,
    description: system.shortDescription,
    alternates: {
      canonical: `/loja/${system.slug}`,
    },
    openGraph: {
      title: `${system.name} — LIPE.HOST`,
      description: system.shortDescription,
      type: 'website',
      url: `/loja/${system.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${system.name} — LIPE.HOST`,
      description: system.shortDescription,
    },
  }
}

export default async function SystemDetailPage({ params }: PageProps) {
  const { slug } = await params
  const system = SYSTEMS.find((s) => s.slug === slug)

  if (!system) {
    notFound()
  }

  // related systems (same category or random)
  const related = SYSTEMS.filter((s) => s.slug !== system.slug && s.category === system.category).slice(0, 3)
  const fallbackRelated = SYSTEMS.filter((s) => s.slug !== system.slug).slice(0, 3)
  const finalRelated = related.length > 0 ? related : fallbackRelated

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: system.name,
    applicationCategory: system.category,
    operatingSystem: 'Web, Android, iOS',
    description: system.longDescription,
    offers: {
      '@type': 'Offer',
      price: system.startingPrice?.replace(/[^\d]/g, '') || '0',
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
    },
    featureList: system.features.map((f) => f.title),
    softwareRequirements: system.technologies.join(', '),
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <CursorGlow />
      <Navbar />

      <main className="flex-1 pt-32">
        <SystemDetailClient system={system} related={finalRelated} />
      </main>

      <Footer />
    </div>
  )
}
