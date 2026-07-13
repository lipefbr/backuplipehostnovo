// Central content store for LIPE.HOST
// All system catalog data, technologies, testimonials and FAQ live here.

export type SystemCategory =
  | "Mobilidade"
  | "Delivery"
  | "Marketplace"
  | "Saúde"
  | "Educação"
  | "Turismo"
  | "Financeiro"
  | "SaaS"
  | "IA"
  | "ERP"
  | "CRM"

export interface SystemFeature {
  title: string
  description: string
}

export interface SystemPlan {
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  highlighted?: boolean
}

export interface SystemFaq {
  q: string
  a: string
}

export interface System {
  slug: string
  name: string
  tagline: string
  category: SystemCategory
  shortDescription: string
  longDescription: string
  technologies: string[]
  features: SystemFeature[]
  highlights: string[]
  screenshots: { label: string; gradient: string }[]
  benefits: string[]
  plans: SystemPlan[]
  faq: SystemFaq[]
  startingPrice?: string
  status: "disponivel" | "sob-consulta"
  featured?: boolean
  accentColor: string
}

export const SYSTEMS: System[] = [
  {
    slug: "mobilidade-uber-clone",
    name: "Sistema Mobilidade",
    tagline: "App de transporte completo (estilo Uber)",
    category: "Mobilidade",
    shortDescription:
      "Aplicativo de mobilidade urbana com apps de passageiro, motorista, painel web administrativo, pagamentos via PIX e cartão, mapa em tempo real e gestão de frota.",
    longDescription:
      "Plataforma completa de mobilidade urbana inspirada nos principais apps de transporte do mercado. Composta por três aplicativos (passageiro, motorista e painel web administrativo), o sistema oferece todo o fluxo de uma viagem: solicitação, matching, rastreamento em tempo real, cálculo automático de tarifa, pagamentos via PIX e cartão, avaliação, histórico e relatórios financeiros. O painel administrativo permite gerenciar motoristas, passageiros, áreas de atendimento, tarifas, promoções e extratos financeiros com total transparência.",
    technologies: ["Flutter", "Laravel", "Firebase", "Google Maps", "PostgreSQL", "Redis", "Node.js"],
    features: [
      { title: "App do Passageiro", description: "Solicitação de viagem, rastreamento em tempo real, pagamentos PIX/cartão, histórico e avaliações." },
      { title: "App do Motorista", description: "Aceite de corridas, navegação integrada, extrato diário, status online/offline e métricas de desempenho." },
      { title: "Painel Web Admin", description: "Gestão completa de motoristas, passageiros, tarifas, áreas, promoções e relatórios financeiros." },
      { title: "Pagamentos", description: "Integração PIX e cartão, split de comissão, estornos e conciliação automática." },
      { title: "Mapa em Tempo Real", description: "Rastreamento ao vivo com Google Maps, rotas otimizadas e estimativa de chegada." },
      { title: "Gestão de Frota", description: "Documentação, validação de veículos, ranking de motoristas e bloqueio de inadimplentes." },
    ],
    highlights: ["Passageiro", "Motorista", "Painel Web", "PIX", "Cartão", "Google Maps", "Tempo Real"],
    screenshots: [
      { label: "App do Passageiro", gradient: "from-blue-600 via-indigo-600 to-purple-600" },
      { label: "App do Motorista", gradient: "from-emerald-500 via-cyan-600 to-blue-600" },
      { label: "Painel Administrativo", gradient: "from-violet-600 via-purple-600 to-fuchsia-600" },
      { label: "Mapa em Tempo Real", gradient: "from-amber-500 via-orange-500 to-red-500" },
    ],
    benefits: [
      "Plataforma pronta para entrar em operação em poucas semanas",
      "Marca 100% personalizada com a identidade do seu negócio",
      "Modelo de comissionamento flexível por região ou categoria",
      "Infraestrutura escalável para milhares de viagens simultâneas",
    ],
    plans: [
      {
        name: "Starter",
        price: "R$ 18.000",
        description: "Licença do sistema com 1 cidade e até 500 motoristas.",
        features: ["App Passageiro", "App Motorista", "Painel Admin", "PIX e Cartão", "1 cidade", "Suporte 30 dias"],
      },
      {
        name: "Pro",
        price: "R$ 32.000",
        period: "implantação",
        description: "Multi-cidades, customizações visuais e integrações adicionais.",
        features: ["Tudo do Starter", "Multi-cidades", "Customização visual", "API pública", "Integração ERP", "Suporte 90 dias"],
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "Sob consulta",
        description: "Implantação white-label com SLA e infraestrutura dedicada.",
        features: ["Tudo do Pro", "White-label", "Infraestrutura dedicada", "SLA 99.9%", "Gerente de conta", "Suporte 24/7"],
      },
    ],
    faq: [
      { q: "Os aplicativos são publicados nas lojas?", a: "Sim. Cuidamos da publicação do app do passageiro e do motorista na Google Play e Apple App Store com a sua marca." },
      { q: "Quanto tempo leva a implantação?", a: "A implantação padrão leva entre 3 e 6 semanas, incluindo customização visual, integração de pagamentos e publicação nas lojas." },
      { q: "Posso alterar as tarifas?", a: "Sim. O painel administrativo permite configurar tarifa mínima, preço por km, preço por minuto, tarifa dinâmica e promoções por região." },
      { q: "Quais formas de pagamento são suportadas?", a: "PIX, cartão de crédito e carteira digital. Integração com principais adquirentes brasileiros." },
    ],
    startingPrice: "R$ 18.000",
    status: "disponivel",
    featured: true,
    accentColor: "#3b82f6",
  },
  {
    slug: "delivery-completo",
    name: "Sistema Delivery",
    tagline: "Marketplace de delivery com cliente, loja, entregador e admin",
    category: "Delivery",
    shortDescription:
      "Plataforma de delivery completa com apps para cliente, loja, entregador e painel administrativo. Pagamentos via PIX e cartão, cupons, comissões e rastreamento em tempo real.",
    longDescription:
      "Sistema de delivery inspirado nos principais apps do mercado. Composto por quatro aplicativos integrados (cliente, loja, entregador e painel administrativo), oferece todo o fluxo: cardápio digital, pedidos, pagamento via PIX e cartão, aceitação pela loja, atribuição de entregador, rastreamento em tempo real, avaliações e relatórios financeiros. Suporte a cupons de desconto, taxa de entrega dinâmica, horário de funcionamento, multi-loja e comissionamento configurável.",
    technologies: ["Flutter", "Laravel", "Firebase", "PostgreSQL", "Redis", "Google Maps", "Node.js"],
    features: [
      { title: "App do Cliente", description: "Cardápio digital, carrinho, pagamento PIX/cartão, rastreamento do pedido e avaliações." },
      { title: "App da Loja", description: "Gestão de produtos, aceitação de pedidos, status de preparo e métricas de venda." },
      { title: "App do Entregador", description: "Aceite de entregas, navegação otimizada, extrato e comprovante de entrega." },
      { title: "Painel Web Admin", description: "Gestão de lojas, entregadores, comissões, cupons e relatórios financeiros." },
      { title: "Pagamentos & Cupons", description: "PIX, cartão, carteira, cupons de desconto, cashback e taxa de entrega dinâmica." },
      { title: "Multi-loja", description: "Marketplace com várias lojas, categorias, horários e comissionamento por loja." },
    ],
    highlights: ["Cliente", "Entregador", "Loja", "Admin", "PIX", "Cartão", "Cupom", "Tempo Real"],
    screenshots: [
      { label: "App do Cliente", gradient: "from-rose-500 via-orange-500 to-amber-500" },
      { label: "App da Loja", gradient: "from-cyan-500 via-blue-600 to-indigo-600" },
      { label: "App do Entregador", gradient: "from-emerald-500 via-teal-600 to-cyan-600" },
      { label: "Painel Administrativo", gradient: "from-purple-600 via-violet-600 to-blue-600" },
    ],
    benefits: [
      "Marketplace completo pronto para operar em qualquer cidade",
      "Comissionamento flexível por loja, categoria ou pedido",
      "Cardápio digital com variações, adicionais e combos",
      "Rastreamento em tempo real do entregador com ETA precisa",
    ],
    plans: [
      {
        name: "Starter",
        price: "R$ 15.000",
        description: "Plataforma de delivery para 1 cidade e até 30 lojas.",
        features: ["App Cliente", "App Loja", "App Entregador", "Painel Admin", "PIX e Cartão", "Suporte 30 dias"],
      },
      {
        name: "Pro",
        price: "R$ 28.000",
        description: "Multi-cidades, cupons avançados e integrações de ERP.",
        features: ["Tudo do Starter", "Multi-cidades", "Cupons avançados", "Cashback", "Integração ERP", "Suporte 90 dias"],
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "Sob consulta",
        description: "Infraestrutura dedicada, white-label e SLA 99.9%.",
        features: ["Tudo do Pro", "White-label", "Infraestrutura dedicada", "SLA 99.9%", "Gerente de conta", "Suporte 24/7"],
      },
    ],
    faq: [
      { q: "Posso operar com várias lojas?", a: "Sim. O sistema suporta marketplace multi-loja com comissionamento individual por loja." },
      { q: "Como funciona o pagamento?", a: "Integração com gateways brasileiros para PIX, cartão e carteira digital, com split automático de comissão." },
      { q: "É possível criar cupons?", a: "Sim. Cupons de desconto por valor, percentual, frete grátis, cashback e validade por loja ou global." },
      { q: "Quanto custa para implantar?", a: "A partir de R$ 15.000 para a licença do sistema, com implantação em 3 a 5 semanas." },
    ],
    startingPrice: "R$ 15.000",
    status: "disponivel",
    featured: true,
    accentColor: "#f97316",
  },
  {
    slug: "marketplace-multi-vendedor",
    name: "Marketplace Multi-Vendedores",
    tagline: "Plataforma estilo Mercado Livre com multi-vendedores",
    category: "Marketplace",
    shortDescription:
      "Marketplace completo multi-vendedores com gestão de produtos, pagamentos, painel administrativo e comissionamento. Modelo pronto para escalar como um e-commerce nacional.",
    longDescription:
      "Marketplace profissional inspirado em plataformas como Mercado Livre, Shopee e Amazon. Vendedores se cadastram, publicam produtos, gerenciam estoque e pedidos a partir de um painel próprio. Clientes compram de múltiplos vendedores no mesmo carrinho, pagam via PIX, cartão ou boleto, e o sistema calcula automaticamente comissões, frete e split de pagamento. O painel administrativo master gerencia categorias, vendedores, comissões, dispute resolution, métricas e relatórios financeiros consolidados.",
    technologies: ["Next.js", "Laravel", "PostgreSQL", "Redis", "Node.js", "AWS", "Docker"],
    features: [
      { title: "Painel do Vendedor", description: "Cadastro de produtos, gestão de estoque, pedidos, métricas e extrato financeiro." },
      { title: "Carrinho Multi-Vendedor", description: "Compra de vários vendedores no mesmo pedido com split automático de pagamento." },
      { title: "Pagamentos", description: "PIX, cartão, boleto e carteira digital com split de comissão automático." },
      { title: "Gestão de Categorias", description: "Categorias, atributos, variações, filtros dinâmicos e busca inteligente." },
      { title: "Avaliações e Reviews", description: "Sistema de avaliação de produtos e vendedores com moderação." },
      { title: "Painel Master", description: "Gestão de vendedores, comissões, dispute, métricas globais e relatórios." },
    ],
    highlights: ["Multi-vendedores", "Split de pagamento", "PIX", "Cartão", "Frete", "Comissão"],
    screenshots: [
      { label: "Vitrine de Produtos", gradient: "from-yellow-500 via-orange-500 to-red-500" },
      { label: "Painel do Vendedor", gradient: "from-blue-600 via-indigo-600 to-purple-600" },
      { label: "Checkout Integrado", gradient: "from-emerald-500 via-teal-600 to-cyan-600" },
      { label: "Painel Master", gradient: "from-fuchsia-600 via-purple-600 to-violet-600" },
    ],
    benefits: [
      "Modelo de negócio marketplace validado e pronto para operar",
      "Split de pagamento automático entre plataforma e vendedores",
      "Busca inteligente com filtros dinâmicos por categoria e atributo",
      "Sistema de avaliações e moderação para garantir qualidade",
    ],
    plans: [
      {
        name: "Starter",
        price: "R$ 22.000",
        description: "Marketplace pronto para até 100 vendedores e 10 mil produtos.",
        features: ["Vitrine", "Painel Vendedor", "Painel Master", "PIX e Cartão", "100 vendedores", "Suporte 30 dias"],
      },
      {
        name: "Pro",
        price: "R$ 38.000",
        description: "Recursos avançados, logística integrada e API pública.",
        features: ["Tudo do Starter", "Logística integrada", "API pública", "Busca inteligente", "Avaliações", "Suporte 90 dias"],
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "Sob consulta",
        description: "Infraestrutura dedicada, multi-região e SLA 99.9%.",
        features: ["Tudo do Pro", "Multi-região", "Infraestrutura dedicada", "SLA 99.9%", "Gerente de conta", "Suporte 24/7"],
      },
    ],
    faq: [
      { q: "Como funciona o split de pagamento?", a: "O gateway divide automaticamente o valor entre a plataforma (comissão) e o vendedor no momento do pagamento." },
      { q: "Posso limitar categorias por vendedor?", a: "Sim. O painel master permite configurar quais categorias cada vendedor pode ou não comercializar." },
      { q: "Suporta integração com transportadoras?", a: "Sim. Integração com Melhor Rastreio, Frenet e transportadoras para cálculo de frete em tempo real." },
      { q: "Quantos vendedores o sistema suporta?", a: "A arquitetura é escalável e suporta milhares de vendedores simultâneos com infraestrutura adequada." },
    ],
    startingPrice: "R$ 22.000",
    status: "disponivel",
    featured: true,
    accentColor: "#a855f7",
  },
  {
    slug: "embarquetur-passagens",
    name: "EmbarqueTur",
    tagline: "Venda de passagens de barco e turismo",
    category: "Turismo",
    shortDescription:
      "Sistema completo para venda de passagens fluviais/marítimas com gestão de horários, embarcações, reservas, pagamentos e check-in digital.",
    longDescription:
      "Plataforma especializada para empresas de transporte aquaviário e turismo. Permite cadastrar rotas, horários, embarcações, escalas e tarifas. Clientes compram passagens online via PIX ou cartão, recebem QR Code de embarque e o sistema controla ocupação em tempo real. Painel administrativo completo para gestão de vendas, relatórios financeiros, integração com balcões físicos e check-in digital no portão de embarque.",
    technologies: ["Flutter", "Next.js", "Laravel", "PostgreSQL", "Redis", "Docker"],
    features: [
      { title: "Gestão de Rotas", description: "Cadastro de rotas, horários, embarcações, escalas e tarifas dinâmicas." },
      { title: "Venda Online", description: "Compra de passagens via site e app com PIX, cartão e reserva." },
      { title: "Check-in Digital", description: "QR Code de embarque validado no portão com controle de ocupação." },
      { title: "Balcão Físico", description: "Ponto de venda presencial integrado ao mesmo estoque online." },
      { title: "Relatórios Financeiros", description: "Conciliação, comissão de agentes e relatórios por rota/período." },
      { title: "Multi-agente", description: "Venda através de agentes terceiros com comissionamento automático." },
    ],
    highlights: ["Venda de passagens", "Barcos", "Horários", "Reservas", "Check-in QR", "Multi-agente"],
    screenshots: [
      { label: "Venda Online", gradient: "from-cyan-500 via-blue-500 to-indigo-600" },
      { label: "Gestão de Rotas", gradient: "from-teal-500 via-emerald-500 to-green-600" },
      { label: "Check-in Digital", gradient: "from-violet-500 via-purple-600 to-fuchsia-600" },
      { label: "Painel Administrativo", gradient: "from-amber-500 via-orange-500 to-rose-500" },
    ],
    benefits: [
      "Controle total de ocupação em tempo real por embarcação",
      "Venda online + balcão físico no mesmo estoque",
      "Check-in digital com QR Code elimina filas no embarque",
      "Comissionamento automático de agentes terceiros",
    ],
    plans: [
      {
        name: "Starter",
        price: "R$ 12.000",
        description: "Sistema para 1 empresa com até 20 rotas.",
        features: ["Venda online", "App passageiro", "Painel admin", "PIX e Cartão", "20 rotas", "Suporte 30 dias"],
      },
      {
        name: "Pro",
        price: "R$ 22.000",
        description: "Multi-agente, check-in digital e integrações.",
        features: ["Tudo do Starter", "Multi-agente", "Check-in QR", "Balcão físico", "API pública", "Suporte 90 dias"],
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "Sob consulta",
        description: "Multi-empresa, white-label e infraestrutura dedicada.",
        features: ["Tudo do Pro", "Multi-empresa", "White-label", "Infraestrutura dedicada", "Gerente de conta", "Suporte 24/7"],
      },
    ],
    faq: [
      { q: "Funciona para outros tipos de transporte?", a: "Sim. O sistema é adaptável para ônibus, vans, lanchas e qualquer modal de transporte regular." },
      { q: "Posso vender por agentes terceiros?", a: "Sim. O módulo multi-agente permite que terceiros vendam passagens com comissionamento automático." },
      { q: "Como funciona o check-in?", a: "O passageiro recebe um QR Code que é validado no portão de embarque, com controle de ocupação em tempo real." },
      { q: "Posso ter balcão físico e online integrados?", a: "Sim. Balcões físicos operam no mesmo estoque das vendas online, evitando overbooking." },
    ],
    startingPrice: "R$ 12.000",
    status: "disponivel",
    featured: true,
    accentColor: "#06b6d4",
  },
  {
    slug: "plantao-help-saude",
    name: "Plantão Help",
    tagline: "Gestão de escalas e profissionais de saúde",
    category: "Saúde",
    shortDescription:
      "Sistema completo para gestão de escalas hospitalares, profissionais de saúde, plantões, financeiro e relatórios. Reduz custos administrativos e otimiza a operação.",
    longDescription:
      "Plataforma especializada para hospitais, clínicas e operadoras de saúde que precisam gerenciar escalas de plantão, profissionais multidisciplinares e o ciclo financeiro completo. O sistema permite cadastrar profissionais com suas especialidades e disponibilidades, montar escalas automáticas com regras configuráveis, gerar remunerações por plantão, hora extra e sobreaviso, e emitir relatórios para o RH e contabilidade. Aplicativo para profissionais confirma plantões, recebe notificações e consulta holerites.",
    technologies: ["Flutter", "Laravel", "PostgreSQL", "Redis", "Docker", "Next.js"],
    features: [
      { title: "Gestão de Profissionais", description: "Cadastro com especialidades, documentos, disponibilidade e histórico." },
      { title: "Escalas Automáticas", description: "Montagem de escalas com regras configuráveis e detecção de conflitos." },
      { title: "App do Profissional", description: "Confirmação de plantões, notificações, holerites e trocas de horário." },
      { title: "Financeiro", description: "Cálculo de remunerações, horas extras, sobreaviso e geração de holerites." },
      { title: "Relatórios", description: "Relatórios para RH, contabilidade, gestores e auditoria." },
      { title: "Multi-unidade", description: "Gestão de várias unidades hospitalares com escalas independentes." },
    ],
    highlights: ["Escalas", "Hospitais", "Profissionais", "Financeiro", "App", "Relatórios"],
    screenshots: [
      { label: "Painel de Escalas", gradient: "from-emerald-500 via-teal-600 to-cyan-600" },
      { label: "App do Profissional", gradient: "from-blue-500 via-indigo-600 to-purple-600" },
      { label: "Gestão Financeira", gradient: "from-amber-500 via-orange-500 to-red-500" },
      { label: "Relatórios e Auditoria", gradient: "from-rose-500 via-pink-600 to-fuchsia-600" },
    ],
    benefits: [
      "Redução de até 70% do tempo gasto na montagem de escalas",
      "App dedicado para profissionais com notificações em tempo real",
      "Cálculo automático de horas extras, sobreaviso e plantões",
      "Conformidade com normas trabalhistas e relatórios auditáveis",
    ],
    plans: [
      {
        name: "Starter",
        price: "R$ 14.000",
        description: "Para 1 hospital com até 200 profissionais.",
        features: ["Gestão de escalas", "App profissional", "Painel admin", "Financeiro", "200 profissionais", "Suporte 30 dias"],
      },
      {
        name: "Pro",
        price: "R$ 25.000",
        description: "Multi-unidade, relatórios avançados e integrações.",
        features: ["Tudo do Starter", "Multi-unidade", "Relatórios avançados", "Holerite digital", "Integração RH", "Suporte 90 dias"],
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "Sob consulta",
        description: "Multi-empresa, white-label e infraestrutura dedicada.",
        features: ["Tudo do Pro", "Multi-empresa", "White-label", "Infraestrutura dedicada", "SLA 99.9%", "Suporte 24/7"],
      },
    ],
    faq: [
      { q: "Funciona para qualquer especialidade?", a: "Sim. Cadastro flexível de especialidades, categorias profissionais e regras de escala personalizadas." },
      { q: "Posso gerar holerites pelo sistema?", a: "Sim. O módulo financeiro calcula remunerações, horas extras e sobreaviso, gerando holerites digitais." },
      { q: "Suporta múltiplas unidades?", a: "Sim. Cada unidade pode ter escalas independentes com gestão centralizada." },
      { q: "Como funciona o app do profissional?", a: "O profissional confirma plantões, recebe notificações, solicita trocas e consulta holerites pelo app." },
    ],
    startingPrice: "R$ 14.000",
    status: "disponivel",
    featured: true,
    accentColor: "#10b981",
  },
  {
    slug: "pdv-frente-caixa",
    name: "PDV Completo",
    tagline: "Frente de caixa, estoque, financeiro, PIX e NF-e",
    category: "ERP",
    shortDescription:
      "Sistema de PDV completo para varejo com frente de caixa, gestão de estoque, financeiro, integração PIX, emissão de NF-e e relatórios gerenciais.",
    longDescription:
      "ERP de varejo completo com frente de caixa moderna, gestão de estoque multi-loja, contas a pagar/receber, integração com PIN PAD para pagamento via PIX e cartão, emissão de NF-e e NFC-e, gestão de clientes, programa de fidelidade, e relatórios gerenciais em tempo real. Suporta balança, leitor de código de barras, impressora térmica e SAT/CFe. Ideal para supermercados, padarias, farmácias, lojas de conveniência e redes varejistas.",
    technologies: ["Flutter", "Laravel", "PostgreSQL", "Redis", "Next.js", "Docker"],
    features: [
      { title: "Frente de Caixa", description: "PDV rápido com atalhos, leitor de código de barras, balança e PIN PAD." },
      { title: "Gestão de Estoque", description: "Multi-loja, reposição, inventário, validade e alertas de mínimo." },
      { title: "Financeiro", description: "Contas a pagar/receber, fluxo de caixa, conciliação bancária e DRE." },
      { title: "Fiscal", description: "Emissão de NF-e, NFC-e, SAT/CFe e SPED com validação automática." },
      { title: "Pagamentos", description: "Integração com PIN PAD para PIX, cartão e carteira digital." },
      { title: "Relatórios", description: "Curva ABC, giro de estoque, margem por produto e metas por vendedor." },
    ],
    highlights: ["Frente de Caixa", "Estoque", "Financeiro", "PIX", "NF-e", "Multi-loja"],
    screenshots: [
      { label: "Frente de Caixa", gradient: "from-blue-600 via-cyan-600 to-teal-600" },
      { label: "Gestão de Estoque", gradient: "from-violet-600 via-purple-600 to-fuchsia-600" },
      { label: "Módulo Financeiro", gradient: "from-amber-500 via-yellow-500 to-orange-500" },
      { label: "Emissão Fiscal", gradient: "from-rose-500 via-red-500 to-orange-600" },
    ],
    benefits: [
      "Frente de caixa ultra-rápida com atalhos e leitor de barras",
      "Emissão de NF-e, NFC-e e SAT com validação automática",
      "Gestão multi-loja com estoque consolidado em tempo real",
      "Integração nativa com PIN PAD para PIX e cartão",
    ],
    plans: [
      {
        name: "Starter",
        price: "R$ 10.000",
        description: "PDV + estoque para 1 loja com 2 caixas.",
        features: ["Frente de caixa", "Estoque", "Financeiro básico", "PIX", "2 caixas", "Suporte 30 dias"],
      },
      {
        name: "Pro",
        price: "R$ 18.000",
        description: "Multi-loja, NF-e e módulo fiscal completo.",
        features: ["Tudo do Starter", "Multi-loja", "NF-e", "NFC-e", "Relatórios avançados", "Suporte 90 dias"],
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "Sob consulta",
        description: "Rede varejista, integração ERP e infraestrutura dedicada.",
        features: ["Tudo do Pro", "Rede varejista", "Integração ERP", "SPED", "Infraestrutura dedicada", "Suporte 24/7"],
      },
    ],
    faq: [
      { q: "Funciona com PIN PAD?", a: "Sim. Integração com os principais PIN PADs do mercado para PIX, cartão e carteira digital." },
      { q: "Emite NF-e e NFC-e?", a: "Sim. Emissão completa de NF-e, NFC-e, SAT/CFe com validação automática e geração de SPED." },
      { q: "Suporta multi-loja?", a: "Sim. Gestão centralizada com estoque consolidado e relatórios por loja em tempo real." },
      { q: "Funciona offline?", a: "O PDV funciona offline com sincronização automática quando a conexão retorna." },
    ],
    startingPrice: "R$ 10.000",
    status: "disponivel",
    featured: true,
    accentColor: "#0ea5e9",
  },
  {
    slug: "crm-vendas",
    name: "CRM de Vendas",
    tagline: "Gestão de funil, clientes e automação comercial",
    category: "CRM",
    shortDescription:
      "CRM completo com funil de vendas customizável, automação de follow-up, gestão de contatos, propostas e relatórios de performance comercial.",
    longDescription:
      "CRM profissional para equipes de vendas que precisam de previsibilidade e performance. Funil de vendas 100% customizável com etapas, probabilidades e automações. Cadastro de contatos e empresas com histórico completo de interações, propostas comerciais, follow-ups automáticos, integração com WhatsApp e e-mail, gestão de metas por vendedor, e relatórios em tempo real. App mobile para vendedores em campo com geolocalização de visitas.",
    technologies: ["Next.js", "Laravel", "PostgreSQL", "Redis", "Flutter", "Docker"],
    features: [
      { title: "Funil de Vendas", description: "Funil customizável com etapas, probabilidades e automações por etapa." },
      { title: "Gestão de Contatos", description: "Empresas, contatos, histórico de interações e propostas comerciais." },
      { title: "Automação", description: "Follow-ups automáticos, lembretes, gatilhos e workflows visuais." },
      { title: "WhatsApp & E-mail", description: "Integração nativa com WhatsApp e e-mail para comunicação centralizada." },
      { title: "App Mobile", description: "Vendedores em campo com geolocalização de visitas e check-in." },
      { title: "Relatórios", description: "Metas, performance por vendedor, previsão de receita e conversão por etapa." },
    ],
    highlights: ["Funil customizável", "Automação", "WhatsApp", "Propostas", "Metas", "App mobile"],
    screenshots: [
      { label: "Funil de Vendas", gradient: "from-indigo-600 via-blue-600 to-cyan-600" },
      { label: "Gestão de Contatos", gradient: "from-purple-600 via-violet-600 to-fuchsia-600" },
      { label: "Automação Comercial", gradient: "from-emerald-500 via-teal-600 to-cyan-600" },
      { label: "Relatórios & Metas", gradient: "from-amber-500 via-orange-500 to-rose-500" },
    ],
    benefits: [
      "Aumento de 30-50% na conversão com automação de follow-up",
      "Visibilidade total do funil e previsão de receita em tempo real",
      "Comunicação centralizada com WhatsApp e e-mail integrados",
      "App para vendedores externos com geolocalização e check-in",
    ],
    plans: [
      {
        name: "Starter",
        price: "R$ 9.000",
        description: "CRM para 1 empresa com até 10 vendedores.",
        features: ["Funil de vendas", "Gestão de contatos", "Automação", "10 vendedores", "Relatórios", "Suporte 30 dias"],
      },
      {
        name: "Pro",
        price: "R$ 16.000",
        description: "App mobile, WhatsApp e integrações avançadas.",
        features: ["Tudo do Starter", "App mobile", "WhatsApp", "E-mail marketing", "API pública", "Suporte 90 dias"],
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "Sob consulta",
        description: "Multi-empresa, white-label e infraestrutura dedicada.",
        features: ["Tudo do Pro", "Multi-empresa", "White-label", "Infraestrutura dedicada", "SLA 99.9%", "Suporte 24/7"],
      },
    ],
    faq: [
      { q: "Posso personalizar o funil?", a: "Sim. Funil 100% customizável com etapas, probabilidades e automações por etapa." },
      { q: "Integra com WhatsApp?", a: "Sim. Integração nativa com WhatsApp para envio e recebimento de mensagens pelo CRM." },
      { q: "Tem app para vendedores externos?", a: "Sim. App mobile com geolocalização de visitas, check-in e registro de atividades." },
      { q: "Quantos vendedores suporta?", a: "A partir de 10 vendedores no plano Starter, escalável para centenas no Enterprise." },
    ],
    startingPrice: "R$ 9.000",
    status: "disponivel",
    featured: false,
    accentColor: "#8b5cf6",
  },
  {
    slug: "plataforma-saas-multiempresa",
    name: "Plataforma SaaS Multiempresa",
    tagline: "Sistema white-label para revenda no modelo SaaS",
    category: "SaaS",
    shortDescription:
      "Plataforma SaaS multiempresa com painel administrativo master, sistema de assinaturas, billing automático e isolamento de dados por tenant.",
    longDescription:
      "Infraestrutura SaaS completa para empresas que querem transformar seu sistema em um produto revolvável no modelo de assinatura. Suporte a multi-tenant com isolamento de dados por empresa, painel administrativo master para gestão de tenants e planos, billing automático com integração a gateways de pagamento, sistema de assinaturas com trial, upgrade e downgrade, controle de uso por recurso, e métricas de churn, MRR e LTV. Pronta para escalar para milhares de tenants.",
    technologies: ["Next.js", "Laravel", "PostgreSQL", "Redis", "Docker", "AWS", "Stripe"],
    features: [
      { title: "Multi-tenant", description: "Isolamento completo de dados por empresa com performance e segurança." },
      { title: "Painel Master", description: "Gestão de tenants, planos, métricas, churn e suporte centralizado." },
      { title: "Billing Automático", description: "Cobrança recorrente, trial, upgrade, downgrade e cancelamento automático." },
      { title: "Assinaturas", description: "Planos, add-ons, cupons, freemium e limites de uso por recurso." },
      { title: "Métricas SaaS", description: "MRR, ARR, churn, LTV, CAC e cohort analysis em tempo real." },
      { title: "White-label", description: "Customização visual e domínio próprio por tenant." },
    ],
    highlights: ["Multi-tenant", "Assinaturas", "Billing", "White-label", "Métricas SaaS", "Painel master"],
    screenshots: [
      { label: "Painel Master", gradient: "from-blue-600 via-indigo-600 to-purple-600" },
      { label: "Gestão de Tenants", gradient: "from-emerald-500 via-teal-600 to-cyan-600" },
      { label: "Métricas SaaS", gradient: "from-amber-500 via-orange-500 to-red-500" },
      { label: "Billing & Assinaturas", gradient: "from-violet-600 via-fuchsia-600 to-pink-600" },
    ],
    benefits: [
      "Transforme seu sistema em produto SaaS revolvável",
      "Isolamento seguro de dados por empresa (tenant)",
      "Billing automático com trial, upgrade e downgrade",
      "Métricas SaaS em tempo real: MRR, churn, LTV, cohort",
    ],
    plans: [
      {
        name: "Starter",
        price: "R$ 28.000",
        description: "Plataforma SaaS para até 50 tenants.",
        features: ["Multi-tenant", "Painel master", "Assinaturas", "Billing", "50 tenants", "Suporte 30 dias"],
      },
      {
        name: "Pro",
        price: "R$ 48.000",
        description: "White-label, métricas avançadas e API pública.",
        features: ["Tudo do Starter", "White-label", "Métricas SaaS", "API pública", "Cohort analysis", "Suporte 90 dias"],
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "Sob consulta",
        description: "Multi-região, infraestrutura dedicada e SLA 99.99%.",
        features: ["Tudo do Pro", "Multi-região", "Infraestrutura dedicada", "SLA 99.99%", "Gerente de conta", "Suporte 24/7"],
      },
    ],
    faq: [
      { q: "Como funciona o isolamento de dados?", a: "Isolamento completo por tenant com row-level security no PostgreSQL, garantindo performance e segurança." },
      { q: "Posso ter diferentes planos?", a: "Sim. Planos, add-ons, cupons, freemium e limites de uso por recurso totalmente configuráveis." },
      { q: "Integra com gateways brasileiros?", a: "Sim. Integração com Stripe, Pagar.me, Asaas e outros gateways para cobrança recorrente." },
      { q: "Quantos tenants suporta?", a: "A arquitetura é escalável e suporta milhares de tenants com infraestrutura adequada." },
    ],
    startingPrice: "R$ 28.000",
    status: "disponivel",
    featured: false,
    accentColor: "#6366f1",
  },
  {
    slug: "agente-ia-atendimento",
    name: "Agente IA de Atendimento",
    tagline: "Chatbot inteligente com LLM e integração WhatsApp",
    category: "IA",
    shortDescription:
      "Agente de IA com LLM para atendimento 24/7 no WhatsApp, site e app. Treinado com a base de conhecimento da sua empresa, integra com sistemas internos.",
    longDescription:
      "Agente de IA construído com LLMs de última geração para atendimento automatizado de alta qualidade. Treinado com a base de conhecimento da sua empresa (manuais, FAQ, histórico de atendimentos), o agente responde clientes em linguagem natural, executa ações (consultar pedido, agendar, emitir nota), integra com sistemas internos via API, e escala para milhares de conversas simultâneas. Disponível em WhatsApp, site, app, Telegram e Instagram. Painel administrativo para treinamento, métricas e handover humano.",
    technologies: ["OpenAI", "Node.js", "Laravel", "PostgreSQL", "Redis", "Next.js", "WhatsApp API"],
    features: [
      { title: "LLM de Última Geração", description: "GPT-4 / Claude / Llama com prompts otimizados para o seu negócio." },
      { title: "Base de Conhecimento", description: "Upload de manuais, FAQ e histórico para treinamento do agente." },
      { title: "Integração com Sistemas", description: "Conexão com CRM, ERP e APIs internas para executar ações reais." },
      { title: "Multi-canal", description: "WhatsApp, site, app, Telegram e Instagram com contexto unificado." },
      { title: "Handover Humano", description: "Transferência para atendente humano quando necessário, com contexto." },
      { title: "Painel & Métricas", description: "Treinamento, métricas de resolução, CSAT e analytics de conversas." },
    ],
    highlights: ["LLM", "WhatsApp", "Base de conhecimento", "Multi-canal", "Handover", "Métricas"],
    screenshots: [
      { label: "Chat no WhatsApp", gradient: "from-emerald-500 via-green-600 to-teal-600" },
      { label: "Painel de Treinamento", gradient: "from-blue-600 via-indigo-600 to-purple-600" },
      { label: "Analytics & Métricas", gradient: "from-amber-500 via-orange-500 to-red-500" },
      { label: "Integração com Sistemas", gradient: "from-violet-600 via-fuchsia-600 to-pink-600" },
    ],
    benefits: [
      "Atendimento 24/7 com qualidade de humano e escala de máquina",
      "Redução de até 80% no volume de atendimentos humanos repetitivos",
      "Integração com seus sistemas para resolver problemas de verdade",
      "Multi-canal com contexto unificado entre WhatsApp, site e app",
    ],
    plans: [
      {
        name: "Starter",
        price: "R$ 8.000",
        description: "Agente IA para 1 canal com base de conhecimento.",
        features: ["1 canal (WhatsApp ou site)", "Base de conhecimento", "Painel admin", "Métricas", "Suporte 30 dias"],
      },
      {
        name: "Pro",
        price: "R$ 16.000",
        description: "Multi-canal, integração com sistemas e handover.",
        features: ["Tudo do Starter", "Multi-canal", "Integração APIs", "Handover humano", "Analytics avançado", "Suporte 90 dias"],
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "Sob consulta",
        description: "Infraestrutura dedicada, LLM private e SLA 99.9%.",
        features: ["Tudo do Pro", "LLM privado", "Infraestrutura dedicada", "SLA 99.9%", "Gerente de conta", "Suporte 24/7"],
      },
    ],
    faq: [
      { q: "Qual LLM é utilizado?", a: "GPT-4, Claude, Llama ou modelos open-source. Escolhemos o melhor LLM para o seu caso de uso e orçamento." },
      { q: "Como funciona o treinamento?", a: "Upload de manuais, FAQ, site e histórico de atendimentos. O agente aprende com sua base de conhecimento." },
      { q: "Posso integrar com meu CRM/ERP?", a: "Sim. Integração via API para consultar pedidos, atualizar cadastros, agendar e executar ações reais." },
      { q: "Funciona em quais canais?", a: "WhatsApp, site, app, Telegram e Instagram com contexto unificado entre canais." },
    ],
    startingPrice: "R$ 8.000",
    status: "disponivel",
    featured: true,
    accentColor: "#ec4899",
  },
  {
    slug: "plataforma-ensino-ead",
    name: "Plataforma de Ensino EAD",
    tagline: "LMS completo para cursos online e trilhas",
    category: "Educação",
    shortDescription:
      "Plataforma EAD completa com cursos, trilhas, avaliações, certificados, pagamento de matrículas e área do aluno moderna.",
    longDescription:
      "LMS (Learning Management System) completo para escolas, professores e empresas que querem vender e entregar cursos online. Cursos em vídeo, PDF, scorm e aulas ao vivo. Trilhas de aprendizagem com pré-requisitos, avaliações automáticas, certificados digitais, fórum de discussão, gamificação com pontos e badges, área do aluno moderna, painel do professor com analytics de engajamento, e checkout integrado para venda de cursos com cupons e assinaturas.",
    technologies: ["Next.js", "Laravel", "PostgreSQL", "Redis", "Flutter", "Docker", "AWS"],
    features: [
      { title: "Cursos & Trilhas", description: "Vídeos, PDFs, SCORM, aulas ao vivo e trilhas com pré-requisitos." },
      { title: "Avaliações", description: "Questões, provas, gabarito automático, tentativas limitadas e analytics." },
      { title: "Certificados", description: "Certificados digitais verificáveis com QR Code e validade." },
      { title: "Gamificação", description: "Pontos, badges, ranking, conquistas e progresso visual." },
      { title: "Checkout", description: "Venda de cursos com cupons, assinaturas e parcelamento via PIX/cartão." },
      { title: "App Mobile", description: "App do aluno para assistir aulas offline e baixar materiais." },
    ],
    highlights: ["Cursos", "Trilhas", "Certificados", "Gamificação", "App mobile", "Checkout"],
    screenshots: [
      { label: "Área do Aluno", gradient: "from-blue-600 via-indigo-600 to-purple-600" },
      { label: "Player de Aulas", gradient: "from-rose-500 via-pink-600 to-fuchsia-600" },
      { label: "Painel do Professor", gradient: "from-emerald-500 via-teal-600 to-cyan-600" },
      { label: "Certificados Digitais", gradient: "from-amber-500 via-yellow-500 to-orange-500" },
    ],
    benefits: [
      "Plataforma EAD moderna pronta para vender cursos online",
      "App mobile com download offline para assistir aulas em qualquer lugar",
      "Gamificação aumenta engajamento e taxa de conclusão",
      "Checkout integrado com PIX, cartão, cupons e assinaturas",
    ],
    plans: [
      {
        name: "Starter",
        price: "R$ 12.000",
        description: "LMS para 1 escola com até 50 cursos.",
        features: ["Cursos", "Avaliações", "Certificados", "Checkout", "50 cursos", "Suporte 30 dias"],
      },
      {
        name: "Pro",
        price: "R$ 22.000",
        description: "App mobile, gamificação e trilhas avançadas.",
        features: ["Tudo do Starter", "App mobile", "Gamificação", "Trilhas", "Aulas ao vivo", "Suporte 90 dias"],
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "Sob consulta",
        description: "Multi-escola, white-label e infraestrutura dedicada.",
        features: ["Tudo do Pro", "Multi-escola", "White-label", "Infraestrutura dedicada", "SLA 99.9%", "Suporte 24/7"],
      },
    ],
    faq: [
      { q: "Suporta aulas ao vivo?", a: "Sim. Integração com Zoom, Google Meet e YouTube Live para aulas ao vivo com chat." },
      { q: "Posso vender cursos?", a: "Sim. Checkout integrado com PIX, cartão, cupons, assinaturas e parcelamento." },
      { q: "Tem app para os alunos?", a: "Sim. App mobile para iOS e Android com download offline das aulas." },
      { q: "Emite certificados?", a: "Sim. Certificados digitais verificáveis com QR Code, validade e personalização visual." },
    ],
    startingPrice: "R$ 12.000",
    status: "disponivel",
    featured: false,
    accentColor: "#f59e0b",
  },
  {
    slug: "sistema-financeiro-erp",
    name: "Sistema Financeiro ERP",
    tagline: "ERP financeiro com contas, fluxo de caixa e DRE",
    category: "Financeiro",
    shortDescription:
      "ERP financeiro completo com contas a pagar/receber, fluxo de caixa, conciliação bancária, DRE, centro de custos e integração bancária.",
    longDescription:
      "Sistema financeiro empresarial completo para gestão de contas a pagar e receber, fluxo de caixa projetado e realizado, conciliação bancária automática via OFX, DRE gerencial, centro de custos e receitas, orçamento, integração com bancos via Open Finance, e relatórios auditáveis. Multi-empresa com isolamento de dados, gestão de usuários com permissões granulares e auditoria completa de alterações.",
    technologies: ["Next.js", "Laravel", "PostgreSQL", "Redis", "Docker", "AWS"],
    features: [
      { title: "Contas a Pagar/Receber", description: "Lançamentos, parcelamentos, recorrência, baixa e estorno." },
      { title: "Fluxo de Caixa", description: "Projetado e realizado com cenários otimista/pessimista." },
      { title: "Conciliação Bancária", description: "Importação OFX, matching automático e manual de lançamentos." },
      { title: "DRE Gerencial", description: "Demonstrativo de resultado, centro de custos e receitas." },
      { title: "Orçamento", description: "Planejamento orçamentário com acompanhamento de desvios." },
      { title: "Multi-empresa", description: "Gestão de várias empresas com isolamento e consolidação." },
    ],
    highlights: ["Contas", "Fluxo de caixa", "Conciliação", "DRE", "Centro de custos", "Multi-empresa"],
    screenshots: [
      { label: "Dashboard Financeiro", gradient: "from-emerald-500 via-teal-600 to-cyan-600" },
      { label: "Contas a Pagar/Receber", gradient: "from-blue-600 via-indigo-600 to-purple-600" },
      { label: "Fluxo de Caixa", gradient: "from-amber-500 via-orange-500 to-rose-500" },
      { label: "DRE Gerencial", gradient: "from-violet-600 via-fuchsia-600 to-pink-600" },
    ],
    benefits: [
      "Visão financeira completa em tempo real com DRE gerencial",
      "Conciliação bancária automática via OFX reduz trabalho manual",
      "Fluxo de caixa projetado com cenários otimista/pessimista",
      "Multi-empresa com consolidação e isolamento de dados",
    ],
    plans: [
      {
        name: "Starter",
        price: "R$ 14.000",
        description: "ERP financeiro para 1 empresa.",
        features: ["Contas", "Fluxo de caixa", "Conciliação", "DRE", "1 empresa", "Suporte 30 dias"],
      },
      {
        name: "Pro",
        price: "R$ 24.000",
        description: "Multi-empresa, orçamento e centro de custos.",
        features: ["Tudo do Starter", "Multi-empresa", "Orçamento", "Centro de custos", "Open Finance", "Suporte 90 dias"],
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "Sob consulta",
        description: "White-label, auditoria avançada e SLA 99.9%.",
        features: ["Tudo do Pro", "White-label", "Auditoria SOX", "Infraestrutura dedicada", "SLA 99.9%", "Suporte 24/7"],
      },
    ],
    faq: [
      { q: "Integra com bancos via Open Finance?", a: "Sim. Integração com Open Finance para consulta de saldos e lançamentos em tempo real." },
      { q: "Suporta multi-empresa?", a: "Sim. Gestão de várias empresas com isolamento de dados e relatórios consolidados." },
      { q: "Emite DRE gerencial?", a: "Sim. DRE gerencial customizável com centro de custos e receitas." },
      { q: "Tem controle de permissões?", a: "Sim. Permissões granulares por usuário, módulo e empresa, com auditoria completa." },
    ],
    startingPrice: "R$ 14.000",
    status: "disponivel",
    featured: false,
    accentColor: "#22c55e",
  },
  {
    slug: "portal-imobiliario",
    name: "Portal Imobiliário",
    tagline: "Portal de imóveis com integração de imobiliárias",
    category: "Marketplace",
    shortDescription:
      "Portal imobiliário completo com gestão de imóveis, integração XML com imobiliárias parceiras, tour virtual e captação de leads.",
    longDescription:
      "Portal imobiliário estilo Zap Imóveis / Viva Real com gestão de imóveis próprios e integração XML com imobiliárias parceiras. Busca por mapa, filtros avançados, tour virtual 3D, captação e distribuição de leads, painel para imobiliárias e corretores, integração com WhatsApp e CRM, e relatórios de performance por anúncio. Monetização via planos de destaque, leads qualificados e mensalidade por imobiliária.",
    technologies: ["Next.js", "Laravel", "PostgreSQL", "Redis", "Docker", "Google Maps"],
    features: [
      { title: "Gestão de Imóveis", description: "Cadastro completo com fotos, tour 3D, descrição e características." },
      { title: "Busca por Mapa", description: "Busca georreferenciada com polígonos e filtros avançados." },
      { title: "Integração XML", description: "Sincronização automática com imobiliárias parceiras via XML." },
      { title: "Captação de Leads", description: "Formulários, WhatsApp e distribuição automática para corretores." },
      { title: "Painel de Imobiliária", description: "Gestão de imóveis, leads, performance e planos de destaque." },
      { title: "Tour Virtual 3D", description: "Integração com Matterport e tour 360° para imóveis premium." },
    ],
    highlights: ["Imóveis", "XML", "Mapa", "Tour 3D", "Leads", "Multi-imobiliária"],
    screenshots: [
      { label: "Vitrine de Imóveis", gradient: "from-blue-600 via-cyan-600 to-teal-600" },
      { label: "Busca por Mapa", gradient: "from-emerald-500 via-teal-600 to-cyan-600" },
      { label: "Painel da Imobiliária", gradient: "from-violet-600 via-purple-600 to-fuchsia-600" },
      { label: "Tour Virtual 3D", gradient: "from-amber-500 via-orange-500 to-rose-500" },
    ],
    benefits: [
      "Modelo de marketplace imobiliário validado e pronto para operar",
      "Integração XML com imobiliárias parceiras amplia o catálogo",
      "Captação e distribuição automática de leads para corretores",
      "Monetização via planos de destaque, leads e mensalidade",
    ],
    plans: [
      {
        name: "Starter",
        price: "R$ 16.000",
        description: "Portal imobiliário para 1 região.",
        features: ["Vitrine", "Busca por mapa", "Captação de leads", "1 região", "Painel admin", "Suporte 30 dias"],
      },
      {
        name: "Pro",
        price: "R$ 28.000",
        description: "Integração XML, tour 3D e multi-imobiliária.",
        features: ["Tudo do Starter", "Integração XML", "Tour 3D", "Multi-imobiliária", "CRM corretores", "Suporte 90 dias"],
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "Sob consulta",
        description: "Multi-região, white-label e infraestrutura dedicada.",
        features: ["Tudo do Pro", "Multi-região", "White-label", "Infraestrutura dedicada", "SLA 99.9%", "Suporte 24/7"],
      },
    ],
    faq: [
      { q: "Integra com imobiliárias parceiras?", a: "Sim. Importação automática de imóveis via XML no padrão Zap/Viva Real." },
      { q: "Como funciona a captação de leads?", a: "Leads captados via formulário e WhatsApp são distribuídos automaticamente para corretores." },
      { q: "Suporta tour virtual?", a: "Sim. Integração com Matterport e tour 360° para imóveis premium." },
      { q: "Posso monetizar o portal?", a: "Sim. Planos de destaque, leads qualificados e mensalidade por imobiliária." },
    ],
    startingPrice: "R$ 16.000",
    status: "disponivel",
    featured: false,
    accentColor: "#14b8a6",
  },
  {
    slug: "automacao-ia-backoffice",
    name: "Automação IA de Backoffice",
    tagline: "Agentes IA para automatizar processos internos",
    category: "IA",
    shortDescription:
      "Agentes IA para automatizar processos de backoffice: triagem de e-mails, extração de dados, conciliação, relatórios e workflows.",
    longDescription:
      "Solução de automação inteligente com agentes IA para eliminar trabalho repetitivo no backoffice. Os agentes leem e-mails, extraem dados de documentos (PDF, planilhas, imagens via OCR), executam conciliações, geram relatórios, alimentam sistemas via API e disparam workflows. Construído com LLMs, RAG e ferramentas de automação, integra com seus sistemas existentes (ERP, CRM, e-mail, planilhas) para reduzir custo operacional e erro humano.",
    technologies: ["OpenAI", "Node.js", "Laravel", "PostgreSQL", "Redis", "Docker", "n8n"],
    features: [
      { title: "Triagem de E-mails", description: "Classificação automática, extração de dados e roteamento." },
      { title: "OCR & Extração", description: "Leitura de PDFs, planilhas e imagens com LLM + OCR." },
      { title: "Conciliação Automática", description: "Matching de lançamentos, detecção de divergências e relatórios." },
      { title: "Workflows Visuais", description: "Construção visual de fluxos com gatilhos, condições e APIs." },
      { title: "Integração com Sistemas", description: "Conexão com ERP, CRM, e-mail, planilhas e APIs internas." },
      { title: "Painel & Auditoria", description: "Monitoramento, logs, auditoria e métricas de automação." },
    ],
    highlights: ["Agentes IA", "OCR", "Workflows", "Integração APIs", "Conciliação", "Auditoria"],
    screenshots: [
      { label: "Workflows Visuais", gradient: "from-blue-600 via-indigo-600 to-purple-600" },
      { label: "Triagem Automática", gradient: "from-emerald-500 via-teal-600 to-cyan-600" },
      { label: "OCR & Extração", gradient: "from-amber-500 via-orange-500 to-red-500" },
      { label: "Painel de Monitoramento", gradient: "from-violet-600 via-fuchsia-600 to-pink-600" },
    ],
    benefits: [
      "Redução de até 90% do trabalho manual repetitivo",
      "Agentes IA trabalham 24/7 com qualidade consistente",
      "Integração com seus sistemas via API e conectores",
      "Auditoria completa de todas as ações executadas",
    ],
    plans: [
      {
        name: "Starter",
        price: "R$ 12.000",
        description: "1 agente IA para 1 processo.",
        features: ["1 agente", "1 processo", "Painel admin", "Auditoria", "Suporte 30 dias"],
      },
      {
        name: "Pro",
        price: "R$ 24.000",
        description: "Multi-agente, workflows visuais e integrações.",
        features: ["Tudo do Starter", "Multi-agente", "Workflows visuais", "Integração APIs", "OCR", "Suporte 90 dias"],
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "Sob consulta",
        description: "LLM privado, infraestrutura dedicada e SLA 99.9%.",
        features: ["Tudo do Pro", "LLM privado", "Infraestrutura dedicada", "SLA 99.9%", "Gerente de conta", "Suporte 24/7"],
      },
    ],
    faq: [
      { q: "Quais processos podem ser automatizados?", a: "Triagem de e-mails, extração de dados, conciliação, relatórios, alimentação de sistemas e qualquer processo repetitivo baseado em regras." },
      { q: "Integra com meu ERP/CRM?", a: "Sim. Conexão via API e conectores nativos com os principais sistemas do mercado." },
      { q: "Como funciona a auditoria?", a: "Todas as ações dos agentes são logadas com input, output e tempo, permitindo auditoria completa." },
      { q: "Posso usar LLM privado?", a: "Sim. No plano Enterprise oferecemos LLM privado na sua infraestrutura para dados sensíveis." },
    ],
    startingPrice: "R$ 12.000",
    status: "disponivel",
    featured: false,
    accentColor: "#d946ef",
  },
]

export const TECH_LOGOS = [
  "Flutter",
  "Laravel",
  "Node.js",
  "React",
  "Next.js",
  "PostgreSQL",
  "Docker",
  "Redis",
  "Firebase",
  "OpenAI",
  "AWS",
  "Vercel",
]

export const STATS = [
  { value: 100, suffix: "+", label: "Projetos entregues" },
  { value: 30, suffix: "+", label: "Sistemas próprios" },
  { value: 99.9, suffix: "%", label: "Disponibilidade", decimals: 1 },
  { value: 24, suffix: "/7", label: "Suporte Técnico" },
]

export const SERVICES = [
  {
    icon: "Code2",
    title: "Desenvolvimento de Sistemas",
    description: "Criamos sistemas completos personalizados para resolver os desafios específicos da sua empresa.",
    features: ["Sistemas web", "APIs", "Painéis administrativos", "Integrações"],
  },
  {
    icon: "Smartphone",
    title: "Aplicativos Android e iOS",
    description: "Aplicativos nativos de alta performance em Flutter com publicação completa nas lojas.",
    features: ["Flutter", "Publicação Apple", "Publicação Google Play", "Push notifications"],
  },
  {
    icon: "LayoutGrid",
    title: "Sistemas SaaS",
    description: "Plataformas multiempresa com assinaturas, billing e painel administrativo completo.",
    features: ["Multi-tenant", "Assinaturas", "Billing automático", "Painel master"],
  },
  {
    icon: "ShoppingCart",
    title: "Marketplace",
    description: "Plataformas multi vendedores com pagamento, comissões e split automático.",
    features: ["Multi-vendedores", "PIX e Cartão", "Comissões", "Split de pagamento"],
  },
  {
    icon: "BrainCircuit",
    title: "Inteligência Artificial",
    description: "Chatbots, automações e agentes IA integrados aos seus sistemas e processos.",
    features: ["Chatbots", "Agentes IA", "Automações", "Integração LLM"],
  },
  {
    icon: "Server",
    title: "Consultoria em Infraestrutura",
    description: "Implantação, Docker, banco de dados, cloud, deploy, monitoramento e escalabilidade.",
    features: ["Docker", "Cloud", "Deploy", "Monitoramento"],
  },
]

export const PROCESS_STEPS = [
  {
    number: "01",
    title: "Conte sua ideia",
    description: "Conversamos sobre seu projeto, objetivos e necessidades. Entendemos o problema antes de propor a solução.",
  },
  {
    number: "02",
    title: "Planejamos",
    description: "Elaboramos escopo, arquitetura técnica, cronograma e orçamento detalhado. Tudo claro antes de começar.",
  },
  {
    number: "03",
    title: "Desenvolvemos",
    description: "Sprint semanais com entregas incrementais. Você acompanha o progresso em tempo real e valida cada etapa.",
  },
  {
    number: "04",
    title: "Publicamos",
    description: "Implantamos em produção, treinamos sua equipe e oferecemos suporte contínuo pós-lançamento.",
  },
]

export const CONSULTING_TECH = [
  { name: "Docker", category: "Container" },
  { name: "PostgreSQL", category: "Banco de Dados" },
  { name: "Redis", category: "Cache" },
  { name: "NGINX", category: "Reverse Proxy" },
  { name: "AWS", category: "Cloud" },
  { name: "Hetzner", category: "Cloud" },
  { name: "Oracle Cloud", category: "Cloud" },
  { name: "Azure", category: "Cloud" },
  { name: "Digital Ocean", category: "Cloud" },
  { name: "Backups", category: "Segurança" },
  { name: "Monitoramento", category: "Observabilidade" },
  { name: "Escalabilidade", category: "Performance" },
  { name: "CI/CD", category: "DevOps" },
  { name: "Deploy", category: "DevOps" },
  { name: "Load Balance", category: "Performance" },
  { name: "Firewall", category: "Segurança" },
  { name: "SSL", category: "Segurança" },
]

export const TECHNOLOGIES = [
  { name: "Flutter", icon: "Smartphone", color: "#54C5F8" },
  { name: "Laravel", icon: "Code2", color: "#FF2D20" },
  { name: "Next.js", icon: "Triangle", color: "#FFFFFF" },
  { name: "React", icon: "Atom", color: "#61DAFB" },
  { name: "Node.js", icon: "Hexagon", color: "#5FA04E" },
  { name: "TypeScript", icon: "FileCode", color: "#3178C6" },
  { name: "Docker", icon: "Container", color: "#2496ED" },
  { name: "Redis", icon: "Database", color: "#FF4438" },
  { name: "PostgreSQL", icon: "Database", color: "#4169E1" },
  { name: "Firebase", icon: "Flame", color: "#FFCA28" },
  { name: "OpenAI", icon: "Sparkles", color: "#10A37F" },
  { name: "Google Maps", icon: "MapPin", color: "#4285F4" },
  { name: "Vercel", icon: "Triangle", color: "#FFFFFF" },
  { name: "GitHub", icon: "Github", color: "#FFFFFF" },
  { name: "Linux", icon: "Terminal", color: "#FCC624" },
  { name: "NGINX", icon: "Server", color: "#009639" },
]

export const TESTIMONIALS = [
  {
    name: "Carlos Mendes",
    role: "CEO, Mobiliza Transportes",
    content: "A LIPE.HOST entregou nosso app de mobilidade em 6 semanas. Hoje operamos com 1200 motoristas ativos e zero indisponibilidade. Profissionalismo absurdo.",
    rating: 5,
    avatar: "CM",
  },
  {
    name: "Ana Paula Souza",
    role: "Diretora, EmbarqueTur",
    content: "Sistema de passagens fluviais impecável. O check-in digital reduziu filas em 80% no portão. Recuperei o investimento em 3 meses.",
    rating: 5,
    avatar: "AP",
  },
  {
    name: "Roberto Lima",
    role: "TI, Hospital Santa Cruz",
    content: "O Plantão Help reduziu 70% do tempo da nossa equipe de RH montando escalas. Suporte técnico excepcional e sistema robusto.",
    rating: 5,
    avatar: "RL",
  },
  {
    name: "Juliana Ferreira",
    role: "Fundadora, MercaApp",
    content: "Construímos um marketplace multi-vendedores com a LIPE.HOST. Em 8 meses estávamos com 200 lojas e processando R$ 4M em pedidos.",
    rating: 5,
    avatar: "JF",
  },
  {
    name: "Marcos Antônio",
    role: "CFO, Rede Varejo Plus",
    content: "Implantamos o PDV completo em 14 lojas. A frente de caixa é ultra-rápida e o módulo fiscal economizou dias de trabalho da contabilidade.",
    rating: 5,
    avatar: "MA",
  },
  {
    name: "Patrícia Rocha",
    role: "COO, SaudeTech",
    content: "O agente IA de atendimento reduziu em 78% os chamados humanos repetitivos. Nossos clientes elogiam a rapidez e qualidade das respostas.",
    rating: 5,
    avatar: "PR",
  },
]

export const FAQ = [
  {
    q: "Quanto custa desenvolver um sistema?",
    a: "O investimento varia conforme complexidade, escopo e prazo. Sistemas prontos da nossa loja partem de R$ 8.000. Projetos personalizados tipicamente ficam entre R$ 25.000 e R$ 150.000. Apresentamos um orçamento detalhado após a reunião de entendimento.",
  },
  {
    q: "Qual o prazo médio de entrega?",
    a: "Sistemas prontos são implantados em 2-4 semanas. Projetos personalizados variam de 6 semanas (MVP) a 6 meses (plataformas complexas). Trabalhamos com sprints semanais e entregas incrementais para você acompanhar o progresso.",
  },
  {
    q: "Vocês publicam o app na Apple App Store?",
    a: "Sim. Cuidamos de todo o processo de publicação: cadastro de desenvolvedor, configuração, submissão, resolução de revisões e publicação final na App Store da Apple.",
  },
  {
    q: "Vocês publicam o app na Google Play?",
    a: "Sim. Publicamos também na Google Play Store com todo o processo de configuração, listagem, política de privacidade e submissão.",
  },
  {
    q: "Quais formas de pagamento vocês aceitam?",
    a: "Aceitamos PIX, transferência bancária, boleto e cartão. Para projetos maiores, dividimos o pagamento em parcelas vinculadas a marcos de entrega (30% início, 40% desenvolvimento, 30% entrega).",
  },
  {
    q: "Como funcionam as atualizações do sistema?",
    a: "Oferecemos planos de manutenção mensal com atualizações, correções de bugs, melhorias e suporte técnico. Para sistemas prontos, a primeira atualização é gratuita nos primeiros 90 dias.",
  },
  {
    q: "Vocês oferecem suporte técnico?",
    a: "Sim. Suporte técnico via WhatsApp, e-mail e telefone. Planos Starter (horário comercial), Pro (até 22h) e Enterprise (24/7 com SLA). Todo sistema entregue tem garantia de 90 dias para correções.",
  },
  {
    q: "A hospedagem está inclusa?",
    a: "A hospedagem não está inclusa no valor do sistema, mas oferecemos consultoria completa para escolher e configurar a melhor infraestrutura (AWS, Hetzner, Oracle Cloud, Vercel) conforme a necessidade do projeto.",
  },
  {
    q: "Vocês configuram o servidor?",
    a: "Sim. Configuramos o servidor completo: Docker, NGINX, banco de dados, SSL, backups, monitoramento, CI/CD e deploy automatizado. Sua infraestrutura pronta para produção.",
  },
  {
    q: "Como funciona a manutenção pós-entrega?",
    a: "Oferecemos planos de manutenção mensal com valor acessivo que incluem monitoramento 24/7, atualizações de segurança, backup, suporte técnico e desenvolvimento de melhorias. Você foca no negócio, cuidamos da tecnologia.",
  },
]

export const NAV_LINKS = [
  { href: "#inicio", label: "Início" },
  { href: "#solucoes", label: "Soluções" },
  { href: "/loja", label: "Loja" },
  { href: "#projetos", label: "Projetos" },
  { href: "#consultoria", label: "Consultoria" },
  { href: "#contato", label: "Contato" },
]

export const WHAT_WE_DO_TAGS = [
  "Apps", "CRM", "ERP", "Marketplace", "Painéis", "Portais", "Dashboards", "IA", "Integrações", "API",
]

export const CATEGORIES_FILTER: SystemCategory[] = [
  "Todos",
  "Mobilidade",
  "Delivery",
  "Marketplace",
  "Saúde",
  "Educação",
  "Turismo",
  "Financeiro",
  "SaaS",
  "IA",
  "ERP",
  "CRM",
] as unknown as SystemCategory[]

// "Todos" is just a string for UI filtering
export const CATEGORIES = [
  "Todos",
  "Mobilidade",
  "Delivery",
  "Marketplace",
  "Saúde",
  "Educação",
  "Turismo",
  "Financeiro",
  "SaaS",
  "IA",
  "ERP",
  "CRM",
]

export const PORTFOLIO_PROJECTS = [
  { name: "Mobiliza Transportes", category: "Mobilidade", gradient: "from-blue-600 via-indigo-600 to-purple-600", year: "2024" },
  { name: "MercaApp Marketplace", category: "E-commerce", gradient: "from-orange-500 via-amber-500 to-yellow-500", year: "2024" },
  { name: "EmbarqueTur Fluvial", category: "Turismo", gradient: "from-cyan-500 via-teal-600 to-emerald-600", year: "2023" },
  { name: "Hospital Santa Cruz", category: "Saúde", gradient: "from-emerald-500 via-green-600 to-teal-600", year: "2024" },
  { name: "Varejo Plus PDV", category: "Varejo", gradient: "from-rose-500 via-red-500 to-orange-600", year: "2023" },
  { name: "SaudeTech IA", category: "Inteligência Artificial", gradient: "from-violet-600 via-fuchsia-600 to-pink-600", year: "2025" },
]
