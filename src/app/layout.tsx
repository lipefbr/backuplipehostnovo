import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/session-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const siteUrl = "https://lipe.host";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LipeHost — Desenvolvimento de Sistemas, Aplicativos, SaaS e IA",
    template: "%s · LipeHost",
  },
  description:
    "LipeHost (lipehost) — empresa de desenvolvimento de software. Criamos aplicativos mobile, sistemas web, marketplaces, CRMs, plataformas SaaS e soluções com Inteligência Artificial. Consultoria em infraestrutura, DevOps, Docker, cloud e escalabilidade.",
  keywords: [
    "lipehost",
    "lipe.host",
    "LIPE HOST",
    "lipe host",
    "desenvolvimento de sistemas",
    "empresa de desenvolvimento de software",
    "aplicativos mobile",
    "apps android ios",
    "flutter",
    "sistemas web",
    "marketplace",
    "crm",
    "erp",
    "saas",
    "plataforma saas",
    "inteligência artificial",
    "agentes ia",
    "chatbot ia",
    "consultoria infraestrutura",
    "devops",
    "docker",
    "cloud aws",
    "servidores dedicados",
    "cloud server vps",
    "hospedagem profissional",
    "servidor gerenciado",
    "alugar servidor",
    "escalabilidade",
    "nextjs",
    "laravel",
    "nodejs",
    "uber clone",
    "app de delivery",
    "pdv frente de caixa",
    "sistema de gestão",
    "sistemas prontos",
    "sistemas personalizados",
    "empresa de tecnologia brasil",
    "software house",
  ],
  authors: [{ name: "LipeHost", url: siteUrl }],
  creator: "LipeHost",
  publisher: "LipeHost",
  applicationName: "LipeHost",
  category: "Technology",
  alternates: {
    canonical: "/",
    languages: {
      "pt-BR": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "LipeHost",
    title: "LipeHost — Sistemas, Aplicativos, SaaS e IA para Empresas",
    description:
      "Criamos sistemas que aceleram empresas. Aplicativos mobile, sistemas web, marketplaces, CRMs, plataformas SaaS, IA e consultoria em infraestrutura profissional.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LipeHost — Sistemas, Aplicativos e IA para Empresas",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@lipehost",
    creator: "@lipehost",
    title: "LipeHost — Sistemas, Aplicativos, SaaS e IA para Empresas",
    description:
      "Criamos sistemas que aceleram empresas. Aplicativos, SaaS, marketplaces, IA e infraestrutura profissional.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [{ url: "/safari-pinned-tab.svg", rel: "mask-icon" }],
  },
  manifest: "/manifest.json",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  other: {
    "msapplication-TileColor": "#090909",
    "theme-color": "#090909",
  },
};

export const viewport = {
  themeColor: "#090909",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <head>
        {/* Preconnect to Google Fonts for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* JSON-LD: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              '@id': `${siteUrl}/#organization`,
              name: 'LipeHost',
              alternateName: 'lipehost',
              url: siteUrl,
              logo: `${siteUrl}/lipehost-logo.png`,
              description:
                'Empresa de desenvolvimento de software. Criamos sistemas, aplicativos, SaaS, marketplaces e soluções com Inteligência Artificial. Consultoria em infraestrutura.',
              foundingDate: '2020',
              knowsLanguage: ['pt-BR', 'en'],
              contactPoint: [
                {
                  '@type': 'ContactPoint',
                  contactType: 'sales',
                  availableLanguage: ['Portuguese', 'English'],
                  url: `${siteUrl}/#contato`,
                },
              ],
              sameAs: [
                'https://github.com/lipehost',
                'https://linkedin.com/company/lipehost',
                'https://instagram.com/lipehost',
              ],
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'BR',
              },
            }),
          }}
        />

        {/* JSON-LD: WebSite with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              '@id': `${siteUrl}/#website`,
              url: siteUrl,
              name: 'LipeHost',
              alternateName: 'lipehost',
              description:
                'Desenvolvimento de sistemas, aplicativos, SaaS e inteligência artificial para empresas.',
              publisher: { '@id': `${siteUrl}/#organization` },
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${siteUrl}/loja?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
              inLanguage: 'pt-BR',
            }),
          }}
        />

        {/* JSON-LD: ProfessionalService */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ProfessionalService',
              '@id': `${siteUrl}/#service`,
              name: 'LipeHost',
              alternateName: 'lipehost',
              description:
                'Desenvolvimento de sistemas personalizados, aplicativos mobile, SaaS, marketplaces e inteligência artificial.',
              url: siteUrl,
              logo: `${siteUrl}/lipehost-logo.png`,
              image: `${siteUrl}/og-image.png`,
              priceRange: '$$',
              areaServed: { '@type': 'Country', name: 'Brazil' },
              serviceType: [
                'Desenvolvimento de Sistemas',
                'Aplicativos Mobile',
                'Plataformas SaaS',
                'Marketplaces',
                'Inteligência Artificial',
                'Consultoria em Infraestrutura',
              ],
              provider: { '@id': `${siteUrl}/#organization` },
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} antialiased bg-background text-foreground font-sans selection:bg-blue-500/30`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
