import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * GET /api/preview/[id]/status — PUBLIC endpoint (no auth required)
 * Used by the preview page to poll deploy status while building.
 * Only returns safe fields (no env vars, no sensitive data).
 */
export async function GET(req: Request, { params }: Params) {
  const { id } = await params

  const deploy = await db.deploy.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      status: true,
      previewUrl: true,
      customDomain: true,
      framework: true,
      buildLog: true,
      repoUrl: true,
      updatedAt: true,
    },
  })

  if (!deploy) {
    return NextResponse.json({ error: 'Deploy não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ deploy })
}
