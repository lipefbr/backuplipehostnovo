#!/usr/bin/env python3
"""Upload database detail page + APIs + rebuild + test."""
import sys, os, time
sys.path.insert(0, '/home/z/.local/lib/python3.13/site-packages')
import paramiko

VPS_HOST = '209.145.62.238'
VPS_USER = 'root'
VPS_PASS = 'LipeHost@2026'
LOCAL_BASE = '/home/z/my-project'
VPS_BASE = '/var/www/lipehost'

FILES = [
    'src/lib/db-manager.ts',  # updated
    'src/app/api/databases/route.ts',  # updated
    'src/app/api/databases/[id]/route.ts',  # updated
    'src/app/api/databases/[id]/tables/route.ts',  # new
    'src/app/api/databases/[id]/query/route.ts',  # new
    'src/app/api/databases/[id]/export/route.ts',  # new
    'src/app/api/databases/[id]/import/route.ts',  # new
    'src/app/painel/bancos/page.tsx',  # updated
    'src/app/painel/bancos/[id]/page.tsx',  # new
]


def ensure_remote_dir(sftp, remote_path):
    parts = remote_path.split('/')
    cur = ''
    for p in parts[1:]:
        cur = cur + '/' + p
        try: sftp.stat(cur)
        except FileNotFoundError:
            try: sftp.mkdir(cur)
            except: pass


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
        remote_dir = os.path.dirname(remote_path)
        ensure_remote_dir(sftp, remote_dir)
        sftp.put(local_path, remote_path)
        print(f'  ✓ {f}')
    sftp.close()

    # 2. Rebuild lipehost platform
    print('\n=== 2. Trigger rebuild ===')
    ssh.exec_command("cd /var/www/lipehost && setsid bash -c 'NODE_ENV=production bun run build > /tmp/lipehost-build-db2.log 2>&1 && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/ && systemctl restart lipehost && echo DONE >> /tmp/lipehost-build-db2.log' </dev/null >/dev/null 2>&1 &", timeout=5)
    time.sleep(2)
    print('  ✓ Build started')

    # 3. Wait for build
    print('\n=== 3. Wait for build ===')
    for i in range(16):
        ec, out = run(ssh, 'tail -2 /tmp/lipehost-build-db2.log 2>/dev/null', timeout=10)
        if 'DONE' in out:
            print('  ✓ BUILD DONE')
            break
        time.sleep(30)

    # 4. Verify lipehost is up
    print('\n=== 4. Verify lipehost platform ===')
    run(ssh, 'systemctl status lipehost --no-pager | head -5')
    run(ssh, "curl -sS -o /dev/null -w 'lipe.host: HTTP %{http_code}\\n' --max-time 5 http://localhost:3000/")

    # 5. Test API endpoints exist
    print('\n=== 5. Test API endpoints (should return 401 = endpoint exists) ===')
    run(ssh, "curl -sS -o /dev/null -w 'GET /api/databases: HTTP %{http_code}\\n' --max-time 5 http://localhost:3000/api/databases")
    run(ssh, "curl -sS -o /dev/null -w 'GET /api/databases/x/tables: HTTP %{http_code}\\n' --max-time 5 http://localhost:3000/api/databases/x/tables")
    run(ssh, "curl -sS -o /dev/null -w 'GET /api/databases/x/export: HTTP %{http_code}\\n' --max-time 5 http://localhost:3000/api/databases/x/export")

    # 6. Test direct DB access to confirm PostgreSQL is accessible
    print('\n=== 6. Test PostgreSQL external connection (using VPS public IP) ===')
    run(ssh, "PGPASSWORD=AefAher7ltMB8uTVoPOP psql -h 209.145.62.238 -U u_cmrvi8zk_novo -d lh_cmrvi8zk_novo -c 'SELECT current_user, current_database();' 2>&1")

    # 7. Test creating a table + inserting + querying (to verify listTables works)
    print('\n=== 7. Test creating table + inserting data ===')
    run(ssh, "PGPASSWORD=AefAher7ltMB8uTVoPOP psql -h 127.0.0.1 -U u_cmrvi8zk_novo -d lh_cmrvi8zk_novo -c 'CREATE TABLE IF NOT EXISTS test_users (id SERIAL PRIMARY KEY, name TEXT, email TEXT);' 2>&1")
    run(ssh, "PGPASSWORD=AefAher7ltMB8uTVoPOP psql -h 127.0.0.1 -U u_cmrvi8zk_novo -d lh_cmrvi8zk_novo -c \"INSERT INTO test_users (name, email) VALUES ('João', 'joao@test.com'), ('Maria', 'maria@test.com');\" 2>&1")
    run(ssh, "PGPASSWORD=AefAher7ltMB8uTVoPOP psql -h 127.0.0.1 -U u_cmrvi8zk_novo -d lh_cmrvi8zk_novo -c 'SELECT * FROM test_users;' 2>&1")

    # 8. Verify 4 deploys still work
    print('\n=== 8. Verify 4 deploys ===')
    run(ssh, "curl -sS -o /dev/null -w 'abelha (3607): HTTP %{http_code}\\n' --max-time 5 http://localhost:3607/")
    run(ssh, "curl -sS -o /dev/null -w 'agromed (3866): HTTP %{http_code}\\n' --max-time 5 http://localhost:3866/")
    run(ssh, "curl -sS -o /dev/null -w 'canva (3598): HTTP %{http_code}\\n' --max-time 5 http://localhost:3598/")
    run(ssh, "curl -sS -o /dev/null -w 'teste (3308): HTTP %{http_code}\\n' --max-time 5 http://localhost:3308/")

    ssh.close()
    print('\n🎉 DONE! Interface tipo Neon.tech implementada.')


if __name__ == '__main__':
    main()
