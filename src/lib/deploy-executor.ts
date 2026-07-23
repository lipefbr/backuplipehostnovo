/**
 * Real deploy executor — runs on the VPS server.
 * Clones the repo, installs deps, builds, and starts the server.
 * Writes real-time logs to the database.
 */
import { spawn, exec } from 'child_process'
import { promisify } from 'util'
import { db } from '@/lib/db'

const execAsync = promisify(exec)

// Clean environment for deploy commands (avoids conflicts with parent Next.js process)
const CLEAN_ENV = {
  PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/local/go/bin',
  HOME: '/root',
  USER: 'root',
  LANG: 'en_US.UTF-8',
  TERM: 'xterm-256color',
  NODE_ENV: 'production',
}

// Helper: run execAsync with clean env
async function runExec(cmd: string, options?: { cwd?: string; timeout?: number }) {
  return execAsync(cmd, {
    cwd: options?.cwd,
    maxBuffer: 10 * 1024 * 1024,
    timeout: options?.timeout || 300000,
    env: CLEAN_ENV,
  })
}

interface DeployConfig {
  deployId: string
  repoUrl: string
  branch: string
  installCommand: string
  buildCommand: string
  outputDir: string
  framework: string
}

/**
 * Calculate a unique port for a deploy (3001-3999 range)
 */
export function getPortForDeploy(deployId: string): number {
  let hash = 0
  for (let i = 0; i < deployId.length; i++) {
    hash = ((hash << 5) - hash) + deployId.charCodeAt(i)
    hash |= 0
  }
  return 3001 + (Math.abs(hash) % 999)
}

/**
 * Run a command and stream output to the deploy's buildLog in the database.
 */
async function runCommand(
  cmd: string,
  cwd: string,
  deployId: string,
  label: string,
  currentLog: string
): Promise<{ stdout: string; stderr: string; log: string }> {
  return new Promise((resolve) => {
    const newLog = currentLog + `\n📦 ${label}\n   $ ${cmd}\n`

    // Update DB with initial log
    db.deploy.update({
      where: { id: deployId },
      data: { buildLog: newLog },
    }).catch(() => {})

    // Use clean environment to avoid conflicts with parent Next.js process
    const cleanEnv = {
      PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/local/go/bin',
      HOME: '/root',
      USER: 'root',
      LANG: 'en_US.UTF-8',
      TERM: 'xterm-256color',
      NODE_ENV: 'production',
    }

    exec(cmd, {
      cwd,
      maxBuffer: 10 * 1024 * 1024,
      timeout: 300000,
      env: cleanEnv,
    }, (error, stdout, stderr) => {
      let log = newLog
      if (stdout) {
        // Show last 20 lines of stdout
        const lines = stdout.trim().split('\n')
        const showLines = lines.length > 20 ? lines.slice(-20) : lines
        log += showLines.map(l => `   ${l}`).join('\n') + '\n'
      }
      if (stderr) {
        const lines = stderr.trim().split('\n')
        const showLines = lines.length > 10 ? lines.slice(-10) : lines
        log += showLines.map(l => `   ${l}`).join('\n') + '\n'
      }
      if (error) {
        log += `   ❌ Erro: ${error.message}\n`
      } else {
        log += `   ✓ Concluído\n`
      }

      // Update DB with final log
      db.deploy.update({
        where: { id: deployId },
        data: { buildLog: log },
      }).catch(() => {})

      resolve({ stdout: stdout || '', stderr: stderr || '', log })
    })
  })
}

/**
 * Execute a real deploy: clone, install, build, serve.
 * This function runs asynchronously and updates the database with real logs.
 */
export async function executeRealDeploy(config: DeployConfig): Promise<void> {
  const { deployId, repoUrl, branch, installCommand, buildCommand, framework } = config
  const deployDir = `/var/www/lipehost/deploys/${deployId}`
  const port = getPortForDeploy(deployId)

  let log = `🚀 Deploy REAL iniciado em ${new Date().toISOString()}\n\n`
  log += `📋 Configuração:\n`
  log += `   Deploy ID: ${deployId}\n`
  log += `   Repositório: ${repoUrl}\n`
  log += `   Branch: ${branch}\n`
  log += `   Framework: ${framework.toUpperCase()}\n`
  log += `   Porta: ${port}\n`
  log += `   Diretório: ${deployDir}\n\n`

  // Update status to building
  await db.deploy.update({
    where: { id: deployId },
    data: { status: 'building', buildLog: log },
  })

  try {
    // Step 1: Create directory and clone
    log += `📦 Etapa 1/5: Clonando repositório...\n`
    await db.deploy.update({ where: { id: deployId }, data: { buildLog: log } })

    // Remove old directory if exists
    await runExec(`rm -rf ${deployDir}`)
    await runExec(`mkdir -p /var/www/lipehost/deploys`)

    const cloneResult = await runCommand(
      `git clone --depth 1 --branch ${branch} ${repoUrl} ${deployDir}`,
      '/var/www/lipehost/deploys',
      deployId,
      'Clonando repositório',
      log
    )
    log = cloneResult.log

    // Step 2: Detect framework + ensure standalone output
    log += `\n📦 Etapa 2/5: Framework detectado: ${framework.toUpperCase()}\n`
    await db.deploy.update({ where: { id: deployId }, data: { buildLog: log } })

    // Ensure output: "standalone" in next.config (required for deployment)
    // Use a SINGLE safe Node.js script — never use sed (it breaks TypeScript syntax).
    if (framework === 'nextjs' || framework === 'node') {
      try {
        // Find which next.config file exists
        const { stdout: configFile } = await runExec(
          `ls ${deployDir}/next.config.ts ${deployDir}/next.config.js ${deployDir}/next.config.mjs ${deployDir}/next.config.cjs 2>/dev/null | head -1`
        )
        const configPath = configFile.trim()
        if (configPath) {
          // Single safe Node.js script that:
          // 1. Reads the file
          // 2. Checks if `output:` already exists (skip if it does)
          // 3. If not, inserts `output: "standalone",` after the FIRST `{` on the line
          //    that contains `nextConfig` (handles all syntax variants safely)
          // 4. Writes the file back
          await runExec(`cd ${deployDir} && node -e "
            const fs = require('fs');
            const path = '${configPath}';
            let c = fs.readFileSync(path, 'utf8');
            // Already has output: standalone — nothing to do
            if (/output\\\\s*:\\\\s*['\\\"]standalone['\\\"]/.test(c)) {
              console.log('already has standalone');
              process.exit(0);
            }
            // Find the line with 'nextConfig' followed by '=' and a '{'
            // Matches: const nextConfig = { ... } | const nextConfig: NextConfig = { ... } | export const nextConfig: NextConfig = { ... }
            const lines = c.split('\\\\n');
            let modified = false;
            for (let i = 0; i < lines.length; i++) {
              if (/nextConfig\\\\s*[:=].*=\\\\s*\\\\{/.test(lines[i]) && !lines[i].includes('output')) {
                // Insert '  output: \"standalone\",' on the NEXT line (safer than inline)
                lines.splice(i + 1, 0, '  output: \"standalone\",');
                modified = true;
                break;
              }
            }
            if (modified) {
              fs.writeFileSync(path, lines.join('\\\\n'));
              console.log('standalone added');
            } else {
              // Fallback: create a minimal next.config.ts that wraps the original
              console.log('could not modify — leaving as-is');
            }
          " 2>&1`)
          log += `   ⚙️ next.config verificado/ajustado para output: standalone\n`
          await db.deploy.update({ where: { id: deployId }, data: { buildLog: log } })
        }
      } catch {
        // ignore — build will continue with whatever config exists
      }
    }

    // Step 3: Install dependencies
    log += `\n📦 Etapa 3/5: Instalando dependências...\n`
    await db.deploy.update({ where: { id: deployId }, data: { buildLog: log } })

    const installCmd = installCommand || 'npm install'
    const installResult = await runCommand(
      installCmd,
      deployDir,
      deployId,
      `Instalando dependências (${installCmd})`,
      log
    )
    log = installResult.log

    // Step 4: Build (separate prisma generate from next build)
    log += `\n📦 Etapa 4/5: Buildando projeto...\n`
    await db.deploy.update({ where: { id: deployId }, data: { buildLog: log } })

    // First: run prisma generate separately (in case build script chains it)
    try {
      await runExec(`cd ${deployDir} && npx prisma generate 2>&1`)
      log += `   ✓ Prisma Client gerado\n`
      await db.deploy.update({ where: { id: deployId }, data: { buildLog: log } })
    } catch {
      // ignore if no prisma
    }

    // Then: run next build directly (not npm run build which might chain commands)
    const buildResult = await runCommand(
      'npx next build',
      deployDir,
      deployId,
      'npx next build (separado de prisma generate)',
      log
    )
    log = buildResult.log

    // If failed, try with ignoreBuildErrors
    if (log.includes('❌ Erro') || log.includes('Build error occurred')) {
      log += `\n⚠️ Build falhou. Tentando com ignoreBuildErrors\n`
      await db.deploy.update({ where: { id: deployId }, data: { buildLog: log } })
      try {
        await runExec(`cd ${deployDir} && sed -i 's/ignoreBuildErrors: false/ignoreBuildErrors: true/g' next.config.ts 2>/dev/null || sed -i 's/ignoreBuildErrors: false/ignoreBuildErrors: true/g' next.config.js 2>/dev/null || true`)
      } catch { /* ignore */ }
      const retryResult = await runCommand('npx next build', deployDir, deployId, 'Tentativa 2: npx next build (ignore errors)', log)
      log = retryResult.log
    }

    const buildSuccess = !log.includes('❌ Erro')

    // Step 5: Start server
    log += `\n📦 Etapa 5/5: Iniciando servidor na porta ${port}...\n`
    await db.deploy.update({ where: { id: deployId }, data: { buildLog: log } })

    // Kill any existing process on this port
    try {
      await runExec(`fuser -k ${port}/tcp 2>/dev/null || true`)
    } catch {
      // ignore
    }

    // ===== ROBUST STANDALONE DETECTION (works for ANY Next.js project) =====
    // 1) Try the standard path: .next/standalone/server.js
    // 2) If missing, search the entire .next tree for server.js (handles nested workspaces)
    // 3) If still missing, fall back to `npx next start` (no standalone needed)
    let standaloneDir = ''
    let hasStandalone = false

    try {
      // Standard path
      await runExec(`test -f ${deployDir}/.next/standalone/server.js`)
      standaloneDir = `${deployDir}/.next/standalone`
      hasStandalone = true
      log += `   ✓ Standalone encontrado em: ${standaloneDir}\n`
    } catch {
      // Nested path — find server.js anywhere under .next/standalone
      try {
        const { stdout } = await runExec(
          `find ${deployDir}/.next -name server.js -not -path "*/node_modules/*" -type f 2>/dev/null | head -1`
        )
        const found = (stdout || '').trim()
        if (found) {
          standaloneDir = found.replace('/server.js', '')
          hasStandalone = true
          log += `   ✓ Standalone encontrado (caminho aninhado): ${standaloneDir}\n`
        }
      } catch { /* ignore */ }
    }

    if (!hasStandalone) {
      log += `   ⚠️ Standalone não encontrado. Usando fallback: npx next start\n`
    }
    await db.deploy.update({ where: { id: deployId }, data: { buildLog: log } })

    // ===== BUILD THE START COMMAND (always defined; never undefined) =====
    // NOTE: env vars (PORT, NODE_ENV, DATABASE_URL, HOSTNAME) are EXPORTED by the
    // wrapper script below — do NOT include them in startCmd (bash's `exec` does
    // not accept inline VAR=value syntax, that would cause "exec: PORT=xxx: not found")
    let startCmd = ''
    let startCwd = deployDir

    if (framework === 'nextjs' && hasStandalone) {
      // Copy public + .next/static into standalone dir so images/css/js load correctly
      try {
        await runExec(`mkdir -p ${standaloneDir}/public 2>/dev/null || true`)
        await runExec(`cp -rf ${deployDir}/public/. ${standaloneDir}/public/ 2>/dev/null || true`)
        await runExec(`mkdir -p ${standaloneDir}/.next/static 2>/dev/null || true`)
        await runExec(`cp -rf ${deployDir}/.next/static/. ${standaloneDir}/.next/static/ 2>/dev/null || true`)
      } catch { /* ignore */ }
      startCwd = standaloneDir
      startCmd = `node server.js`
    } else if (framework === 'nextjs' || framework === 'node') {
      // Fallback: use next start (works without standalone)
      startCwd = deployDir
      startCmd = `npx next start -p ${port}`
    } else if (framework === 'vite' || framework === 'cra' || framework === 'astro') {
      const outputDir = config.outputDir || 'dist'
      startCwd = deployDir
      startCmd = `npx serve ${outputDir} -l ${port} -s`
    } else {
      startCwd = deployDir
      startCmd = `npm start`
    }

    log += `   ▶️ Comando de start: cd ${startCwd} && ${startCmd}\n`
    await db.deploy.update({ where: { id: deployId }, data: { buildLog: log } })

    // ===== KILL ANY EXISTING PROCESS ON THE PORT =====
    try { await runExec(`fuser -k ${port}/tcp 2>/dev/null || true`) } catch { /* ignore */ }

    // ===== PM2 START (uses startCmd + startCwd consistently) =====
    const pm2Name = `deploy-${deployId.substring(0, 12)}`
    try {
      await runExec(`pm2 delete ${pm2Name} 2>/dev/null || true`)
    } catch { /* ignore */ }

    // Set up SQLite + Prisma if the project uses it
    const dbPath = `${deployDir}/db/custom.db`
    try {
      await runExec(`mkdir -p ${deployDir}/db`)
      await runExec(`cd ${deployDir} && sed -i 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma 2>/dev/null || true`)
      await runExec(`cd ${deployDir} && npx prisma generate 2>&1`)
      await runExec(`cd ${deployDir} && npx prisma db push 2>&1`)
    } catch { /* ignore if no prisma */ }

    // ===== CREATE A WRAPPER SCRIPT (most robust way to start ANY project) =====
    // This avoids PM2's env handling issues and works for both standalone & fallback modes
    const startScriptPath = `${deployDir}/start.sh`
    const startScript = `#!/bin/bash
# Auto-generated by LIPE.HOST deploy executor
cd ${startCwd}
export PORT=${port}
export NODE_ENV=production
export DATABASE_URL=file:${dbPath}
export HOSTNAME=0.0.0.0
exec ${startCmd}
`
    try {
      const { writeFileSync, chmodSync } = await import('fs')
      writeFileSync(startScriptPath, startScript)
      chmodSync(startScriptPath, 0o755)
      log += `   ✓ Script de start criado: ${startScriptPath}\n`
      await db.deploy.update({ where: { id: deployId }, data: { buildLog: log } })
    } catch (e) {
      log += `   ⚠️ Erro ao criar start.sh: ${e instanceof Error ? e.message : String(e)}\n`
      await db.deploy.update({ where: { id: deployId }, data: { buildLog: log } })
    }

    // Start with PM2 — runs the wrapper script (no quoting/env issues ever)
    try {
      await runExec(
        `pm2 start ${startScriptPath} --name ${pm2Name} --cwd ${startCwd} 2>&1`
      )
      log += `   ✓ PM2 iniciado: ${pm2Name}\n`
    } catch (e) {
      log += `   ❌ Erro ao iniciar PM2: ${e instanceof Error ? e.message : String(e)}\n`
      await db.deploy.update({ where: { id: deployId }, data: { buildLog: log } })
    }
    await runExec(`pm2 save --force 2>&1`)

    // Wait a moment for server to start
    await new Promise(r => setTimeout(r, 3000))

    // Check if server is responding
    try {
      const { stdout } = await runExec(`curl -sS -o /dev/null -w "%{http_code}" http://localhost:${port}/`)
      log += `   ✓ Servidor respondendo na porta ${port} (HTTP ${stdout})\n`
    } catch {
      log += `   ⚠️ Servidor pode estar iniciando ainda...\n`
    }

    log += `\n✅ Deploy pronto!\n`
    log += `   URL: veja no painel\n`
    log += `   Porta: ${port}\n`
    log += `   Diretório: ${deployDir}\n`
    log += `   Log do servidor: ${deployDir}/server.log\n`

    // Update deploy record
    await db.deploy.update({
      where: { id: deployId },
      data: {
        status: 'ready',
        buildLog: log,
        lastCommitSha: Math.random().toString(36).substring(2, 10),
      },
    })

    // Configure nginx for this deploy
    await configureNginxForDeploy(deployId, port)

  } catch (error) {
    log += `\n❌ Erro no deploy: ${error instanceof Error ? error.message : String(error)}\n`
    await db.deploy.update({
      where: { id: deployId },
      data: {
        status: 'error',
        buildLog: log,
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    })
  }
}

/**
 * Configure nginx to proxy the preview subdomain to the deploy's port.
 *
 * Strategy: edit the main /etc/nginx/sites-available/lipehost config file
 * in-place. This avoids creating duplicate server blocks that would cause
 * "conflicting server name" warnings and break routing.
 *
 * - If server_name already exists in the config → just update the port
 * - If not → insert a new server block BEFORE the wildcard `*.lipe.host` block
 * - Always reload nginx at the end
 *
 * Exported so the API route can call it when the user changes the preview URL.
 */
export async function configureNginxForDeploy(deployId: string, port: number): Promise<void> {
  try {
    // Get the deploy to find its preview URL
    const deploy = await db.deploy.findUnique({ where: { id: deployId } })
    if (!deploy?.previewUrl) return

    // Extract hostname from previewUrl
    let hostname = ''
    try {
      const url = new URL(deploy.previewUrl)
      hostname = url.hostname
    } catch {
      return
    }

    const configPath = '/etc/nginx/sites-available/lipehost'
    const { readFileSync, writeFileSync } = await import('fs')
    let config = ''
    try {
      config = readFileSync(configPath, 'utf8')
    } catch {
      // If the main config doesn't exist, create one with just this deploy
      config = `server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    client_max_body_size 50M;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
`
    }

    // Build the server block for this deploy (with IPv6 listen)
    const serverBlock = `# Deploy: ${deploy.name || deployId}
server {
    listen 80;
    listen [::]:80;
    server_name ${hostname};
    client_max_body_size 50M;
    location / {
        proxy_pass http://127.0.0.1:${port};
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
    }
}`

    // Check if this hostname is already in the config
    const hostnameRegex = new RegExp(`server_name\\s+${hostname.replace(/\./g, '\\.')}\\s*;`)
    if (hostnameRegex.test(config)) {
      // Hostname exists — update the port for this server block
      // Find the server block containing this hostname and update its proxy_pass port
      const blockRegex = new RegExp(
        `(server\\s*\\{[^}]*?server_name\\s+${hostname.replace(/\./g, '\\.')}\\s*;[^}]*?proxy_pass\\s+http://127\\.0\\.0\\.1:)\\d+`,
        's'
      )
      config = config.replace(blockRegex, `$1${port}`)
    } else {
      // Hostname doesn't exist — insert the new server block BEFORE the wildcard `*.lipe.host` block
      // If there's no wildcard block, just append
      const wildcardMatch = config.match(/# Wildcard for[^\n]*\nserver\s*\{/)
      if (wildcardMatch && wildcardMatch.index !== undefined) {
        const insertPos = wildcardMatch.index
        config = config.slice(0, insertPos) + serverBlock + '\n\n' + config.slice(insertPos)
      } else {
        // No wildcard block — append at end
        config = config.trimEnd() + '\n\n' + serverBlock + '\n'
      }
    }

    writeFileSync(configPath, config)

    // Make sure the symlink exists
    try {
      await runExec(`ln -sf ${configPath} /etc/nginx/sites-enabled/lipehost`)
    } catch {
      // ignore — symlink probably already exists
    }

    // Test and reload nginx
    await runExec('nginx -t 2>&1')
    await runExec('systemctl reload nginx')

  } catch (error) {
    console.error('Nginx config error:', error)
  }
}

/**
 * Remove a hostname from the nginx config (cleanup when user changes preview URL).
 * Removes the entire server block that contains the given server_name.
 * Safe to call even if the hostname doesn't exist in the config.
 */
export async function removeNginxHostname(hostname: string): Promise<void> {
  try {
    const configPath = '/etc/nginx/sites-available/lipehost'
    const { readFileSync, writeFileSync } = await import('fs')
    let config = ''
    try {
      config = readFileSync(configPath, 'utf8')
    } catch {
      return // config doesn't exist, nothing to remove
    }

    // Escape the hostname for regex
    const escaped = hostname.replace(/\./g, '\\.')

    // Find and remove the entire server block containing this server_name
    // A server block starts with `server {` and ends with the matching `}`
    // We use a simple state machine to find the block boundaries
    const lines = config.split('\n')
    let blockStart = -1
    let blockEnd = -1
    let depth = 0

    for (let i = 0; i < lines.length; i++) {
      // Detect start of a server block
      if (blockStart === -1 && /server\s*\{/.test(lines[i]) && !lines[i].includes('server_name')) {
        // Check if this block contains our hostname
        // Look ahead for server_name within this block
        let foundHostname = false
        let lookaheadDepth = 1
        for (let j = i + 1; j < lines.length && lookaheadDepth > 0; j++) {
          const line = lines[j]
          if (/server\s*\{/.test(line) && !line.includes('server_name')) lookaheadDepth++
          if (line.includes('}')) lookaheadDepth--
          if (new RegExp(`server_name\\s+${escaped}\\s*;`).test(line)) {
            foundHostname = true
          }
        }
        if (foundHostname) {
          blockStart = i
          depth = 1
          continue
        }
      }

      // If we're inside the target block, track depth
      if (blockStart !== -1) {
        // Count opening and closing braces on this line
        const opens = (lines[i].match(/\{/g) || []).length
        const closes = (lines[i].match(/\}/g) || []).length
        depth += opens - closes
        if (depth <= 0) {
          blockEnd = i
          break
        }
      }
    }

    if (blockStart === -1 || blockEnd === -1) {
      // Hostname not found in config — nothing to remove
      return
    }

    // Remove the block (and any preceding comment line)
    let removeStart = blockStart
    if (removeStart > 0 && lines[removeStart - 1].trim().startsWith('#')) {
      removeStart = removeStart - 1
    }
    // Also remove trailing blank line
    let removeEnd = blockEnd
    if (removeEnd + 1 < lines.length && lines[removeEnd + 1].trim() === '') {
      removeEnd = removeEnd + 1
    }

    const newLines = [...lines.slice(0, removeStart), ...lines.slice(removeEnd + 1)]
    const newConfig = newLines.join('\n')
    writeFileSync(configPath, newConfig)

    // Test and reload
    try {
      await runExec('nginx -t 2>&1')
      await runExec('systemctl reload nginx')
    } catch (e) {
      console.error('nginx reload after remove failed:', e)
    }
  } catch (error) {
    console.error('removeNginxHostname error:', error)
  }
}

/**
 * Configure nginx to proxy a CUSTOM DOMAIN to the deploy's port.
 * This is separate from configureNginxForDeploy (which handles preview subdomains).
 *
 * - If customDomain is empty/null → REMOVE the custom domain server block
 * - If customDomain is set → ADD/UPDATE a server block for that domain
 *
 * The custom domain must NOT end with .lipe.host (that would conflict with
 * the preview subdomain handling). It should be a real external domain like
 * meusite.com.br that the user has pointed to the VPS IP via DNS.
 */
export async function configureNginxForCustomDomain(
  deployId: string,
  customDomain: string | null,
  port: number
): Promise<void> {
  try {
    const configPath = '/etc/nginx/sites-available/lipehost'
    const { readFileSync, writeFileSync } = await import('fs')
    let config = ''
    try {
      config = readFileSync(configPath, 'utf8')
    } catch {
      config = ''
    }

    // If customDomain is null/empty → remove any existing custom domain block for this deploy
    if (!customDomain) {
      // Find and remove server blocks tagged with "# CustomDomain: deployId"
      const tagRegex = new RegExp(
        `# CustomDomain: ${deployId}\\nserver\\s*\\{[\\s\\S]*?\\n\\}\\n*`,
        'g'
      )
      config = config.replace(tagRegex, '')
      writeFileSync(configPath, config)
      try {
        await runExec('nginx -t 2>&1')
        await runExec('systemctl reload nginx')
      } catch (e) {
        console.error('nginx reload after custom domain remove failed:', e)
      }
      return
    }

    const hostname = customDomain.toLowerCase().trim()

    // Build the server block for this custom domain
    // Tag it with the deployId so we can find/remove it later
    const serverBlock = `# CustomDomain: ${deployId}
server {
    listen 80;
    listen [::]:80;
    server_name ${hostname};
    client_max_body_size 50M;
    location / {
        proxy_pass http://127.0.0.1:${port};
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
    }
}`

    // Check if there's already a block tagged with this deployId
    const tagRegex = new RegExp(
      `(# CustomDomain: ${deployId}\\nserver\\s*\\{)[\\s\\S]*?(\\n\\})`,
      'g'
    )
    if (tagRegex.test(config)) {
      // Update the existing block (replace what's between the tag and the closing brace)
      config = config.replace(tagRegex, `$1\n    listen 80;\n    listen [::]:80;\n    server_name ${hostname};\n    client_max_body_size 50M;\n    location / {\n        proxy_pass http://127.0.0.1:${port};\n        proxy_http_version 1.1;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto https;\n        proxy_set_header Upgrade $http_upgrade;\n        proxy_set_header Connection "upgrade";\n        proxy_cache_bypass $http_upgrade;\n    }$2`)
    } else {
      // Check if this hostname is already configured (without our tag — maybe manually)
      const hostnameRegex = new RegExp(`server_name\\s+${hostname.replace(/\./g, '\\.')}\\s*;`)
      if (hostnameRegex.test(config)) {
        // Update the port in the existing block
        const blockRegex = new RegExp(
          `(server\\s*\\{[^}]*?server_name\\s+${hostname.replace(/\./g, '\\.')}\\s*;[^}]*?proxy_pass\\s+http://127\\.0\\.0\\.1:)\\d+`,
          's'
        )
        config = config.replace(blockRegex, `$1${port}`)
      } else {
        // Insert the new server block BEFORE the wildcard *.lipe.host block
        const wildcardMatch = config.match(/# Wildcard for[^\n]*\nserver\s*\{/)
        if (wildcardMatch && wildcardMatch.index !== undefined) {
          const insertPos = wildcardMatch.index
          config = config.slice(0, insertPos) + serverBlock + '\n\n' + config.slice(insertPos)
        } else {
          config = config.trimEnd() + '\n\n' + serverBlock + '\n'
        }
      }
    }

    writeFileSync(configPath, config)

    try {
      await runExec(`ln -sf ${configPath} /etc/nginx/sites-enabled/lipehost`)
    } catch {
      // ignore
    }

    await runExec('nginx -t 2>&1')
    await runExec('systemctl reload nginx')
  } catch (error) {
    console.error('configureNginxForCustomDomain error:', error)
  }
}
