import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { listTables } from '@/lib/db-manager'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * GET /api/databases/[id]/tables — list all tables in the database
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

  const result = await listTables(database.dbUser, database.dbPassword, database.dbName)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ tables: result.tables })
}
