/**
 * Seed endpoint — creates an admin user and seeds the systems catalog
 * from src/lib/content.ts into the database.
 *
 * POST /api/seed to run.
 */
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { SYSTEMS } from '@/lib/content'

export async function POST() {
  try {
    // 1. Create default admin user if it doesn't exist
    const adminEmail = 'admin@lipe.host'
    const existingAdmin = await db.user.findUnique({
      where: { email: adminEmail },
    })
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('admin123', 12)
      await db.user.create({
        data: {
          name: 'Administrador LipeHost',
          email: adminEmail,
          passwordHash,
          role: 'ADMIN',
        },
      })
    }

    // 1b. Create default assinante (subscriber) user if it doesn't exist
    const userEmail = 'cliente@lipe.host'
    const existingUser = await db.user.findUnique({
      where: { email: userEmail },
    })
    if (!existingUser) {
      const passwordHash = await bcrypt.hash('cliente123', 12)
      await db.user.create({
        data: {
          name: 'Cliente LipeHost',
          email: userEmail,
          passwordHash,
          role: 'USER',
        },
      })
    }

    // 2. Seed systems catalog
    let systemsCreated = 0
    for (const sys of SYSTEMS) {
      const existing = await db.system.findUnique({ where: { slug: sys.slug } })
      if (existing) continue

      const created = await db.system.create({
        data: {
          slug: sys.slug,
          name: sys.name,
          tagline: sys.tagline,
          category: sys.category,
          shortDescription: sys.shortDescription,
          longDescription: sys.longDescription,
          technologies: JSON.stringify(sys.technologies),
          highlights: JSON.stringify(sys.highlights),
          startingPrice: sys.startingPrice ?? null,
          status: sys.status,
          featured: sys.featured ?? false,
          accentColor: sys.accentColor,
          features: {
            create: sys.features.map((f, i) => ({
              title: f.title,
              description: f.description,
              sortOrder: i,
            })),
          },
          screenshots: {
            create: sys.screenshots.map((s, i) => ({
              label: s.label,
              gradient: s.gradient,
              sortOrder: i,
            })),
          },
          benefits: {
            create: sys.benefits.map((b, i) => ({
              text: b,
              sortOrder: i,
            })),
          },
          plans: {
            create: sys.plans.map((p, i) => ({
              name: p.name,
              price: p.price,
              period: p.period ?? null,
              description: p.description,
              features: JSON.stringify(p.features),
              highlighted: p.highlighted ?? false,
              sortOrder: i,
            })),
          },
          faq: {
            create: sys.faq.map((f, i) => ({
              question: f.q,
              answer: f.a,
              sortOrder: i,
            })),
          },
        },
      })
      void created
      systemsCreated++
    }

    return NextResponse.json({
      success: true,
      message: 'Seed completo',
      admin: { email: adminEmail, password: 'admin123' },
      cliente: { email: userEmail, password: 'cliente123' },
      systemsCreated,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Erro no seed', details: String(error) },
      { status: 500 }
    )
  }
}
