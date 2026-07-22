import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { exportDatabaseAsJson } from '@/lib/db-manager'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * GET /api/databases/[id]/export?table=optional_table_name
 * Exports the entire database (or a single table) as JSON.
 * Returns a downloadable JSON file.
 */
export async function GET(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const userId = (session.user as { id: string }).id
  const { id } = await params

  const database = await db.database.findUnique({ where: { id } })
  if (!database || database.userId !== userId) {
    return NextResponse.json({ error: 'Banco não encontrado' }, { status: 404 })
  }

  if (database.status !== 'active') {
    return NextResponse.json({ error: 'Banco não está ativo' }, { status: 400 })
  }

  const url = new URL(req.url)
  const tableName = url.searchParams.get('table') || undefined

  const result = await exportDatabaseAsJson(database.dbUser, database.dbPassword, database.dbName, tableName)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  const fileName = tableName
    ? `${database.slug}-${tableName}-${Date.now()}.json`
    : `${database.slug}-full-${Date.now()}.json`

  return new NextResponse(JSON.stringify(result.data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  })
}
