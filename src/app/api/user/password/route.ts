import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

/**
 * POST /api/user/password — change password
 * Body: { currentPassword, newPassword }
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const userId = (session.user as { id: string }).id

  try {
    const body = await req.json()
    const currentPassword = (body.currentPassword || '').toString()
    const newPassword = (body.newPassword || '').toString()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Senha atual e nova senha são obrigatórias' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Nova senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    if (newPassword.length > 100) {
      return NextResponse.json(
        { error: 'Nova senha muito longa (máx 100 caracteres)' },
        { status: 400 }
      )
    }

    // Get user
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12)

    await db.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    })

    return NextResponse.json({ success: true, message: 'Senha alterada com sucesso' })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Erro ao alterar senha', details: String(error) },
      { status: 500 }
    )
  }
}
