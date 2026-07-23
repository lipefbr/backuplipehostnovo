#!/usr/bin/env python3
"""Fix agromed next.config + add teste to nginx + rebuild agromed."""
import sys
sys.path.insert(0, '/home/z/.local/lib/python3.13/site-packages')
import paramiko, time, base64

VPS_HOST = '209.145.62.238'
VPS_USER = 'root'
VPS_PASS = 'LipeHost@2026'
PROJECT_DIR = '/var/www/lipehost'


def get_port_for_deploy(deploy_id: str) -> int:
    h = 0
    for ch in deploy_id:
        h = ((h << 5) - h) + ord(ch)
        h &= 0xFFFFFFFF
        if h >= 0x80000000:
            h -= 0x100000000
    return 3001 + (abs(h) % 999)


def run(ssh, cmd, timeout=120):
    print(f'$ {cmd[:150]}')
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    exit_code = stdout.channel.exit_status
    if out.strip():
        for line in out.rstrip().split('\n')[:15]:
            print(f'  {line}')
    if err.strip():
        for line in err.rstrip().split('\n')[:5]:
            print(f'  ERR: {line}')
    print(f'  [exit {exit_code}]')
    return exit_code, out


def main():
    print(f'Connecting to {VPS_HOST}...')
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=15)
    print('✓ Connected')

    AGROMED_ID = 'cmrwh59s30001kp9flrq8zh21'
    AGROMED_DIR = f'{PROJECT_DIR}/deploys/{AGROMED_ID}'
    TESTE_ID = 'cmrwic5wg0003kplsq58zcstk'
    TESTE_DIR = f'{PROJECT_DIR}/deploys/{TESTE_ID}'
    teste_port = get_port_for_deploy(TESTE_ID)
    agromed_port = get_port_for_deploy(AGROMED_ID)

    # === PART A: Fix agromed ===
    print(f'\n=== A. Fix agromed (port {agromed_port}) ===')

    # 1. Check current next.config.ts
    print('\n--- A1. Current next.config.ts ---')
    run(ssh, f'cat {AGROMED_DIR}/next.config.ts')

    # 2. Check the compiled next.config in standalone
    standalone_path = f'{AGROMED_DIR}/.next/standalone/deploys/{AGROMED_ID}'
    print(f'\n--- A2. Compiled next.config in standalone ---')
    run(ssh, f'ls {standalone_path}/next.config.* 2>/dev/null')
    run(ssh, f'cat {standalone_path}/next.config.compiled.js 2>/dev/null | head -20')

    # 3. Check what start.sh looks like
    print('\n--- A3. Current start.sh ---')
    run(ssh, f'cat {AGROMED_DIR}/start.sh')

    # 4. Restore next.config.ts from git + add standalone properly
    print('\n--- A4. Restore + fix next.config.ts ---')
    run(ssh, f'cd {AGROMED_DIR} && git checkout next.config.ts 2>&1')
    # Use the safe Node.js script
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
    script_b64 = base64.b64encode(safe_script.encode()).decode()
    run(ssh, f"echo '{script_b64}' | base64 -d > /tmp/fix-config.js && node /tmp/fix-config.js", timeout=30)
    run(ssh, f'cat {AGROMED_DIR}/next.config.ts')

    # 5. Delete old standalone build + rebuild
    print('\n--- A5. Clean old standalone + rebuild ---')
    run(ssh, f'rm -rf {AGROMED_DIR}/.next/standalone 2>/dev/null; rm -rf {AGROMED_DIR}/.next 2>/dev/null; echo CLEANED', timeout=30)

    # 6. prisma generate + db push
    print('\n--- A6. prisma generate + db push ---')
    run(ssh, f'cd {AGROMED_DIR} && npx prisma generate 2>&1 | tail -3', timeout=120)
    run(ssh, f'cd {AGROMED_DIR} && mkdir -p db && DATABASE_URL=file:{AGROMED_DIR}/db/custom.db npx prisma db push 2>&1 | tail -5', timeout=120)

    # 7. Build
    print('\n--- A7. next build ---')
    ec, _ = run(ssh, f'cd {AGROMED_DIR} && NODE_ENV=production npx next build 2>&1 | tail -10', timeout=600)
    print(f'  Build exit: {ec}')

    # 8. Find standalone
    print('\n--- A8. Find standalone ---')
    run(ssh, f'test -f {AGROMED_DIR}/.next/standalone/server.js && echo STD_OK || (find {AGROMED_DIR}/.next -name server.js -not -path "*/node_modules/*" | head -3)')

    # 9. Create fresh start.sh + restart PM2
    print('\n--- A9. Create start.sh + restart PM2 ---')
    # Find standalone dir
    ec, find_out = run(ssh, f"test -f {AGROMED_DIR}/.next/standalone/server.js && echo 'STD' || (find {AGROMED_DIR}/.next -name server.js -not -path '*/node_modules/*' -type f 2>/dev/null | head -1)", timeout=15)
    standalone_line = (find_out or '').strip().split('\n')[-1].strip()

    if standalone_line == 'STD':
        standalone_dir = f'{AGROMED_DIR}/.next/standalone'
    elif standalone_line.startswith('/'):
        standalone_dir = standalone_line.replace('/server.js', '')
    else:
        standalone_dir = AGROMED_DIR

    print(f'  standaloneDir: {standalone_dir}')

    db_path = f'{AGROMED_DIR}/db/custom.db'
    if standalone_dir != AGROMED_DIR:
        start_cmd = 'node server.js'
    else:
        start_cmd = f'npx next start -p {agromed_port}'

    # Use string concatenation (NOT f-strings) to avoid { being interpreted
    start_script = '#!/bin/bash\n# Auto-generated by LIPE.HOST fix script\ncd ' + standalone_dir + '\nexport PORT=' + str(agromed_port) + '\nexport NODE_ENV=production\nexport DATABASE_URL=file:' + db_path + '\nexport HOSTNAME=0.0.0.0\nexec ' + start_cmd + '\n'
    script_b64 = base64.b64encode(start_script.encode()).decode()
    run(ssh, f"echo '{script_b64}' | base64 -d > {AGROMED_DIR}/start.sh && chmod 755 {AGROMED_DIR}/start.sh && cat {AGROMED_DIR}/start.sh", timeout=15)

    # Copy static files
    if standalone_dir != AGROMED_DIR:
        run(ssh, f'mkdir -p {standalone_dir}/public {standalone_dir}/.next/static 2>/dev/null; cp -rf {AGROMED_DIR}/public/. {standalone_dir}/public/ 2>/dev/null; cp -rf {AGROMED_DIR}/.next/static/. {standalone_dir}/.next/static/ 2>/dev/null; true', timeout=30)

    # Stop & start PM2
    run(ssh, f'pm2 stop deploy-cmrwh59s3000 2>/dev/null; pm2 delete deploy-cmrwh59s3000 2>/dev/null; fuser -k {agromed_port}/tcp 2>/dev/null; true', timeout=20)
    time.sleep(2)
    run(ssh, f'pm2 start {AGROMED_DIR}/start.sh --name deploy-cmrwh59s3000 --cwd {standalone_dir} 2>&1', timeout=30)
    run(ssh, 'pm2 save --force 2>&1 | tail -1', timeout=15)

    time.sleep(5)
    run(ssh, f"curl -sS -o /dev/null -w 'agromed: HTTP %{{http_code}}\\n' --max-time 10 http://localhost:{agromed_port}/ 2>&1", timeout=20)

    # === PART B: Add teste to nginx ===
    print(f'\n=== B. Add teste to nginx (port {teste_port}) ===')

    # Write a simpler Python script that doesn't use f-strings for the nginx block
    nginx_fix_script = '''import re
config_path = '/etc/nginx/sites-available/lipehost'
with open(config_path, 'r') as f:
    config = f.read()

hostname = 'womannovo-preview.lipe.host'
port = ''' + str(teste_port) + '''

# Check if already exists
if 'server_name ' + hostname + ';' in config:
    # Update port using regex
    pattern = re.compile(r'(server\\s*\\{[^}]*?server_name\\s+' + re.escape(hostname) + r'\\s*;[^}]*?proxy_pass\\s+http://127\\.0\\.0\\.1:)\\d+', re.DOTALL)
    config = pattern.sub(r'\\g<1>' + str(port), config)
    print('updated existing block port to ' + str(port))
else:
    # Build new block with string concatenation (no f-string)
    new_block = '# Deploy: teste\\n'
    new_block += 'server {\\n'
    new_block += '    listen 80;\\n'
    new_block += '    listen [::]:80;\\n'
    new_block += '    server_name ' + hostname + ';\\n'
    new_block += '    client_max_body_size 50M;\\n'
    new_block += '    location / {\\n'
    new_block += '        proxy_pass http://127.0.0.1:' + str(port) + ';\\n'
    new_block += '        proxy_http_version 1.1;\\n'
    new_block += '        proxy_set_header Host $host;\\n'
    new_block += '        proxy_set_header X-Real-IP $remote_addr;\\n'
    new_block += '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\\n'
    new_block += '        proxy_set_header X-Forwarded-Proto https;\\n'
    new_block += '        proxy_set_header Upgrade $http_upgrade;\\n'
    new_block += '        proxy_set_header Connection "upgrade";\\n'
    new_block += '        proxy_cache_bypass $http_upgrade;\\n'
    new_block += '    }\\n'
    new_block += '}\\n\\n'
    
    # Insert before wildcard block
    wildcard_match = re.search(r'# Wildcard for', config)
    if wildcard_match:
        pos = wildcard_match.start()
        config = config[:pos] + new_block + config[pos:]
    else:
        config = config.rstrip() + '\\n\\n' + new_block
    print('inserted new block for ' + hostname)

with open(config_path, 'w') as f:
    f.write(config)
print('done')
'''
    b64 = base64.b64encode(nginx_fix_script.encode()).decode()
    run(ssh, f"echo '{b64}' | base64 -d > /tmp/fix-nginx-teste.py && python3 /tmp/fix-nginx-teste.py", timeout=30)

    # Test + reload nginx
    print('\n--- B2. Test + reload nginx ---')
    run(ssh, 'nginx -t 2>&1')
    run(ssh, 'systemctl reload nginx && echo RELOADED')

    # === PART C: Verify all 4 deploys ===
    print('\n=== C. Final verification ===')
    run(ssh, "curl -sS -o /dev/null -w 'abelha: HTTP %{http_code}\\n' --max-time 5 -H 'Host: lipefbr-abelha-token-push-preview.lipe.host' http://localhost:80/")
    run(ssh, "curl -sS -o /dev/null -w 'agromed: HTTP %{http_code}\\n' --max-time 5 -H 'Host: lipefbr-agromedub-preview.lipe.host' http://localhost:80/")
    run(ssh, "curl -sS -o /dev/null -w 'canva: HTTP %{http_code}\\n' --max-time 5 -H 'Host: lipefbr-canvanovo-preview.lipe.host' http://localhost:80/")
    run(ssh, "curl -sS -o /dev/null -w 'teste: HTTP %{http_code}\\n' --max-time 5 -H 'Host: womannovo-preview.lipe.host' http://localhost:80/")

    # Also test the public URLs via Cloudflare
    print('\n=== D. Public URLs via Cloudflare ===')
    run(ssh, "curl -sS -o /dev/null -w 'public abelha: HTTP %{http_code}\\n' --max-time 10 https://lipefbr-abelha-token-push-preview.lipe.host/")
    run(ssh, "curl -sS -o /dev/null -w 'public agromed: HTTP %{http_code}\\n' --max-time 10 https://lipefbr-agromedub-preview.lipe.host/")
    run(ssh, "curl -sS -o /dev/null -w 'public canva: HTTP %{http_code}\\n' --max-time 10 https://lipefbr-canvanovo-preview.lipe.host/")
    run(ssh, "curl -sS -o /dev/null -w 'public teste: HTTP %{http_code}\\n' --max-time 10 https://womannovo-preview.lipe.host/")

    # Update DB status for all
    print('\n=== E. Update DB status ===')
    for deploy_id, name in [(AGROMED_ID, 'agromed'), (TESTE_ID, 'teste')]:
        port = get_port_for_deploy(deploy_id)
        ec, http_out = run(ssh, f"curl -sS -o /dev/null -w '%{{http_code}}' --max-time 5 http://localhost:{port}/ 2>&1", timeout=15)
        status = 'ready' if '200' in http_out or '30' in http_out or '40' in http_out else 'error'
        run(ssh, f"cd {PROJECT_DIR} && sqlite3 db/custom.db \"UPDATE Deploy SET status='{status}', errorMessage=NULL WHERE id='{deploy_id}';\"", timeout=15)

    ssh.close()
    print('\n🎉 DONE!')


if __name__ == '__main__':
    main()
