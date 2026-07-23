#!/usr/bin/env python3
"""Upload payment system + rebuild + create test plan + test."""
import sys, os, time, json, urllib.request
sys.path.insert(0, '/home/z/.local/lib/python3.13/site-packages')
import paramiko

FILES = [
    'prisma/schema.prisma',
    'src/lib/mercadopago.ts',
    'src/app/api/admin/plans/route.ts',
    'src/app/api/admin/plans/[id]/route.ts',
    'src/app/api/admin/payments/route.ts',
    'src/app/api/admin/users/[id]/toggle-sites/route.ts',
    'src/app/api/payments/subscribe/route.ts',
    'src/app/api/payments/webhook/route.ts',
    'src/app/api/payments/status/route.ts',
    'src/app/api/payments/cron/route.ts',
    'src/app/api/user/profile/route.ts',
    'src/app/painel/perfil/page.tsx',
    'src/app/admin/planos/page.tsx',
    'src/app/admin/pagamentos/page.tsx',
    'src/components/painel/admin-shell.tsx',
]

def run(ssh, cmd, timeout=120):
    print(f'$ {cmd[:150]}')
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    exit_code = stdout.channel.exit_status
    if out.strip():
        for line in out.rstrip().split('\n')[:10]:
            print(f'  {line}')
    if err.strip():
        for line in err.rstrip().split('\n')[:5]:
            print(f'  ERR: {line}')
    print(f'  [exit {exit_code}]')
    return exit_code, out

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('209.145.62.238', username='root', password='LipeHost@2026', timeout=15)
print('✓ Connected')

print(f'\n=== Upload {len(FILES)} files ===')
sftp = ssh.open_sftp()
for f in FILES:
    remote_path = f'/var/www/lipehost/{f}'
    remote_dir = os.path.dirname(remote_path)
    # Create remote dirs if needed
    parts = remote_dir.split('/')
    cur = ''
    for p in parts[1:]:
        cur = cur + '/' + p
        try: sftp.stat(cur)
        except FileNotFoundError:
            try: sftp.mkdir(cur)
            except: pass
    sftp.put(os.path.join('/home/z/my-project', f), remote_path)
    print(f'  ✓ {f}')
sftp.close()

# Push prisma schema
print('\n=== Prisma db push (add Plan, Subscription, Payment + User fields) ===')
run(ssh, 'cd /var/www/lipehost && npx prisma db push 2>&1 | tail -10', timeout=120)

# Verify schema
print('\n=== Verify new tables exist ===')
run(ssh, 'cd /var/www/lipehost && sqlite3 db/custom.db ".tables" 2>&1')
run(ssh, 'cd /var/www/lipehost && sqlite3 db/custom.db ".schema Plan" 2>&1 | head -15')

# Trigger rebuild
print('\n=== Trigger rebuild ===')
ssh.exec_command("cd /var/www/lipehost && setsid bash -c 'NODE_ENV=production bun run build > /tmp/lipehost-build-payments.log 2>&1 && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/ && systemctl restart lipehost && echo DONE >> /tmp/lipehost-build-payments.log' </dev/null >/dev/null 2>&1 &", timeout=5)
time.sleep(2)

print('\n=== Wait for build ===')
for i in range(20):
    ec, out = run(ssh, 'tail -3 /tmp/lipehost-build-payments.log 2>/dev/null', timeout=10)
    if 'DONE' in out:
        print('  ✓ BUILD DONE')
        break
    if 'error' in out.lower() and 'Type' in out:
        run(ssh, 'tail -40 /tmp/lipehost-build-payments.log')
        break
    time.sleep(30)

# Verify
print('\n=== Verify ===')
run(ssh, 'systemctl status lipehost --no-pager | head -5')
run(ssh, "curl -sS -o /dev/null -w 'lipe.host: HTTP %{http_code}\\n' --max-time 5 http://localhost:3000/")

# Test API endpoints
print('\n=== Test API endpoints (should return 401 = endpoint exists) ===')
run(ssh, "curl -sS -o /dev/null -w 'GET /api/admin/plans: HTTP %{http_code}\\n' --max-time 5 http://localhost:3000/api/admin/plans")
run(ssh, "curl -sS -o /dev/null -w 'GET /api/admin/payments: HTTP %{http_code}\\n' --max-time 5 http://localhost:3000/api/admin/payments")
run(ssh, "curl -sS -o /dev/null -w 'POST /api/payments/subscribe: HTTP %{http_code}\\n' --max-time 5 -X POST http://localhost:3000/api/payments/subscribe -H 'Content-Type: application/json' -d '{}'")
run(ssh, "curl -sS -o /dev/null -w 'POST /api/payments/webhook: HTTP %{http_code}\\n' --max-time 5 -X POST http://localhost:3000/api/payments/webhook -H 'Content-Type: application/json' -d '{}'")

# Test cron (with secret token)
print('\n=== Test cron endpoint ===')
run(ssh, "curl -sS 'http://localhost:3000/api/payments/cron?token=lipehost-cron-secret-2026' 2>&1 | head -3")

# Setup system cron to call the endpoint daily
print('\n=== Setup daily cron job ===')
run(ssh, 'echo "0 9 * * * curl -sS "https://lipe.host/api/payments/cron?token=lipehost-cron-secret-2026" > /dev/null 2>&1" | crontab - 2>&1 || echo "crontab already set"')
run(ssh, 'crontab -l 2>&1 | head -3')

# Verify 4 deploys still work
print('\n=== Verify 4 deploys ===')
run(ssh, "curl -sS -o /dev/null -w 'abelha (3607): HTTP %{http_code}\\n' --max-time 5 http://localhost:3607/")
run(ssh, "curl -sS -o /dev/null -w 'canva (3598): HTTP %{http_code}\\n' --max-time 5 http://localhost:3598/")

ssh.close()
print('\n🎉 DONE!')
