import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

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
    default: "LIPE.HOST — Sistemas, Aplicativos e IA para Empresas",
    template: "%s · LIPE.HOST",
  },
  description:
    "Desenvolvemos aplicativos, sistemas web, marketplaces, CRMs, plataformas SaaS e soluções com Inteligência Artificial. Consultoria completa em infraestrutura, DevOps e escalabilidade.",
  keywords: [
    "desenvolvimento de sistemas",
    "aplicativos mobile",
    "saas",
    "marketplace",
    "inteligência artificial",
    "consultoria infraestrutura",
    "devops",
    "flutter",
    "laravel",
    "nextjs",
    "LIPE.HOST",
  ],
  authors: [{ name: "LIPE.HOST" }],
  creator: "LIPE.HOST",
  publisher: "LIPE.HOST",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "LIPE.HOST",
    title: "LIPE.HOST — Sistemas, Aplicativos e IA para Empresas",
    description:
      "Criamos sistemas que aceleram empresas. Aplicativos, SaaS, marketplaces, IA e infraestrutura profissional.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LIPE.HOST",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LIPE.HOST — Sistemas, Aplicativos e IA para Empresas",
    description:
      "Criamos sistemas que aceleram empresas. Aplicativos, SaaS, marketplaces, IA e infraestrutura profissional.",
    images: ["/og-image.png"],
    creator: "@lipehost",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <body
        className={`${inter.variable} antialiased bg-background text-foreground font-sans selection:bg-blue-500/30`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
