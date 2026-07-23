import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * GET /api/user/profile — get current user's full profile
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const userId = (session.user as { id: string }).id

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      deploys: {
        select: { id: true, name: true, status: true, createdAt: true },
        take: 5,
      },
      databases: {
        select: { id: true, name: true, engine: true, status: true, createdAt: true },
        take: 5,
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  // Calculate total spent
  const totalSpent = user.orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => {
      const price = parseFloat(o.price?.replace(/[^\d,]/g, '').replace(',', '.') || '0')
      return sum + (isNaN(price) ? 0 : price)
    }, 0)

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      username: user.username,
      phone: user.phone,
      // Address
      addressStreet: user.addressStreet,
      addressNumber: user.addressNumber,
      addressComplement: user.addressComplement,
      addressNeighborhood: user.addressNeighborhood,
      addressCity: user.addressCity,
      addressState: user.addressState,
      addressZip: user.addressZip,
      // Plan
      plan: user.plan,
      planStatus: user.planStatus,
      planRenewalDate: user.planRenewalDate,
      // Stats
      totalSpent: totalSpent.toFixed(2),
      ordersCount: user.orders.length,
      deploysCount: user.deploys.length,
      databasesCount: user.databases.length,
      // Recent activity
      recentOrders: user.orders.map((o) => ({
        id: o.id,
        planName: o.planName,
        price: o.price,
        status: o.status,
        date: o.createdAt,
      })),
      recentDeploys: user.deploys,
      recentDatabases: user.databases,
      createdAt: user.createdAt,
    },
  })
}

/**
 * PATCH /api/user/profile — update profile fields
 * Body: { name?, username?, phone?, addressStreet?, ... }
 */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const userId = (session.user as { id: string }).id

  try {
    const body = await req.json()
    const update: Record<string, unknown> = {}

    // Name (required, min 2 chars)
    if (typeof body.name === 'string') {
      const name = body.name.trim()
      if (name.length < 2) {
        return NextResponse.json({ error: 'Nome deve ter pelo menos 2 caracteres' }, { status: 400 })
      }
      update.name = name
    }

    // Username (optional, only letters/numbers/underscores, 3-30 chars)
    if (typeof body.username === 'string') {
      const username = body.username.trim().toLowerCase()
      if (username && !/^[a-z0-9_]{3,30}$/.test(username)) {
        return NextResponse.json(
          { error: 'Username deve ter 3-30 caracteres (apenas letras, números e _)' },
          { status: 400 }
        )
      }
      // Check uniqueness if provided
      if (username) {
        const existing = await db.user.findFirst({
          where: { username, NOT: { id: userId } },
        })
        if (existing) {
          return NextResponse.json({ error: 'Username já está em uso' }, { status: 400 })
        }
      }
      update.username = username || null
    }

    // Phone (optional, just sanitize)
    if (typeof body.phone === 'string') {
      const phone = body.phone.trim()
      if (phone && phone.length < 8) {
        return NextResponse.json({ error: 'Telefone inválido' }, { status: 400 })
      }
      update.phone = phone || null
    }

    // Avatar URL (optional)
    if (typeof body.avatar === 'string') {
      update.avatar = body.avatar || null
    }

    // Address fields (all optional)
    const addressFields = [
      'addressStreet', 'addressNumber', 'addressComplement',
      'addressNeighborhood', 'addressCity', 'addressState', 'addressZip'
    ]
    for (const field of addressFields) {
      if (typeof body[field] === 'string') {
        update[field] = (body[field] as string).trim() || null
      }
    }

    // Validate state (UF) if provided — must be 2 letters
    if (typeof update.addressState === 'string' && update.addressState) {
      const uf = (update.addressState as string).toUpperCase()
      if (!/^[A-Z]{2}$/.test(uf)) {
        return NextResponse.json({ error: 'Estado deve ter 2 letras (UF)' }, { status: 400 })
      }
      update.addressState = uf
    }

    // Validate CEP if provided
    if (typeof update.addressZip === 'string' && update.addressZip) {
      const cep = (update.addressZip as string).replace(/\D/g, '')
      if (cep.length !== 8) {
        return NextResponse.json({ error: 'CEP deve ter 8 dígitos' }, { status: 400 })
      }
      update.addressZip = cep
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: update,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        username: updated.username,
        phone: updated.phone,
        avatar: updated.avatar,
        addressStreet: updated.addressStreet,
        addressNumber: updated.addressNumber,
        addressComplement: updated.addressComplement,
        addressNeighborhood: updated.addressNeighborhood,
        addressCity: updated.addressCity,
        addressState: updated.addressState,
        addressZip: updated.addressZip,
      },
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil', details: String(error) },
      { status: 500 }
    )
  }
}
