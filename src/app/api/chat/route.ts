import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

const GLM_API_KEY = 'd4ec7973ecb1429ead4718dc20c80f9d.Qw46w4BTI6GMmDqm'
const GLM_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
const GLM_MODEL = 'glm-4.7-flash'

/**
 * Verifica o status HTTP real de uma URL (usado pela IA pra diagnosticar sites que não abrem).
 */
async function checkSiteStatus(url: string): Promise<{
  status: number | null
  ok: boolean
  error?: string
  responseTimeMs?: number
}> {
  const start = Date.now()
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
      redirect: 'follow',
      headers: { 'User-Agent': 'LipeHost-Monitor/1.0' },
    })
    return {
      status: res.status,
      ok: res.ok,
      responseTimeMs: Date.now() - start,
    }
  } catch (err) {
    return {
      status: null,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      responseTimeMs: Date.now() - start,
    }
  }
}

/**
 * Constrói contexto com os deploys do usuário logado + status real de cada site.
 */
async function buildUserContext(userId: string): Promise<string> {
  const deploys = await db.deploy.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      repoUrl: true,
      branch: true,
      framework: true,
      status: true,
      previewUrl: true,
      customDomain: true,
      createdAt: true,
      lastCommitSha: true,
      autoUpdate: true,
      errorMessage: true,
    },
  })

  if (deploys.length === 0) {
    return `Contexto do usuário:
- Projetos: NENHUM (ainda não fez nenhum deploy)

Instrução: se o usuário falar "meu site não abre" mas não tem projetos, sugira criar um deploy em /painel/projetos.`
  }

  // Para cada deploy ready, verificar status HTTP real (em paralelo)
  const deploysWithStatus = await Promise.all(
    deploys.map(async (d) => {
      const url = d.customDomain ? `https://${d.customDomain}` : d.previewUrl
      let httpStatus: { status: number | null; ok: boolean; error?: string; responseTimeMs?: number } | null = null
      if (url && d.status === 'ready') {
        httpStatus = await checkSiteStatus(url)
      }
      return { ...d, url, httpStatus }
    })
  )

  const deployList = deploysWithStatus.map((d, i) => {
    const lines = [
      `  ${i + 1}. ${d.name}`,
      `     - ID: ${d.id}`,
      `     - Repositório: ${d.repoUrl}`,
      `     - Branch: ${d.branch}`,
      `     - Framework: ${d.framework || 'desconhecido'}`,
      `     - Status do deploy: ${d.status}`,
      `     - URL pública: ${d.url || 'não disponível'}`,
      `     - Domínio custom: ${d.customDomain || 'nenhum'}`,
      `     - Auto-update: ${d.autoUpdate ? 'ATIVADO' : 'desativado'}`,
      `     - Último commit: ${d.lastCommitSha || 'nenhum'}`,
      `     - Criado em: ${d.createdAt.toISOString()}`,
    ]
    if (d.httpStatus) {
      lines.push(`     - HTTP check: ${d.httpStatus.status ?? 'erro'} (${d.httpStatus.ok ? 'OK' : 'FALHOU'}) em ${d.httpStatus.responseTimeMs}ms`)
      if (d.httpStatus.error) lines.push(`     - Erro HTTP: ${d.httpStatus.error}`)
    }
    if (d.errorMessage) lines.push(`     - Erro de build: ${d.errorMessage}`)
    return lines.join('\n')
  }).join('\n')

  return `Contexto do usuário logado (use APENAS esses dados, nunca invente projetos):
- Total de projetos: ${deploys.length}

Projetos/deployments do usuário:
${deployList}

REGRAS CRÍTICAS:
1. Você SÓ pode falar sobre os projetos listados acima. São os ÚNICOS projetos deste usuário.
2. Se o usuário falar "meu site não abre" ou similar:
   a. IDENTIFIQUE qual projeto (pelo nome ou URL)
   b. Veja o "HTTP check" no contexto — se status != 200 ou FALHOU, o site realmente está com problema
   c. Se status do deploy = 'error' ou 'building' há muito tempo, sugira REDEPLOY
   d. Explique que o redeploy pode ser feito em: /painel/projetos/[ID] -> botão "Deploy" ou "Redeploy"
3. Se o HTTP check retornou 200, o site está funcionando — pode ser cache do navegador (Ctrl+Shift+R)
4. Se o HTTP check FALHOU (timeout, connection refused, DNS erro), o site realmente está fora do ar — REDEPLOY necessário
5. NUNCA invente URLs ou nomes de projetos que não estão no contexto.
6. Responda sempre em português do Brasil, de forma amigável e objetiva.`
}

const SYSTEM_PROMPT = `Você é o assistente de suporte da LipeHost, plataforma de deploy de aplicações web.

Sua função:
- Ajudar usuários com problemas em seus deploys
- Diagnosticar sites que não abrem (você recebe o status HTTP real no contexto)
- Sugerir soluções: redeploy, configurar env vars, custom domain, etc.
- Criar tickets quando precisar de intervenção humana

Quando o usuário relatar "site não abre":
1. Diga "Estou analisando..." inicialmente (você já recebeu o HTTP check no contexto)
2. Com base no HTTP check, diga o resultado:
   - 200 OK: site está funcionando, pode ser cache (Ctrl+Shift+R) ou DNS ainda propagando
   - 404: página não encontrada, build pode ter falhado — sugira REDEPLOY
   - 500/502/503: erro no servidor — sugira REDEPLOY
   - timeout/connection refused: site fora do ar — REDEPLOY urgente
3. Mostre o caminho: "Acesse /painel/projetos/[ID-DO-PROJETO] e clique no botão Deploy"
4. Ofereça abrir ticket se o problema persistir

Quando pedir "falar com humano" ou "abrir ticket":
- Confirme os detalhes
- Sugira criar ticket em: /painel/tickets -> "Abrir ticket"

Seja claro, objetivo e amigável. Use markdown quando ajudar. Responda SEMPRE em português do Brasil.`

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const userId = (session.user as { id: string }).id
  const userName = session.user.name ?? 'Usuário'

  try {
    const body = await req.json()
    const { messages } = body

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array obrigatório' }, { status: 400 })
    }

    // Build context with user's deploy data + real HTTP status checks
    const userContext = await buildUserContext(userId)

    // Build the full message array with system + context + history
    const fullMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: userContext.replace('(a partir do session)', userName) },
      ...messages,
    ]

    // Call GLM API with retry on rate limit
    let glmResponse: Response | null = null
    let lastError = ''

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        glmResponse = await fetch(GLM_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GLM_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: GLM_MODEL,
            messages: fullMessages,
            temperature: 0.7,
            max_tokens: 1500,
          }),
          signal: AbortSignal.timeout(30000),
        })

        if (glmResponse.ok) break
        if (glmResponse.status === 429) {
          lastError = 'rate_limit'
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1))) // backoff
          continue
        }
        const errText = await glmResponse.text()
        lastError = `GLM ${glmResponse.status}: ${errText}`
        break
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err)
        if (attempt < 2) await new Promise((r) => setTimeout(r, 1000))
      }
    }

    if (!glmResponse || !glmResponse.ok) {
      console.error('GLM API error after retries:', lastError)
      // Fallback: still useful response based on context
      const fallbackMsg = lastError === 'rate_limit'
        ? 'Estou recebendo muitas mensagens agora. Tente novamente em alguns segundos, ou abra um ticket em /painel/tickets para atendimento humano.'
        : 'Tive um problema temporário ao processar sua mensagem. Por favor, tente novamente, ou abra um ticket em /painel/tickets.'

      return NextResponse.json({
        message: fallbackMsg,
        fallback: true,
        error: lastError,
      })
    }

    const data = await glmResponse.json()
    const aiMessage = data.choices?.[0]?.message?.content ?? 'Sem resposta da IA.'

    return NextResponse.json({
      message: aiMessage,
      model: GLM_MODEL,
      usage: data.usage,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: String(error) },
      { status: 500 }
    )
  }
}
