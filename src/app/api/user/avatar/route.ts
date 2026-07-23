import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * POST /api/user/avatar — upload avatar (base64 data URL)
 * Body: { avatar: "data:image/png;base64,..." }
 *
 * Avatar is stored as a data URL in the database (SQLite).
 * For small images (< 1MB) this works fine. For larger images,
 * we'd need to store on disk + serve via /api/avatar/[userId].
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const userId = (session.user as { id: string }).id

  try {
    const body = await req.json()
    const avatar = (body.avatar || '').toString()

    if (!avatar) {
      return NextResponse.json({ error: 'Avatar vazio' }, { status: 400 })
    }

    // Validate it's a data URL or HTTP URL
    if (!avatar.startsWith('data:image/') && !avatar.startsWith('http')) {
      return NextResponse.json(
        { error: 'Avatar deve ser uma imagem (data URL ou URL)' },
        { status: 400 }
      )
    }

    // Size limit: 1MB for data URLs (base64 is ~1.33x the binary size)
    if (avatar.startsWith('data:image/') && avatar.length > 1.5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Imagem muito grande (máx 1MB). Reduza antes de enviar.' },
        { status: 400 }
      )
    }

    await db.user.update({
      where: { id: userId },
      data: { avatar },
    })

    return NextResponse.json({ success: true, avatar })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar avatar', details: String(error) },
      { status: 500 }
    )
  }
}
