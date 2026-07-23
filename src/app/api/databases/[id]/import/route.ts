import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { importDatabaseFromJson } from '@/lib/db-manager'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * POST /api/databases/[id]/import
 * Body: { data: { "tableName": [{ "col1": "val1" }, ...] } }
 * Imports JSON data into the database, creating tables if they don't exist.
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
    const data = body.data
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Formato inválido. Envie { data: { "tabela": [...rows] } }' }, { status: 400 })
    }

    const result = await importDatabaseFromJson(
      database.dbUser,
      database.dbPassword,
      database.dbName,
      data as Record<string, unknown[]>
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      imported: result.imported,
      message: 'Importação concluída com sucesso!',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao importar', details: String(error) },
      { status: 500 }
    )
  }
}
