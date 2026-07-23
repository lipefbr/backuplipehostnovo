/**
 * Settings manager — reads/writes key-value settings from the database.
 * Used for storing Mercado Pago credentials that admin can edit via UI.
 */
import { db } from '@/lib/db'

// Default values (hardcoded as fallback)
const DEFAULTS: Record<string, string> = {
  'mp_access_token': 'APP_USR-7328670002668756-071814-42c1d8468bf79cd1d587f75319c35350-128397166',
  'mp_public_key': 'APP_USR-fd9a41be-5f1e-4aa6-8e67-713245414d7c',
  'mp_client_id': '7328670002668756',
  'mp_client_secret': 'sdKJjtN0oJvqZupPq4VYeIFbxNdat5bz',
  'mp_sandbox': 'true',
  'cron_secret': 'lipehost-cron-secret-2026',
  'support_whatsapp': '5511999999999',
  'support_email': 'contato@lipe.host',
}

/**
 * Get a setting value by key. Falls back to DEFAULTS if not in DB.
 */
export async function getSetting(key: string): Promise<string> {
  try {
    const setting = await db.setting.findUnique({ where: { key } })
    return setting?.value || DEFAULTS[key] || ''
  } catch {
    return DEFAULTS[key] || ''
  }
}

/**
 * Get multiple settings at once.
 */
export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {}
  for (const key of keys) {
    result[key] = await getSetting(key)
  }
  return result
}

/**
 * Set a setting value (creates or updates).
 */
export async function setSetting(key: string, value: string): Promise<void> {
  await db.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
}

/**
 * Get all Mercado Pago settings.
 */
export async function getMercadoPagoSettings() {
  return getSettings([
    'mp_access_token',
    'mp_public_key',
    'mp_client_id',
    'mp_client_secret',
    'mp_sandbox',
    'cron_secret',
    'support_whatsapp',
    'support_email',
  ])
}

/**
 * Get the current MP access token (from DB or default).
 */
export async function getMPAccessToken(): Promise<string> {
  return getSetting('mp_access_token')
}

/**
 * Get the current MP public key.
 */
export async function getMPPublicKey(): Promise<string> {
  return getSetting('mp_public_key')
}
