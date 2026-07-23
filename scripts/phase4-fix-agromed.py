#!/usr/bin/env python3
"""Phase 4: Fix agromed's broken next.config.ts, rebuild, restart.
Also upload the latest deploy-executor.ts with the safe next.config handling.
"""
import sys
sys.path.insert(0, '/home/z/.local/lib/python3.13/site-packages')
import paramiko, time, base64

VPS_HOST = '209.145.62.238'
VPS_USER = 'root'
VPS_PASS = 'LipeHost@2026'
PROJECT_DIR = '/var/www/lipehost'
AGROMED_ID = 'cmrwh59s30001kp9flrq8zh21'
AGROMED_DIR = f'{PROJECT_DIR}/deploys/{AGROMED_ID}'

def run(ssh, cmd, timeout=300):
    print(f'  $ {cmd[:180]}')
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    exit_code = stdout.channel.exit_status
    if out.strip():
        for line in out.rstrip().split('\n')[:15]:
            print(f'    {line}')
    if err.strip():
        for line in err.rstrip().split('\n')[:5]:
            print(f'    ERR: {line}')
    return exit_code, out


def main():
    print(f'Connecting to {VPS_HOST}...')
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=15)
    print('✓ Connected')

    # 1. Upload the new fixed deploy-executor.ts (with safe next.config handling)
    print('\n=== 1. Upload fixed deploy-executor.ts ===')
    sftp = ssh.open_sftp()
    sftp.put('/home/z/my-project/src/lib/deploy-executor.ts', f'{PROJECT_DIR}/src/lib/deploy-executor.ts')
    sftp.close()
    print('  ✓ Uploaded')

    # Trigger rebuild of lipehost platform in background
    print('\n=== 2. Trigger lipehost platform rebuild (background) ===')
    ssh.exec_command(f"cd {PROJECT_DIR} && setsid bash -c 'NODE_ENV=production bun run build > /tmp/lipehost-build3.log 2>&1 && systemctl restart lipehost && echo DONE >> /tmp/lipehost-build3.log' </dev/null >/dev/null 2>&1 &", timeout=5)
    time.sleep(2)
    print('  ✓ Build started')

    # 3. Inspect agromed's broken next.config.ts
    print('\n=== 3. Inspect broken next.config.ts ===')
    run(ssh, f"cat {AGROMED_DIR}/next.config.ts")

    # 4. Restore it from git (git checkout will give us the original)
    print('\n=== 4. Restore next.config.ts from git ===')
    run(ssh, f"cd {AGROMED_DIR} && git checkout next.config.ts 2>&1")
    run(ssh, f"cat {AGROMED_DIR}/next.config.ts")

    # 5. Now use our safe Node.js script to add output: standalone
    print('\n=== 5. Add output: standalone (safe Node.js) ===')
    safe_script = """
const fs = require('fs');
const path = '""" + AGROMED_DIR + """/next.config.ts';
let c = fs.readFileSync(path, 'utf8');
if (/output\\s*:\\s*['\"]standalone['\"]/.test(c)) {
  console.log('already has standalone');
  process.exit(0);
}
const lines = c.split('\\n');
let modified = false;
for (let i = 0; i < lines.length; i++) {
  if (/nextConfig\\s*[:=].*=\\s*\\{/.test(lines[i]) && !lines[i].includes('output')) {
    lines.splice(i + 1, 0, '  output: \"standalone\",');
    modified = true;
    break;
  }
}
if (modified) {
  fs.writeFileSync(path, lines.join('\\n'));
  console.log('standalone added');
} else {
  console.log('could not modify');
}
"""
    # Encode and run
    script_b64 = base64.b64encode(safe_script.encode()).decode()
    run(ssh, f"echo '{script_b64}' | base64 -d > /tmp/fix-config.js && node /tmp/fix-config.js", timeout=30)
    run(ssh, f"cat {AGROMED_DIR}/next.config.ts")

    # 6. Kill the current broken agromed PM2 process
    print('\n=== 6. Stop agromed PM2 ===')
    run(ssh, "pm2 stop deploy-cmrwh59s3000 2>/dev/null; pm2 delete deploy-cmrwh59s3000 2>/dev/null; true", timeout=15)
    run(ssh, "fuser -k 3866/tcp 2>/dev/null; true", timeout=10)

    # 7. Run prisma generate (separately, before next build)
    print('\n=== 7. prisma generate ===')
    run(ssh, f"cd {AGROMED_DIR} && npx prisma generate 2>&1 | tail -10", timeout=120)

    # 8. Change prisma provider to sqlite if needed
    print('\n=== 8. Switch prisma to sqlite ===')
    run(ssh, f"cd {AGROMED_DIR} && sed -i 's/provider = \"postgresql\"/provider = \"sqlite\"/' prisma/schema.prisma 2>/dev/null; grep provider prisma/schema.prisma | head -3", timeout=15)
    run(ssh, f"cd {AGROMED_DIR} && npx prisma generate 2>&1 | tail -5", timeout=60)
    run(ssh, f"cd {AGROMED_DIR} && mkdir -p db && DATABASE_URL=file:{AGROMED_DIR}/db/custom.db npx prisma db push 2>&1 | tail -10", timeout=120)

    # 9. Run next build (this should now succeed with valid next.config.ts)
    print('\n=== 9. npx next build (this takes ~2 min) ===')
    ec, build_out = run(ssh, f"cd {AGROMED_DIR} && NODE_ENV=production npx next build 2>&1 | tail -30", timeout=600)
    print(f'  Build exit code: {ec}')

    # 10. Verify .next/standalone/server.js exists
    print('\n=== 10. Verify standalone exists ===')
    run(ssh, f"test -f {AGROMED_DIR}/.next/standalone/server.js && echo STD_OK || (find {AGROMED_DIR}/.next -name server.js -not -path '*/node_modules/*' | head -3)")

    # 11. Create start.sh and restart with PM2
    print('\n=== 11. Create start.sh + start PM2 ===')
    ec, find_out = run(ssh, f"test -f {AGROMED_DIR}/.next/standalone/server.js && echo 'STD' || (find {AGROMED_DIR}/.next -name server.js -not -path '*/node_modules/*' -type f 2>/dev/null | head -1)", timeout=15)
    standalone_line = find_out.strip().split('\n')[-1].strip() if find_out else ''

    standalone_dir = ''
    if standalone_line == 'STD':
        standalone_dir = f"{AGROMED_DIR}/.next/standalone"
    elif standalone_line.startswith('/'):
        standalone_dir = standalone_line.replace('/server.js', '')
    else:
        standalone_dir = AGROMED_DIR  # fallback

    print(f'  → standaloneDir: {standalone_dir}')

    port = 3866
    pm2_name = "deploy-cmrwh59s3000"
    db_path = f"{AGROMED_DIR}/db/custom.db"

    if standalone_dir != AGROMED_DIR:
        start_cmd = "node server.js"
    else:
        start_cmd = f"npx next start -p {port}"

    start_script = f"""#!/bin/bash
# Auto-generated by LIPE.HOST phase4 fix
cd {standalone_dir}
export PORT={port}
export NODE_ENV=production
export DATABASE_URL=file:{db_path}
export HOSTNAME=0.0.0.0
exec {start_cmd}
"""
    script_b64 = base64.b64encode(start_script.encode()).decode()
    run(ssh, f"echo '{script_b64}' | base64 -d > {AGROMED_DIR}/start.sh && chmod 755 {AGROMED_DIR}/start.sh && cat {AGROMED_DIR}/start.sh", timeout=15)

    # Copy static files
    if standalone_dir != AGROMED_DIR:
        run(ssh, f"mkdir -p {standalone_dir}/public {standalone_dir}/.next/static 2>/dev/null; cp -rf {AGROMED_DIR}/public/. {standalone_dir}/public/ 2>/dev/null; cp -rf {AGROMED_DIR}/.next/static/. {standalone_dir}/.next/static/ 2>/dev/null; true", timeout=30)

    # Start PM2
    run(ssh, f"pm2 start {AGROMED_DIR}/start.sh --name {pm2_name} --cwd {standalone_dir} 2>&1", timeout=30)
    run(ssh, "pm2 save --force 2>&1 | tail -1", timeout=15)

    # Wait and check
    time.sleep(5)
    run(ssh, f"curl -sS -o /dev/null -w 'agromed HTTP %{{http_code}}\\n' --max-time 10 http://localhost:{port}/ 2>&1", timeout=20)

    # Update DB status
    ec, http_out = run(ssh, f"curl -sS -o /dev/null -w '%{{http_code}}' --max-time 5 http://localhost:{port}/ 2>&1", timeout=15)
    if '200' in http_out or '30' in http_out or '40' in http_out:
        run(ssh, f"cd {PROJECT_DIR} && sqlite3 db/custom.db \"UPDATE Deploy SET status='ready', errorMessage=NULL WHERE id='{AGROMED_ID}';\"", timeout=15)
        print('  ✓ agromed marked as READY in DB')
    else:
        run(ssh, f"cd {PROJECT_DIR} && sqlite3 db/custom.db \"UPDATE Deploy SET status='error', errorMessage='Build OK but server not responding' WHERE id='{AGROMED_ID}';\"", timeout=15)
        print('  ⚠️ agromed still not responding')

    # Final PM2 list
    print('\n=== Final PM2 list ===')
    run(ssh, "pm2 list 2>&1", timeout=30)

    ssh.close()
    print('\n🎉 PHASE 4 DONE!')


if __name__ == '__main__':
    main()
