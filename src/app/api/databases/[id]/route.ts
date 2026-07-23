import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { deletePostgresDatabase } from '@/lib/db-manager'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * GET /api/databases/[id] — get a single database (returns the FULL connection string once
 * if user explicitly asks via ?reveal=true, otherwise masks the password)
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

  const url = new URL(req.url)
  const reveal = url.searchParams.get('reveal') === 'true'

  const password = reveal ? database.dbPassword : '*****'
  const subdomain = `db-${database.slug}.db.lipe.host`
  const ipHost = '209.145.62.238'

  return NextResponse.json({
    database: {
      id: database.id,
      name: database.name,
      slug: database.slug,
      engine: database.engine,
      status: database.status,
      // Subdomain host (requires Cloudflare DNS only — gray cloud, NOT proxied)
      host: subdomain,
      // IP fallback (always works, even without DNS setup)
      ipHost,
      // Internal host (for apps deployed on the same VPS — faster)
      internalHost: '127.0.0.1',
      port: database.internalPort,
      dbName: database.dbName,
      dbUser: database.dbUser,
      dbPassword: password,
      // Plain connection string via subdomain (no ?schema=public — works with psql, pg, DBeaver)
      connectionString: `postgresql://${database.dbUser}:${password}@${subdomain}:${database.internalPort}/${database.dbName}`,
      // Prisma connection string (with ?schema=public — for .env DATABASE_URL)
      prismaConnectionString: `postgresql://${database.dbUser}:${password}@${subdomain}:${database.internalPort}/${database.dbName}?schema=public`,
      // IP fallback connection string (always works — use if subdomain doesn't resolve)
      ipConnectionString: `postgresql://${database.dbUser}:${password}@${ipHost}:${database.internalPort}/${database.dbName}`,
      // Internal connection string (for apps on same VPS)
      internalConnectionString: `postgresql://${database.dbUser}:${password}@127.0.0.1:${database.internalPort}/${database.dbName}`,
      errorMessage: database.errorMessage,
      createdAt: database.createdAt,
    },
  })
}

/**
 * DELETE /api/databases/[id] — delete a database (drops the actual PostgreSQL DB + user)
 */
export async function DELETE(req: Request, { params }: Params) {
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

  // Drop the actual PostgreSQL database + user
  if (database.engine === 'postgresql' && database.status === 'active') {
    const result = await deletePostgresDatabase(database.dbName, database.dbUser)
    if (!result.success) {
      // Log error but still delete the record (the DB might have been already deleted)
      console.error('Failed to drop PostgreSQL database:', result.error)
    }
  }

  // Delete the record from our DB
  await db.database.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
