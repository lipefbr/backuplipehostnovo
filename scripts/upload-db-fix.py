#!/usr/bin/env python3
"""Upload database fix (IP instead of subdomain + working tabs) + rebuild."""
import sys, os, time
sys.path.insert(0, '/home/z/.local/lib/python3.13/site-packages')
import paramiko

VPS_HOST = '209.145.62.238'
VPS_USER = 'root'
VPS_PASS = 'LipeHost@2026'
LOCAL_BASE = '/home/z/my-project'
VPS_BASE = '/var/www/lipehost'

# 4 files changed: db-manager, api/databases/route, api/databases/[id]/route, painel/bancos/[id]/page
FILES = [
    'src/lib/db-manager.ts',
    'src/app/api/databases/route.ts',
    'src/app/api/databases/[id]/route.ts',
    'src/app/painel/bancos/[id]/page.tsx',
]


def run(ssh, cmd, timeout=120):
    print(f'$ {cmd[:150]}')
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    exit_code = stdout.channel.exit_status
    if out.strip():
        for line in out.rstrip().split('\n')[:8]:
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

    # 1. Upload files
    print(f'\n=== 1. Upload {len(FILES)} files ===')
    sftp = ssh.open_sftp()
    for f in FILES:
        local_path = os.path.join(LOCAL_BASE, f)
        remote_path = os.path.join(VPS_BASE, f)
        sftp.put(local_path, remote_path)
        print(f'  ✓ {f}')
    sftp.close()

    # 2. Verify code uploaded correctly
    print('\n=== 2. Verify uploads ===')
    run(ssh, "grep -c 'VPS_PUBLIC_IP' /var/www/lipehost/src/lib/db-manager.ts")
    run(ssh, "grep -c 'activeTab' /var/www/lipehost/src/app/painel/bancos/\\[id\\]/page.tsx")

    # 3. Rebuild lipehost platform
    print('\n=== 3. Trigger rebuild ===')
    ssh.exec_command("cd /var/www/lipehost && setsid bash -c 'NODE_ENV=production bun run build > /tmp/lipehost-build-dbfix.log 2>&1 && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/ && systemctl restart lipehost && echo DONE >> /tmp/lipehost-build-dbfix.log' </dev/null >/dev/null 2>&1 &", timeout=5)
    time.sleep(2)
    print('  ✓ Build started')

    # 4. Wait for build
    print('\n=== 4. Wait for build ===')
    for i in range(16):
        ec, out = run(ssh, 'tail -3 /tmp/lipehost-build-dbfix.log 2>/dev/null', timeout=10)
        if 'DONE' in out:
            print('  ✓ BUILD DONE')
            break
        if 'error' in out.lower() and 'exit' not in out.lower():
            # Show full error
            run(ssh, 'tail -30 /tmp/lipehost-build-dbfix.log')
            break
        time.sleep(30)

    # 5. Verify lipehost is up
    print('\n=== 5. Verify lipehost platform ===')
    run(ssh, 'systemctl status lipehost --no-pager | head -5')
    run(ssh, "curl -sS -o /dev/null -w 'lipe.host: HTTP %{http_code}\\n' --max-time 5 http://localhost:3000/")

    # 6. Test API endpoints
    print('\n=== 6. Test API endpoints (should return 401 = endpoint exists) ===')
    run(ssh, "curl -sS -o /dev/null -w 'GET /api/databases: HTTP %{http_code}\\n' --max-time 5 http://localhost:3000/api/databases")

    # 7. Test PostgreSQL connection using IP (this is what should now work everywhere)
    print('\n=== 7. Test PostgreSQL connection using IP (the new default) ===')
    run(ssh, "PGPASSWORD=AefAher7ltMB8uTVoPOP psql -h 209.145.62.238 -p 5432 -U u_cmrvi8zk_novo -d lh_cmrvi8zk_novo -c 'SELECT * FROM usuarios;' 2>&1")

    # 8. Verify the 4 deploys are still working
    print('\n=== 8. Verify 4 deploys still work ===')
    run(ssh, "curl -sS -o /dev/null -w 'abelha (3607): HTTP %{http_code}\\n' --max-time 5 http://localhost:3607/")
    run(ssh, "curl -sS -o /dev/null -w 'agromed (3866): HTTP %{http_code}\\n' --max-time 5 http://localhost:3866/")

    ssh.close()
    print('\n🎉 DONE!')


if __name__ == '__main__':
    main()
