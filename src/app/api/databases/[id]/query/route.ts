import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { executeQuery } from '@/lib/db-manager'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * POST /api/databases/[id]/query — execute a SELECT query (read-only)
 * Body: { sql: string, limit?: number }
 */
export async function POST(req: Request, { params }: Params) {
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

  try {
    const body = await req.json()
    const sql = (body.sql || '').toString()
    if (!sql.trim()) {
      return NextResponse.json({ error: 'SQL vazio' }, { status: 400 })
    }
    const limit = typeof body.limit === 'number' ? body.limit : 1000
    const result = await executeQuery(database.dbUser, database.dbPassword, database.dbName, sql, { limit })
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    return NextResponse.json({
      rows: result.rows,
      columns: result.columns,
      rowCount: result.rowCount,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao executar query', details: String(error) },
      { status: 500 }
    )
  }
}
