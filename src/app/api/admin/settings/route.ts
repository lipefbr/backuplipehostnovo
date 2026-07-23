import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getMercadoPagoSettings, setSetting } from '@/lib/settings'

/**
 * GET /api/admin/settings — get all settings (admin only)
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  if ((session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const settings = await getMercadoPagoSettings()
  return NextResponse.json({ settings })
}

/**
 * PATCH /api/admin/settings — update settings (admin only)
 */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  if ((session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const allowedKeys = [
      'mp_access_token', 'mp_public_key', 'mp_client_id',
      'mp_client_secret', 'mp_sandbox', 'cron_secret',
      'support_whatsapp', 'support_email',
    ]

    for (const key of allowedKeys) {
      if (typeof body[key] === 'string') {
        await setSetting(key, body[key])
      }
    }

    const settings = await getMercadoPagoSettings()
    return NextResponse.json({ success: true, settings })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar', details: String(error) }, { status: 500 })
  }
}
