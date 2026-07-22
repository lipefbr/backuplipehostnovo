import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { createPostgresDatabase, sanitizeDbName } from '@/lib/db-manager'

/**
 * GET /api/databases — list all databases for the current user
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const userId = (session.user as { id: string }).id

  const databases = await db.database.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  // Don't expose the actual dbPassword in the response — only the connection string
  // Use VPS public IP for external connections (works without DNS setup)
  return NextResponse.json({
    databases: databases.map((d) => {
      // IP works for everyone; subdomain only works if user configures Cloudflare DNS only
      const externalHost = '209.145.62.238'
      const subdomain = `db-${d.slug}.db.lipe.host`
      return {
        id: d.id,
        name: d.name,
        slug: d.slug,
        engine: d.engine,
        status: d.status,
        // External host (IP) — works immediately
        host: externalHost,
        subdomain, // for display purposes only
        port: d.internalPort,
        dbName: d.dbName,
        dbUser: d.dbUser,
        // Plain connection string (no ?schema=public — works with psql, pg, DBeaver, etc.)
        connectionString: `postgresql://${d.dbUser}:*****@${externalHost}:${d.internalPort}/${d.dbName}`,
        // Prisma connection string (with ?schema=public — for DATABASE_URL in .env)
        prismaConnectionString: `postgresql://${d.dbUser}:*****@${externalHost}:${d.internalPort}/${d.dbName}?schema=public`,
        // Internal connection string (for apps deployed on same VPS — faster, no network)
        internalConnectionString: `postgresql://${d.dbUser}:*****@127.0.0.1:${d.internalPort}/${d.dbName}`,
        hasPassword: !!d.dbPassword,
        errorMessage: d.errorMessage,
        createdAt: d.createdAt,
      }
    }),
  })
}

/**
 * POST /api/databases — create a new database
 * Body: { name: string, engine?: 'postgresql' }
 *
 * Currently only 'postgresql' is supported (MySQL and Redis will be added later).
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const userId = (session.user as { id: string }).id

  try {
    const body = await req.json()
    const name = (body.name || '').toString().trim()
    if (!name) {
      return NextResponse.json({ error: 'Nome do banco é obrigatório' }, { status: 400 })
    }
    if (name.length < 3) {
      return NextResponse.json(
        { error: 'Nome do banco deve ter pelo menos 3 caracteres' },
        { status: 400 }
      )
    }

    const engine = (body.engine || 'postgresql').toString().toLowerCase()
    if (engine !== 'postgresql') {
      return NextResponse.json(
        { error: 'Apenas PostgreSQL está disponível no momento. MySQL e Redis em breve.' },
        { status: 400 }
      )
    }

    // Check slug uniqueness for this user
    const slug = sanitizeDbName(name, userId)
    const existing = await db.database.findFirst({
      where: { userId, slug },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Você já tem um banco com esse nome. Escolha outro.' },
        { status: 400 }
      )
    }

    // Create a placeholder record in DB with status='creating'
    const dbRecord = await db.database.create({
      data: {
        userId,
        name,
        slug,
        engine,
        status: 'creating',
        internalHost: '127.0.0.1',
        internalPort: 5432,
        dbName: slug,
        dbUser: `u_${slug.substring(3)}`.substring(0, 50),
        dbPassword: '', // will be set after creation
      },
    })

    // Actually create the PostgreSQL database + user
    const result = await createPostgresDatabase(name, userId)

    if (!result.success) {
      // Update record with error
      await db.database.update({
        where: { id: dbRecord.id },
        data: {
          status: 'error',
          errorMessage: result.error || 'Failed to create database',
        },
      })
      return NextResponse.json(
        { error: 'Falha ao criar banco de dados', details: result.error },
        { status: 500 }
      )
    }

    // Update record with actual connection info
    const updated = await db.database.update({
      where: { id: dbRecord.id },
      data: {
        status: 'active',
        internalHost: result.host,
        internalPort: result.port,
        dbName: result.dbName,
        dbUser: result.dbUser,
        dbPassword: result.dbPassword,
        errorMessage: null,
      },
    })

    return NextResponse.json({
      database: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        engine: updated.engine,
        status: updated.status,
        host: '209.145.62.238',
        subdomain: `db-${updated.slug}.db.lipe.host`,
        port: updated.internalPort,
        dbName: updated.dbName,
        dbUser: updated.dbUser,
        // Plain connection string (works with psql, pg, DBeaver, pgAdmin, etc.)
        connectionString: `postgresql://${updated.dbUser}:${result.dbPassword}@209.145.62.238:${updated.internalPort}/${updated.dbName}`,
        // Prisma connection string (use this in .env as DATABASE_URL when using Prisma ORM)
        prismaConnectionString: `postgresql://${updated.dbUser}:${result.dbPassword}@209.145.62.238:${updated.internalPort}/${updated.dbName}?schema=public`,
        // Internal connection string (for apps deployed on the same VPS — faster)
        internalConnectionString: `postgresql://${updated.dbUser}:${result.dbPassword}@127.0.0.1:${updated.internalPort}/${updated.dbName}`,
        createdAt: updated.createdAt,
      },
      message: 'Banco de dados criado com sucesso! Guarde a connection string — a senha não será mostrada novamente.',
    })
  } catch (error) {
    console.error('Create database error:', error)
    return NextResponse.json(
      { error: 'Erro interno ao criar banco de dados', details: String(error) },
      { status: 500 }
    )
  }
}
