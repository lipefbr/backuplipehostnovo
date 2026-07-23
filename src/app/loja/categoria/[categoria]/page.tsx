import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CursorGlow } from '@/components/cursor-glow'
import { SYSTEMS, SystemCategory } from '@/lib/content'

const siteUrl = 'https://lipe.host'

// SEO-friendly category metadata
const CATEGORY_INFO: Record<string, {
  title: string
  h1: string
  description: string
  longDescription: string
  keywords: string[]
  faq: { q: string; a: string }[]
}> = {
  'mobilidade': {
    title: 'App de Mobilidade (Uber Clone) — Lipe Mobilidade',
    h1: 'Aplicativo de Mobilidade (Uber Clone) — Lipe Mobilidade',
    description: 'Desenvolvimento de aplicativo de mobilidade tipo Uber (Lipe Mobilidade). App de transporte privado com motoristas, passageiros, mapa em tempo real, pagamentos e painel administrativo. Código-fonte incluso.',
    longDescription: 'A LipeHost desenvolve aplicativos de mobilidade urbana completos, conhecidos como Lipe Mobilidade — uma solução tipo Uber clone com app para motorista, app para passageiro, painel administrativo web, mapa em tempo real com Google Maps, cálculo automático de tarifa por km/tempo, pagamentos via cartão/Pix/dinheiro, avaliação de motoristas, sistema de coupons e promoções, e relatórios financeiros completos. Nosso app de mobilidade é multiplataforma (Android e iOS) com backend escalável em Node.js/PostgreSQL.',
    keywords: [
      'lipe mobilidade', 'app de mobilidade', 'uber clone', 'aplicativo tipo uber',
      'app de transporte privado', 'aplicativo de mobilidade urbana', 'taxi app',
      'app motorista passageiro', 'lipe mobilidade app', 'mobilidade urbana app',
      'aplicativo de transporte', 'app corrida motorista', 'clone uber brasil',
      'app de vakinha', 'aplicativo 99 taxi', 'aplicativo de transporte individual'
    ],
    faq: [
      { q: 'Quanto custa um aplicativo de mobilidade tipo Uber?', a: 'Um app de mobilidade completo (motorista + passageiro + painel) parte de R$ 12.000 para implantação com marca do cliente. Inclui código-fonte, deploy e suporte.' },
      { q: 'O Lipe Mobilidade funciona em Android e iOS?', a: 'Sim. Desenvolvemos em Flutter, então o mesmo código gera APK para Android e IPA para iOS. Ambos publicáveis nas lojas.' },
      { q: 'Quanto tempo leva para lançar meu app de mobilidade?', a: 'Com o sistema pronto (Lipe Mobilidade), o prazo típico é de 3 a 6 semanas para personalização de marca, ajustes regionais e publicação nas lojas.' },
      { q: 'O app tem mapa em tempo real?', a: 'Sim, usamos Google Maps SDK com tracking em tempo real do motorista, cálculo de rota otimizada, ETA dinâmico e geofencing.' },
      { q: 'Posso cobrar comissões das corridas?', a: 'Sim. O painel permite configurar comissão percentual por corrida, taxas fixas, surge pricing em horários de pico e splits entre motoristas.' },
    ],
  },
  'delivery': {
    title: 'Sistema de Delivery Completo — Lipe Delivery',
    h1: 'Sistema de Delivery Completo — Lipe Delivery',
    description: 'Sistema de delivery de comida, mercado e farmácia (Lipe Delivery). App para cliente, lojista e entregador com rastreamento em tempo real, pagamentos online e painel administrativo.',
    longDescription: 'O Lipe Delivery é um sistema completo de delivery para restaurantes, supermercados, farmácias e qualquer negócio que precise entregar produtos. Inclui app do cliente (catálogo, carrinho, pagamento, rastreio), app do lojista (gestão de pedidos, cardápio, cupons), app do entregador (aceite de corridas, navegação, comprovante) e painel administrativo web com relatórios, gestão de lojistas, comissões e fiscalização. Compatível com iFood, Rappi e UberEats em funcionalidades.',
    keywords: [
      'lipe delivery', 'sistema de delivery', 'app de delivery', 'aplicativo de entrega',
      'delivery de comida', 'delivery de mercado', 'delivery de farmacia',
      'sistema ifood clone', 'rappi clone', 'ubereats clone', 'app de entrega de comida',
      'sistema de entrega', 'software delivery', 'lipe delivery app', 'delivery brasil',
      'aplicativo delivery completo', 'app entregador', 'gestão de delivery'
    ],
    faq: [
      { q: 'O Lipe Delivery funciona para restaurantes e mercados?', a: 'Sim. O sistema é multi-negócio: restaurantes, supermercados, farmácias, lojas de conveniência. Cada lojista tem seu cardápio/catálogo próprio.' },
      { q: 'Tem rastreamento em tempo real do entregador?', a: 'Sim. O cliente vê o entregador se movendo no mapa em tempo real, com ETA dinâmico e notificação push quando o pedido está chegando.' },
      { q: 'Posso cobrar comissão dos lojistas?', a: 'Sim. O painel admin permite configurar comissão percentual por pedido, taxa fixa mensal, planos por volume e split automático de pagamentos.' },
      { q: 'Quanto custa um sistema de delivery completo?', a: 'Parte de R$ 8.000 para implantação do Lipe Delivery com a sua marca. Inclui apps (cliente/lojista/entregador), painel admin, deploy e suporte.' },
      { q: 'Funciona com Pix e cartão?', a: 'Sim. Integração com Stripe, Mercado Pago, Asaas e PagSeguro para cartão, Pix e boleto. Dinheiro na entrega também é suportado.' },
    ],
  },
  'marketplace': {
    title: 'Marketplace Multi-Vendedores — Lipe Marketplace',
    h1: 'Plataforma Marketplace Multi-Vendedores — Lipe Marketplace',
    description: 'Desenvolvimento de marketplace multi-vendedores (Lipe Marketplace). Plataforma tipo Mercado Livre/Shopee com gestão de lojistas, comissões, pagamentos split, avaliações e logística.',
    longDescription: 'A LipeHost constrói marketplaces multi-vendedores completos — o Lipe Marketplace. Cada vendedor tem sua loja virtual dentro da plataforma, com catálogo próprio, gestão de pedidos, avaliações e relatórios. O admin da plataforma controla comissões por venda, planos de assinatura, moderação de produtos, logística integrada, pagamento split (Mercado Pago, Stripe), fraud detection e dashboards financeiros. Solução ideal para quem quer lançar o próximo Mercado Livre, Shopee, Amazon ou Etsy do seu nicho.',
    keywords: [
      'lipe marketplace', 'marketplace multi vendedores', 'marketplace tipo mercado livre',
      'shopee clone', 'etsy clone', 'amazon clone', 'marketplace vertical',
      'plataforma de marketplace', 'software marketplace', 'comissoes marketplace',
      'split de pagamento', 'marketplace b2b', 'marketplace b2c', 'marketplace brasil',
      'loja multi vendedor', 'ecommerce marketplace', 'lipe ecommerce', 'marketplace saas'
    ],
    faq: [
      { q: 'Como funciona a cobrança de comissão dos vendedores?', a: 'O painel admin permite configurar comissão percentual por venda, taxa fixa por anúncio, planos de assinatura mensal e split automático no ato do pagamento.' },
      { q: 'Posso ter milhares de vendedores simultâneos?', a: 'Sim. A arquitetura é escalável (PostgreSQL + Redis + CDN), suportando de 10 a 10.000+ vendedores sem degradação. Cache agressivo para listagens.' },
      { q: 'Tem moderação de produtos?', a: 'Sim. Moderação manual (aprovação antes de publicar) ou automática (palavras proibidas, categorias bloqueadas). Logs completos de ações.' },
      { q: 'Quanto custa um marketplace multi-vendedores?', a: 'Parte de R$ 15.000 para implantação do Lipe Marketplace com sua marca. Inclui painel admin, painel do vendedor, loja pública, deploy e suporte.' },
    ],
  },
  'saude': {
    title: 'Sistemas para Saúde — Lipe Saúde',
    h1: 'Sistemas para Saúde e Medicina — Lipe Saúde',
    description: 'Sistemas para clínicas, hospitais e profissionais de saúde. Gestão de plantões, prontuário eletrônico, agendamento de consultas, telemedicina e marketplace de saúde.',
    longDescription: 'A Lipe Saúde é a linha de sistemas de saúde da LipeHost. Inclui gestão de plantões hospitalares (Plantão Help), prontuário eletrônico (PEP), agendamento de consultas, prontuário médico digital, telemedicina, marketplace de serviços de saúde, gestão de convênios, prescrição digital de medicamentos, integração com laboratórios e CID-10. Conformidade com LGPD e CFM.',
    keywords: [
      'lipe saúde', 'sistema para clinica', 'sistema hospitalar', 'gestão de plantões',
      'prontuário eletrônico', 'sistema de saúde', 'software médico', 'telemedicina',
      'agendamento de consultas', 'prescrição digital', 'sistema de plantão médico',
      'marketplace de saúde', 'sistema para hospital', 'lipe saúde sistemas',
      'sistema clínico completo', 'PEP prontuário', 'CFM conformidade'
    ],
    faq: [
      { q: 'Os sistemas de saúde seguem a LGPD?', a: 'Sim. Todos os sistemas Lipe Saúde seguem rigorosamente a LGPD: criptografia em repouso e trânsito, logs de auditoria, consentimento explícito, direito ao esquecimento e DPO designado.' },
      { q: 'Tem conformidade com o CFM?', a: 'Sim. Prontuário eletrônico segue resoluções do CFM, com assinatura digital, validade jurídica e padrão de interoperabilidade HL7 FHIR.' },
      { q: 'Funciona para clínicas pequenas e hospitais?', a: 'Sim. Multi-tenant: cada clínica tem seu ambiente isolado. Pequenas clínicas (1-10 médicos) e grandes hospitais (500+ médicos) usam a mesma plataforma.' },
    ],
  },
  'saas': {
    title: 'Plataforma SaaS Multiempresa — Lipe SaaS',
    h1: 'Plataforma SaaS Multiempresa — Lipe SaaS',
    description: 'Plataforma SaaS multiempresa (multi-tenant) pronta para escalar. Cobrança recorrente, isolamento de dados por tenant, white-label, dashboards e API.',
    longDescription: 'O Lipe SaaS é uma plataforma multiempresa (multi-tenant) pronta para lançar seu software como serviço. Inclui autenticação com isolamento completo de dados por tenant, cobrança recorrente via Stripe/Mercado Pago (mensal/anual), planos e features por plano, dashboards de uso, white-label (cada cliente com sua logo e cores), API REST completa com rate limiting, notificações por email/push, gestão de equipe por tenant, auditoria e logs. Stack: Next.js + Prisma + PostgreSQL + Redis.',
    keywords: [
      'lipe saas', 'plataforma saas', 'saas multiempresa', 'multi tenant',
      'software as a service', 'saas white label', 'cobrança recorrente saas',
      'plataforma multi tenant', 'saas pronto', 'saas brasil', 'saas boilerplate',
      'starter saas', 'saas starter kit', 'lipehost saas', 'plataforma saas escalável'
    ],
    faq: [
      { q: 'Como funciona o isolamento de dados entre tenants?', a: 'Isolamento em nível de row (Row Level Security do PostgreSQL). Cada query é automaticamente filtrada por tenant_id. Impossível um tenant acessar dados de outro.' },
      { q: 'Tem cobrança recorrente integrada?', a: 'Sim. Stripe, Mercado Pago e Asaas. Suporta mensal, anual, trial de 14 dias, upgrade/downgrade de plano com prorratação automática.' },
      { q: 'Posso fazer white-label?', a: 'Sim. Cada tenant pode ter sua própria logo, cores, domínio customizado e emails transacionais com o domínio dele.' },
      { q: 'Quanto custa a plataforma SaaS?', a: 'Parte de R$ 10.000 para implantação do Lipe SaaS com seu modelo de negócio. Código-fonte incluso.' },
    ],
  },
  'ia': {
    title: 'Agentes IA e Automação com IA — Lipe IA',
    h1: 'Agentes IA e Automação com Inteligência Artificial — Lipe IA',
    description: 'Desenvolvimento de agentes IA, chatbots inteligentes, automação de atendimento e backoffice com IA. Integração com OpenAI GPT-4, Claude, Llama e GLM.',
    longDescription: 'A Lipe IA é a linha de produtos de inteligência artificial da LipeHost. Desenvolvemos agentes IA autônomos para atendimento ao cliente, automação de backoffice, análise de documentos, classificação de tickets, geração de conteúdo, copilots para ERPs e CRMs, RAG (Retrieval Augmented Generation) sobre sua base de conhecimento, voice agents para call center, e automações personalizadas com n8n, LangChain e frameworks próprios. Integração com OpenAI, Anthropic Claude, Meta Llama, GLM-4 e modelos open-source self-hosted.',
    keywords: [
      'lipe ia', 'agente ia', 'chatbot inteligente', 'automação com ia',
      'inteligência artificial empresarial', 'ia para atendimento', 'ia customer service',
      'gpt 4 empresarial', 'claude ia brasil', 'glm 4 ia', 'rag retrieval augmented',
      'ia automation', 'lipe ia agentes', 'copilot empresarial', 'ai agent brasil',
      'automação backoffice ia', 'voice agent ia', 'langchain brasil'
    ],
    faq: [
      { q: 'Posso treinar o agente IA com os dados da minha empresa?', a: 'Sim. Usamos RAG (Retrieval Augmented Generation) — você sobe seus PDFs, docs, tickets históricos, base de conhecimento e o agente responde com base nesses dados, sem alucinar.' },
      { q: 'Funciona em português brasileiro?', a: 'Sim. Todos os modelos (GPT-4, Claude, Llama, GLM-4) suportam pt-BR nativamente. Tunamos prompts e exemplos para o contexto brasileiro.' },
      { q: 'Quanto custa um agente IA personalizado?', a: 'Parte de R$ 5.000 para implantação de um agente IA com RAG sobre sua base. Mensalidade para hospedagem + tokens consumidos.' },
      { q: 'Integra com WhatsApp, Telegram e Slack?', a: 'Sim. WhatsApp Business API (oficial Meta), Telegram Bot API, Slack Bolt, Microsoft Teams e webchat embeddable no seu site.' },
    ],
  },
  'erp': {
    title: 'Sistema Financeiro ERP — Lipe ERP',
    h1: 'Sistema Financeiro ERP Empresarial — Lipe ERP',
    description: 'ERP financeiro completo: contas a pagar/receber, fluxo de caixa, conciliação bancária, NFS-e, NF-e, relatórios gerenciais e dashboards.',
    longDescription: 'O Lipe ERP é um sistema financeiro empresarial completo para PMEs e médias empresas. Inclui contas a pagar e receber, fluxo de caixa projetado e realizado, conciliação bancária automática (OFX, CNAB), emissão de NF-e e NFS-e, gestão de fornecedores e clientes, centro de custos, DRE, balanço patrimonial, relatórios gerenciais customizáveis e dashboards executivos. Integração com bancos via Open Finance.',
    keywords: [
      'lipe erp', 'sistema financeiro', 'erp brasil', 'erp pme',
      'contas a pagar', 'contas a receber', 'fluxo de caixa', 'conciliação bancária',
      'emissão nf-e', 'emissão nfs-e', 'sistema contábil', 'erp financeiro completo',
      'lipe erp financeiro', 'gestão financeira', 'software contábil', 'dre sistema'
    ],
    faq: [
      { q: 'Emissão de NF-e e NFS-e está inclusa?', a: 'Sim. Integração com a SEFAZ de todos os estados brasileiros. Emissão automática de NF-e, NFS-e, CT-e e MDF-e.' },
      { q: 'Tem conciliação bancária automática?', a: 'Sim. Importação de OFX, CNAB 240/400 e integração via Open Finance com os principais bancos brasileiros.' },
    ],
  },
  'crm': {
    title: 'CRM de Vendas — Lipe CRM',
    h1: 'CRM de Vendas e Funil Comercial — Lipe CRM',
    description: 'CRM de vendas completo com funil comercial, gestão de oportunidades, automação de follow-up, integração com WhatsApp e relatórios de performance.',
    longDescription: 'O Lipe CRM é um sistema de gestão de relacionamento com clientes (CRM) focado em equipes de vendas. Inclui funil de vendas customizável, gestão de oportunidades, automação de follow-up por email/WhatsApp, scoring de leads, integração com RD Station, Pipedrive e HubSpot, gestão de agenda e tarefas, relatórios de performance por vendedor, predição de closing com IA, mobile app para vendedores externos.',
    keywords: [
      'lipe crm', 'crm de vendas', 'crm brasil', 'sistema crm',
      'funil de vendas', 'gestão de oportunidades', 'automação de vendas',
      'crm whatsapp', 'crm pme', 'lipe crm vendas', 'software crm',
      'crm gratuito escalável', 'crm mobile', 'crm vendedores externos'
    ],
    faq: [
      { q: 'Posso migrar do Pipedrive/RD Station para o Lipe CRM?', a: 'Sim. Fazemos migração completa de contatos, oportunidades, funil, atividades e histórico. Sem perda de dados.' },
      { q: 'Tem app mobile para vendedores externos?', a: 'Sim. App Android/iOS com gestão de visitas, check-in por GPS, catálogo offline e sincronização automática.' },
    ],
  },
  'educacao': {
    title: 'Plataforma de Ensino EAD — Lipe Educação',
    h1: 'Plataforma de Ensino EAD e Cursos Online — Lipe Educação',
    description: 'Plataforma EAD completa: cursos em vídeo, aulas ao vivo, provas, certificados, gestão de alunos, marketplace de cursos e pagamento recorrente.',
    longDescription: 'A Lipe Educação é uma plataforma de ensino a distância (EAD) completa para criadores de curso, escolas, universidades e empresas. Inclui player de vídeo com DRM, aulas ao vivo via Zoom/Google Meet integrado, provas online com anti-cola, certificados com validade jurídica (blockchain), gestão de alunos e matrículas, marketplace de cursos (multi-instrutor), cobrança recorrente, gamificação (pontos, badges, ranking), fórum de discussão e dashboards de progresso.',
    keywords: [
      'lipe educação', 'plataforma ead', 'cursos online', 'ensino a distância',
      'lms learning management system', 'plataforma de cursos', 'marketplace de cursos',
      'ead brasil', 'lipe ead', 'sistema de cursos online', 'plataforma moodle alternativa',
      'curso em vídeo', 'aulas ao vivo', 'certificado digital', 'gamificação ead'
    ],
    faq: [
      { q: 'Tem proteção contra pirataria de vídeos?', a: 'Sim. DRM (Digital Rights Management), watermark dinâmico com nome/email do aluno, bloqueio de download, detecção de gravação de tela.' },
      { q: 'Funciona para um único instrutor ou marketplace multi-instrutor?', a: 'Ambos. Modo single-tenant para um instrutor e multi-tenant com marketplace (comissões por curso) para plataformas como Hotmart/Kiwify.' },
    ],
  },
  'turismo': {
    title: 'Sistemas para Turismo — Lipe Turismo',
    h1: 'Sistemas para Turismo e Passagens — Lipe Turismo',
    description: 'Sistemas para turismo: venda de passagens fluviais, rodoviárias, aéreas, pacotes turísticos, gestão de embarques e check-in online.',
    longDescription: 'A Lipe Turismo é a linha de sistemas para o setor de turismo da LipeHost. Inclui venda de passagens fluviais (barcos regionais), rodoviárias, aéreas, gestão de pacotes turísticos, reservas de hotel/pousada, check-in online, escolha de poltronas, integração com operadoras turísticas, pagamentos parcelados, gestão de embarques em tempo real e dashboards de ocupação. Casos de uso: EmbarqueTur (passagens fluviais na Amazônia), agências de turismo regional, transporte intermunicipal.',
    keywords: [
      'lipe turismo', 'sistema de passagens', 'passagens fluviais', 'passagens rodoviárias',
      'sistema de turismo', 'agência de turismo software', 'venda de passagens online',
      'check-in online', 'embratur software', 'sistema de reservas turísticas',
      'lipe turismo sistemas', 'passagens de barco', 'transporte regional app'
    ],
    faq: [
      { q: 'Funciona para passagens de barco (fluviais)?', a: 'Sim. O EmbarqueTur foi desenvolvido para transporte fluvial na Amazônia, com adaptações para rotas, horários sazonais e pagamento na embarcação.' },
      { q: 'Tem integração com empresas aéreas?', a: 'Sim. Integração com GDS (Amadeus, Sabre) para emissão de passagens aéreas nacionais e internacionais.' },
    ],
  },
  'financeiro': {
    title: 'Sistemas Financeiros — Lipe Financeiro',
    h1: 'Sistemas Financeiros e Fintech — Lipe Financeiro',
    description: 'Desenvolvimento de sistemas financeiros e fintech: carteira digital, PIX, empréstimos, investimentos, Open Finance e banking.',
    longDescription: 'A Lipe Financeiro é a linha de sistemas para o setor financeiro/fintech da LipeHost. Desenvolvemos carteiras digitais (e-wallet), integração completa com PIX (cobrança, recebimento, QR Code dinâmico), plataformas de empréstimo online, gestão de investimentos, integração com Open Finance Brasil, KYC (Know Your Customer) com biometria, AML (Anti-Money Laundering), conformidade com BACEN e CVM.',
    keywords: [
      'lipe financeiro', 'fintech software', 'carteira digital', 'integração pix',
      'sistema de empréstimos', 'plataforma de investimentos', 'open finance',
      'banking software', 'kyc biometria', 'lipe fintech', 'wallet digital app',
      'sistema financeiro fintech', 'bacen conformidade', 'software financeiro brasil'
    ],
    faq: [
      { q: 'Vocês desenvolvem fintechs reguladas pelo BACEN?', a: 'Sim. Desenvolvemos com conformidade BACEN (resoluções 4.658/2018, 4.893/2021), CVM e LGPD. Mas a responsabilidade de obtenção das licenças é do cliente.' },
      { q: 'Integração completa com PIX?', a: 'Sim. Pix por QR Code dinâmico, cobrança via SPI, recebimento automático via webhook, devoluções, Pix Saque e Pix Troco.' },
    ],
  },
}

function slugifyCategory(cat: string): string {
  return cat
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function generateStaticParams() {
  return Object.keys(CATEGORY_INFO).map((cat) => ({ categoria: cat }))
}

export async function generateMetadata({ params }: { params: Promise<{ categoria: string }> }): Promise<Metadata> {
  const { categoria } = await params
  const info = CATEGORY_INFO[categoria]

  if (!info) {
    return {
      title: 'Categoria não encontrada',
      robots: { index: false, follow: false },
    }
  }

  return {
    title: info.title,
    description: info.description,
    alternates: {
      canonical: `/loja/categoria/${categoria}`,
    },
    keywords: info.keywords,
    openGraph: {
      title: info.title,
      description: info.description,
      type: 'website',
      url: `${siteUrl}/loja/categoria/${categoria}`,
      siteName: 'LipeHost',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: info.h1 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: info.title,
      description: info.description,
      images: ['/og-image.png'],
    },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params
  const info = CATEGORY_INFO[categoria]

  if (!info) {
    notFound()
  }

  // Find systems in this category
  const categoryDisplayName = Object.keys(CATEGORY_INFO).find(k => k === categoria) || categoria
  const systemsInCategory = SYSTEMS.filter(s => slugifyCategory(s.category) === categoria)

  // JSON-LD: ItemList of products
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: info.h1,
    description: info.description,
    url: `${siteUrl}/loja/categoria/${categoria}`,
    numberOfItems: systemsInCategory.length,
    itemListElement: systemsInCategory.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: s.name,
      url: `${siteUrl}/loja/${s.slug}`,
    })),
  }

  // JSON-LD: FAQPage
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: info.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  // JSON-LD: BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Loja', item: `${siteUrl}/loja` },
      { '@type': 'ListItem', position: 3, name: info.h1, item: `${siteUrl}/loja/categoria/${categoria}` },
    ],
  }

  // JSON-LD: CollectionPage
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: info.h1,
    description: info.description,
    url: `${siteUrl}/loja/categoria/${categoria}`,
    isPartOf: { '@id': `${siteUrl}/#website` },
    mainEntity: itemListJsonLd,
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />

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
            <span className="text-white/60">{info.h1}</span>
          </nav>

          {/* H1 + description */}
          <header className="mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              <span className="gradient-text">{info.h1}</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/60 leading-relaxed max-w-3xl">
              {info.longDescription}
            </p>
          </header>

          {/* Systems grid */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Sistemas disponíveis nesta categoria</h2>
            {systemsInCategory.length === 0 ? (
              <p className="text-white/40">Em breve novos sistemas nesta categoria.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {systemsInCategory.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/loja/${s.slug}`}
                    className="block glass p-6 rounded-2xl hover:border-white/20 transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors">{s.name}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60">{s.category}</span>
                    </div>
                    <p className="text-sm text-white/60 line-clamp-2">{s.shortDescription}</p>
                    {s.startingPrice && (
                      <p className="mt-4 text-sm text-emerald-400 font-semibold">{s.startingPrice}</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* FAQ section */}
          <section className="mt-16 max-w-3xl">
            <h2 className="text-2xl font-bold mb-6">Perguntas frequentes sobre {info.h1}</h2>
            <div className="space-y-4">
              {info.faq.map((item, i) => (
                <div key={i} className="glass p-5 rounded-xl">
                  <h3 className="font-semibold mb-2">{item.q}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mt-20 text-center">
            <h2 className="text-3xl font-bold mb-4">Precisa de um sistema personalizado?</h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              A LipeHost desenvolve qualquer sistema sob medida para sua empresa. Conte sua ideia e cuidamos do resto.
            </p>
            <Link
              href="/#contato"
              className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
            >
              Solicitar Projeto
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
