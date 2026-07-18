import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CursorGlow } from '@/components/cursor-glow'
import { Hero } from '@/components/sections/hero'
import { TechLogos } from '@/components/sections/tech-logos'
import { Stats } from '@/components/sections/stats'
import { Services } from '@/components/sections/services'
import { FeaturedSystems } from '@/components/sections/featured-systems'
import { HowItWorks } from '@/components/sections/how-it-works'
import { CustomDev } from '@/components/sections/custom-dev'
import { Consulting } from '@/components/sections/consulting'
import { Servers } from '@/components/sections/servers'
import { Technologies } from '@/components/sections/technologies'
import { Portfolio } from '@/components/sections/portfolio'
import { Testimonials } from '@/components/sections/testimonials'
import { Faq } from '@/components/sections/faq'
import { FinalCta } from '@/components/sections/final-cta'
import { FAQ } from '@/lib/content'

const siteUrl = 'https://lipe.host'

export default function Home() {
  // JSON-LD: FAQPage (all homepage FAQ questions become eligible for Google rich results)
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  // JSON-LD: BreadcrumbList for homepage
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Início',
        item: siteUrl,
      },
    ],
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <CursorGlow />
      <Navbar />

      <main className="flex-1">
        <Hero />
        <TechLogos />
        <Stats />
        <Services />
        <FeaturedSystems />
        <HowItWorks />
        <CustomDev />
        <Consulting />
        <Servers />
        <Technologies />
        <Portfolio />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>

      <Footer />
    </div>
  )
}
