/**
 * Real PostgreSQL database manager — runs on the VPS server.
 * Creates/deletes actual PostgreSQL databases + users using the `lipehost_admin` superuser.
 *
 * Connection info:
 * - Host (external): db-XXXX.db.lipe.host (DNS wildcard points to VPS)
 * - Host (internal for deploys): 127.0.0.1
 * - Port: 5432
 * - Admin user: lipehost_admin (SUPERUSER, CREATEDB, CREATEROLE)
 *
 * DNS setup (user needs to add this in Cloudflare):
 *   Type: A
 *   Name: *.db
 *   Target: 209.145.62.238
 *   Proxy: DNS only (no Cloudflare proxy — PostgreSQL needs direct TCP)
 *
 * This way, db-anyname.db.lipe.host resolves to the VPS, and PostgreSQL
 * on port 5432 accepts the connection. The subdomain is just for DNS resolution —
 * PostgreSQL doesn't care about the hostname (auth is by user/password/dbname).
 */
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const PG_ADMIN_USER = 'lipehost_admin'
const PG_ADMIN_PASS = 'LipeHostAdmin@2026'
const PG_HOST = '127.0.0.1'
const PG_PORT = 5432
// VPS public IP — used for external connections (works without DNS setup).
// Subdomain *.db.lipe.host would also work if user sets it up in Cloudflare
// as "DNS only" (gray cloud, NOT proxied). Until then, we use the IP directly.
const VPS_PUBLIC_IP = '209.145.62.238'
const EXTERNAL_HOST_SUFFIX = '.db.lipe.host'

// Clean environment for commands
const CLEAN_ENV = {
  PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
  HOME: '/root',
  USER: 'root',
  LANG: 'en_US.UTF-8',
  TERM: 'xterm-256color',
}

/**
 * Generate a random secure password (16 chars, alphanumeric + safe symbols).
 */
export function generateDbPassword(length = 20): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

/**
 * Sanitize a database name (lowercase, alphanumeric + underscore, max 30 chars).
 * PostgreSQL identifiers must start with a letter or underscore.
 */
export function sanitizeDbName(input: string, userId: string): string {
  const slug = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
    .substring(0, 20)
  // Prefix with short user ID to ensure uniqueness across users
  const userPrefix = userId.substring(0, 8).toLowerCase()
  const name = `lh_${userPrefix}_${slug}`.substring(0, 50)
  // Ensure starts with letter (PostgreSQL requirement for unquoted identifiers)
  return name
}

/**
 * Sanitize a PostgreSQL username (same rules as db name but with 'u_' prefix).
 */
export function sanitizeDbUser(input: string, userId: string): string {
  const dbName = sanitizeDbName(input, userId)
  return `u_${dbName.substring(3)}`.substring(0, 50)
}

/**
 * Run a psql command as the admin superuser.
 */
async function psqlAdmin(sql: string, options: { timeout?: number } = {}): Promise<{ stdout: string; stderr: string }> {
  // Use PGPASSWORD env var to avoid exposing password in process list
  const env = {
    ...CLEAN_ENV,
    PGPASSWORD: PG_ADMIN_PASS,
  }
  // Wrap SQL in single quotes, escaping any single quotes inside
  const escapedSql = sql.replace(/'/g, "'\\''")
  const cmd = `psql -h ${PG_HOST} -p ${PG_PORT} -U ${PG_ADMIN_USER} -d postgres -v ON_ERROR_STOP=1 -c '${escapedSql}'`
  try {
    const { stdout, stderr } = await execAsync(cmd, {
      env,
      timeout: options.timeout || 30000,
      maxBuffer: 1024 * 1024,
    })
    return { stdout, stderr }
  } catch (err: unknown) {
    const error = err as { stderr?: string; message?: string; stdout?: string }
    throw new Error(`psql failed: ${error.stderr || error.message || 'unknown error'}`)
  }
}

export interface CreateDbResult {
  success: boolean
  dbName: string
  dbUser: string
  dbPassword: string
  host: string
  port: number
  connectionString: string
  error?: string
}

/**
 * Create a real PostgreSQL database + user with full privileges on that DB only.
 */
export async function createPostgresDatabase(
  name: string,
  userId: string
): Promise<CreateDbResult> {
  const dbName = sanitizeDbName(name, userId)
  const dbUser = sanitizeDbUser(name, userId)
  const dbPassword = generateDbPassword(20)
  const host = PG_HOST
  const port = PG_PORT

  try {
    // Step 1: Create the user (role) with password
    // Use double-quoted identifiers to be safe with reserved words
    // DROP IF EXISTS first to handle retries
    await psqlAdmin(`DROP ROLE IF EXISTS "${dbUser}";`)
    await psqlAdmin(
      `CREATE ROLE "${dbUser}" WITH LOGIN PASSWORD '${dbPassword.replace(/'/g, "''")}' NOSUPERUSER NOCREATEDB NOCREATEROLE;`
    )

    // Step 2: Create the database owned by this user
    await psqlAdmin(`DROP DATABASE IF EXISTS "${dbName}";`)
    await psqlAdmin(`CREATE DATABASE "${dbName}" OWNER "${dbUser}";`)

    // Step 3: Grant all privileges on the database to the user
    await psqlAdmin(`GRANT ALL PRIVILEGES ON DATABASE "${dbName}" TO "${dbUser}";`)

    // Step 4: Connect to the new database and grant schema privileges
    // (need to run psql with -d dbName for this)
    const env = { ...CLEAN_ENV, PGPASSWORD: PG_ADMIN_PASS }
    const escapedDb = dbName.replace(/'/g, "'\\''")
    const grantCmd = `psql -h ${host} -p ${port} -U ${PG_ADMIN_USER} -d "${escapedDb}" -v ON_ERROR_STOP=1 -c "GRANT ALL ON SCHEMA public TO \\"${dbUser}\\"; GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO \\"${dbUser}\\"; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO \\"${dbUser}\\";"`
    await execAsync(grantCmd, { env, timeout: 30000, maxBuffer: 1024 * 1024 })

    // Step 5: Verify by connecting as the new user
    const testEnv = { ...CLEAN_ENV, PGPASSWORD: dbPassword }
    const testCmd = `psql -h ${host} -p ${port} -U ${dbUser} -d ${dbName} -c "SELECT current_user, current_database();"`
    try {
      const { stdout } = await execAsync(testCmd, { env: testEnv, timeout: 15000, maxBuffer: 1024 * 1024 })
      if (!stdout.includes(dbUser) || !stdout.includes(dbName)) {
        throw new Error('verification failed: user could not connect')
      }
    } catch (e) {
      throw new Error(`verification failed: ${(e as Error).message}`)
    }

    const connectionString = `postgresql://${dbUser}:${dbPassword}@${host}:${port}/${dbName}?schema=public`

    return {
      success: true,
      dbName,
      dbUser,
      dbPassword,
      host,
      port,
      connectionString,
    }
  } catch (error) {
    return {
      success: false,
      dbName,
      dbUser,
      dbPassword,
      host,
      port,
      connectionString: '',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Delete a PostgreSQL database + user.
 */
export async function deletePostgresDatabase(
  dbName: string,
  dbUser: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Step 1: Terminate active connections to the database
    await psqlAdmin(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${dbName.replace(/'/g, "''")}';`
    )

    // Step 2: Drop the database
    await psqlAdmin(`DROP DATABASE IF EXISTS "${dbName}";`)

    // Step 3: Drop the user
    await psqlAdmin(`DROP ROLE IF EXISTS "${dbUser}";`)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Test connection to a PostgreSQL database (used by the "test connection" feature).
 */
export async function testPostgresConnection(
  connectionString: string
): Promise<{ success: boolean; version?: string; error?: string }> {
  try {
    // Use psql with the connection string
    const env = { ...CLEAN_ENV }
    const escaped = connectionString.replace(/'/g, "'\\''")
    const cmd = `psql '${escaped}' -c "SELECT version();" -t -A`
    const { stdout } = await execAsync(cmd, { env, timeout: 15000, maxBuffer: 1024 * 1024 })
    return {
      success: true,
      version: stdout.trim(),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Get the external hostname for a database.
 * Currently uses the VPS public IP directly (works without DNS setup).
 * If user sets up *.db.lipe.host wildcard in Cloudflare (DNS only, NOT proxied),
 * we could switch to db-<slug>.db.lipe.host — but for now, IP is more reliable.
 */
export function getExternalHostname(_dbSlug: string): string {
  return VPS_PUBLIC_IP
}

/**
 * Get the subdomain that COULD be used (display only — shows what the
 * subdomain would be if user configures Cloudflare DNS properly).
 */
export function getExternalSubdomain(dbSlug: string): string {
  return `db-${dbSlug}${EXTERNAL_HOST_SUFFIX}`
}

/**
 * Get the full external connection string for a database.
 * Uses VPS public IP directly (works without DNS setup).
 * NOTE: For Prisma, append ?schema=public — for psql/pg, don't append it.
 */
export function getExternalConnectionString(dbUser: string, dbPassword: string, dbSlug: string, dbName: string): string {
  return `postgresql://${dbUser}:${dbPassword}@${VPS_PUBLIC_IP}:${PG_PORT}/${dbName}`
}

/**
 * Get the Prisma-compatible external connection string (with ?schema=public).
 * Use this for DATABASE_URL in .env when using Prisma ORM.
 */
export function getPrismaConnectionString(dbUser: string, dbPassword: string, dbName: string): string {
  return `postgresql://${dbUser}:${dbPassword}@${VPS_PUBLIC_IP}:${PG_PORT}/${dbName}?schema=public`
}

/**
 * Get the internal connection string (for apps deployed on the same VPS).
 * Uses 127.0.0.1 directly — faster (no DNS lookup, no network roundtrip).
 */
export function getInternalConnectionString(dbUser: string, dbPassword: string, dbName: string): string {
  return `postgresql://${dbUser}:${dbPassword}@${PG_HOST}:${PG_PORT}/${dbName}?schema=public`
}

/**
 * List all tables in a PostgreSQL database.
 * Returns array of { name, rows_count, size }.
 */
export async function listTables(
  dbUser: string,
  dbPassword: string,
  dbName: string
): Promise<{ success: boolean; tables?: Array<{ name: string; rowCount: number; size: string }>; error?: string }> {
  try {
    const env = { ...CLEAN_ENV, PGPASSWORD: dbPassword }
    // Query to list tables with row count and size
    const sql = `SELECT relname AS name, n_live_tup AS row_count, pg_size_pretty(pg_total_relation_size(C.oid)) AS size FROM pg_class C LEFT JOIN pg_namespace N ON (N.oid = C.relnamespace) WHERE nspname = 'public' AND relkind = 'r' ORDER BY relname;`
    const escaped = sql.replace(/'/g, "'\\''")
    const cmd = `psql -h ${PG_HOST} -p ${PG_PORT} -U ${dbUser} -d ${dbName} -t -A -F '|' -c '${escaped}'`
    const { stdout } = await execAsync(cmd, { env, timeout: 30000, maxBuffer: 5 * 1024 * 1024 })
    const tables = stdout.trim().split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const [name, rowCount, size] = line.split('|')
        return {
          name: name?.trim() || '',
          rowCount: parseInt(rowCount || '0', 10) || 0,
          size: size?.trim() || '0 bytes',
        }
      })
    return { success: true, tables }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Execute a SELECT query (read-only) on a database.
 * For safety, only SELECT statements are allowed.
 */
export async function executeQuery(
  dbUser: string,
  dbPassword: string,
  dbName: string,
  sql: string,
  options: { limit?: number } = {}
): Promise<{ success: boolean; rows?: unknown[]; columns?: string[]; rowCount?: number; error?: string }> {
  try {
    // Safety: only allow SELECT statements
    const trimmedSql = sql.trim().toLowerCase()
    if (!trimmedSql.startsWith('select') && !trimmedSql.startsWith('with')) {
      return { success: false, error: 'Apenas consultas SELECT são permitidas via esta API.' }
    }

    const env = { ...CLEAN_ENV, PGPASSWORD: dbPassword }
    // Wrap in transaction that we rollback — guarantees no changes even if user tries something tricky
    const limit = options.limit || 1000
    const wrappedSql = `BEGIN READ ONLY; ${sql} LIMIT ${limit}; COMMIT;`
    const escaped = wrappedSql.replace(/'/g, "'\\''")
    // Output as JSON
    const cmd = `psql -h ${PG_HOST} -p ${PG_PORT} -U ${dbUser} -d ${dbName} -t -A -c '${escaped}' --csv 2>&1 | head -1001`
    const { stdout } = await execAsync(cmd, { env, timeout: 60000, maxBuffer: 10 * 1024 * 1024 })

    // Parse CSV output
    const lines = stdout.trim().split('\n').filter((l) => l.trim())
    if (lines.length === 0) {
      return { success: true, rows: [], columns: [], rowCount: 0 }
    }
    const columns = lines[0].split(',').map((c) => c.replace(/^"|"$/g, ''))
    const rows = lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.replace(/^"|"$/g, ''))
      const obj: Record<string, unknown> = {}
      columns.forEach((col, i) => {
        obj[col] = values[i]
      })
      return obj
    })
    return { success: true, rows, columns, rowCount: rows.length }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Export a database (or specific table) as JSON.
 * Uses pg_dump with --inserts + custom parsing, or directly queries all tables.
 */
export async function exportDatabaseAsJson(
  dbUser: string,
  dbPassword: string,
  dbName: string,
  tableName?: string
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const env = { ...CLEAN_ENV, PGPASSWORD: dbPassword }
    let tablesToExport: string[] = []

    if (tableName) {
      tablesToExport = [tableName]
    } else {
      // Get all tables in public schema
      const listSql = `SELECT relname FROM pg_class C LEFT JOIN pg_namespace N ON (N.oid = C.relnamespace) WHERE nspname = 'public' AND relkind = 'r' ORDER BY relname;`
      const escapedList = listSql.replace(/'/g, "'\\''")
      const listCmd = `psql -h ${PG_HOST} -p ${PG_PORT} -U ${dbUser} -d ${dbName} -t -A -c '${escapedList}'`
      const { stdout: listOut } = await execAsync(listCmd, { env, timeout: 30000, maxBuffer: 5 * 1024 * 1024 })
      tablesToExport = listOut.trim().split('\n').filter((l) => l.trim())
    }

    const result: Record<string, unknown[]> = {}
    for (const table of tablesToExport) {
      const escapedTable = table.replace(/"/g, '\\"')
      const selectSql = `SELECT row_to_json(t) FROM (SELECT * FROM "${escapedTable}") t;`
      const escapedSelect = selectSql.replace(/'/g, "'\\''")
      const cmd = `psql -h ${PG_HOST} -p ${PG_PORT} -U ${dbUser} -d ${dbName} -t -A -c '${escapedSelect}'`
      const { stdout } = await execAsync(cmd, { env, timeout: 120000, maxBuffer: 50 * 1024 * 1024 })
      const rows = stdout.trim().split('\n').filter((l) => l.trim()).map((line) => JSON.parse(line))
      result[table] = rows
    }

    return {
      success: true,
      data: {
        exportedAt: new Date().toISOString(),
        database: dbName,
        tables: result,
        totalTables: tablesToExport.length,
        totalRows: Object.values(result).reduce((sum, arr) => sum + arr.length, 0),
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Import JSON data into a database.
 * JSON format: { "tableName": [{ "col1": "val1", "col2": "val2" }, ...] }
 * Will CREATE TABLE IF NOT EXISTS with columns inferred from the JSON keys.
 */
export async function importDatabaseFromJson(
  dbUser: string,
  dbPassword: string,
  dbName: string,
  jsonData: Record<string, unknown[]>
): Promise<{ success: boolean; imported?: Record<string, number>; error?: string }> {
  try {
    const env = { ...CLEAN_ENV, PGPASSWORD: dbPassword }
    const imported: Record<string, number> = {}

    for (const [tableName, rows] of Object.entries(jsonData)) {
      if (!Array.isArray(rows) || rows.length === 0) continue

      // Get column names from first row
      const columns = Object.keys(rows[0] as Record<string, unknown>)
      if (columns.length === 0) continue

      const escapedTable = tableName.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 50)
      const escapedColumns = columns.map((c) => `"${c.replace(/"/g, '\\"')}"`).join(', ')

      // Create table if not exists (all columns as TEXT for simplicity — user can ALTER later)
      const createSql = `CREATE TABLE IF NOT EXISTS "${escapedTable}" (${columns.map((c) => `"${c.replace(/"/g, '\\"')}" TEXT`).join(', ')});`
      const escapedCreate = createSql.replace(/'/g, "'\\''")
      const createCmd = `psql -h ${PG_HOST} -p ${PG_PORT} -U ${dbUser} -d ${dbName} -c '${escapedCreate}'`
      await execAsync(createCmd, { env, timeout: 30000, maxBuffer: 1024 * 1024 })

      // Insert rows in batches of 100
      const batchSize = 100
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize)
        const valuesClauses = batch.map((row) => {
          const vals = columns.map((c) => {
            const v = (row as Record<string, unknown>)[c]
            if (v === null || v === undefined) return 'NULL'
            const s = String(v).replace(/'/g, "''")
            return `'${s}'`
          })
          return `(${vals.join(', ')})`
        })
        const insertSql = `INSERT INTO "${escapedTable}" (${escapedColumns}) VALUES ${valuesClauses.join(', ')};`
        const escapedInsert = insertSql.replace(/'/g, "'\\''")
        const insertCmd = `psql -h ${PG_HOST} -p ${PG_PORT} -U ${dbUser} -d ${dbName} -c '${escapedInsert}'`
        await execAsync(insertCmd, { env, timeout: 60000, maxBuffer: 10 * 1024 * 1024 })
      }
      imported[escapedTable] = rows.length
    }

    return { success: true, imported }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
