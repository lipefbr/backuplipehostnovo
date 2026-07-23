import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { PreviewPageClient } from '@/components/preview/preview-page-client'

interface PageProps {
  params: Promise<{ slug: string }>
}

/**
 * Página pública de preview — acessível por qualquer pessoa (não requer login).
 * Mostra "Deploy em andamento" se o build está rolando,
 * ou exibe o conteúdo real se o deploy está pronto.
 *
 * URL: /preview/[slug]  (slug = owner-repo format)
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const deploy = await findDeployBySlug(slug)

  if (!deploy) {
    return { title: 'Site não encontrado' }
  }

  return {
    title: deploy.name,
    description: deploy.customDomain
      ? `Preview de ${deploy.name}`
      : `Deploy de ${deploy.name} na LipeHost`,
  }
}

async function findDeployBySlug(slug: string) {
  // slug format: "owner-repo" (lowercased)
  // Try to find by previewUrl containing this slug, or by customDomain
  const deploys = await db.deploy.findMany({
    where: {
      OR: [
        { previewUrl: { contains: slug } },
      ],
    },
    select: {
      id: true,
      name: true,
      status: true,
      previewUrl: true,
      customDomain: true,
      framework: true,
      buildLog: true,
      repoUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  // Filter by exact slug match in previewUrl
  return deploys.find((d) => {
    if (!d.previewUrl) return false
    try {
      const url = new URL(d.previewUrl)
      const subdomain = url.hostname.split('.')[0]
      return subdomain === slug
    } catch {
      return d.previewUrl.includes(slug)
    }
  })
}

export default async function PreviewPage({ params }: PageProps) {
  const { slug } = await params
  const deploy = await findDeployBySlug(slug)

  if (!deploy) {
    notFound()
  }

  return <PreviewPageClient deploy={deploy} />
}
