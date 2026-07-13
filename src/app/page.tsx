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
import { Technologies } from '@/components/sections/technologies'
import { Portfolio } from '@/components/sections/portfolio'
import { Testimonials } from '@/components/sections/testimonials'
import { Faq } from '@/components/sections/faq'
import { FinalCta } from '@/components/sections/final-cta'

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* JSON-LD Organization schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'LIPE.HOST',
            description:
              'Desenvolvimento de sistemas, aplicativos, SaaS, inteligência artificial e consultoria em infraestrutura.',
            url: 'https://lipe.host',
            logo: 'https://lipe.host/logo.png',
            sameAs: [
              'https://github.com/lipehost',
              'https://linkedin.com/company/lipehost',
              'https://instagram.com/lipehost',
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'sales',
              availableLanguage: ['Portuguese', 'English'],
              url: 'https://lipe.host#contato',
            },
          }),
        }}
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
