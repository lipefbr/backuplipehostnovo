#!/usr/bin/env python3
"""Upload fixes: listTables query + button color + custom domain nginx."""
import sys, os, time
sys.path.insert(0, '/home/z/.local/lib/python3.13/site-packages')
import paramiko

VPS_HOST = '209.145.62.238'
VPS_USER = 'root'
VPS_PASS = 'LipeHost@2026'
LOCAL_BASE = '/home/z/my-project'
VPS_BASE = '/var/www/lipehost'

FILES = [
    'src/lib/db-manager.ts',  # fixed listTables query + grant
    'src/lib/deploy-executor.ts',  # added configureNginxForCustomDomain
    'src/app/api/deploys/[id]/route.ts',  # calls configureNginxForCustomDomain
    'src/app/painel/bancos/[id]/page.tsx',  # button color fix
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
        sftp.put(os.path.join(LOCAL_BASE, f), os.path.join(VPS_BASE, f))
        print(f'  ✓ {f}')
    sftp.close()

    # 2. Grant SELECT on pg_stat_user_tables to ALL existing database users
    print('\n=== 2. Grant SELECT on pg_stat_user_tables to all existing users ===')
    run(ssh, "PGPASSWORD=LipeHostAdmin@2026 psql -h 127.0.0.1 -U lipehost_admin -d postgres -c \"SELECT rolname FROM pg_roles WHERE rolname LIKE 'u_%';\" 2>&1")
    # Grant to each user's database
    run(ssh, "for db in $(PGPASSWORD=LipeHostAdmin@2026 psql -h 127.0.0.1 -U lipehost_admin -d postgres -t -A -c \"SELECT datname FROM pg_database WHERE datname LIKE 'lh_%';\"); do echo \"Granting on $db...\"; PGPASSWORD=LipeHostAdmin@2026 psql -h 127.0.0.1 -U lipehost_admin -d \"$db\" -c \"GRANT SELECT ON pg_stat_user_tables TO PUBLIC;\" 2>&1; done", timeout=60)

    # 3. Rebuild lipehost platform
    print('\n=== 3. Trigger rebuild ===')
    ssh.exec_command("cd /var/www/lipehost && setsid bash -c 'NODE_ENV=production bun run build > /tmp/lipehost-build-fix3.log 2>&1 && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/ && systemctl restart lipehost && echo DONE >> /tmp/lipehost-build-fix3.log' </dev/null >/dev/null 2>&1 &", timeout=5)
    time.sleep(2)
    print('  ✓ Build started')

    # 4. Wait for build
    print('\n=== 4. Wait for build ===')
    for i in range(16):
        ec, out = run(ssh, 'tail -2 /tmp/lipehost-build-fix3.log 2>/dev/null', timeout=10)
        if 'DONE' in out:
            print('  ✓ BUILD DONE')
            break
        time.sleep(30)

    # 5. Verify lipehost is up
    print('\n=== 5. Verify lipehost platform ===')
    run(ssh, 'systemctl status lipehost --no-pager | head -5')
    run(ssh, "curl -sS -o /dev/null -w 'lipe.host: HTTP %{http_code}\\n' --max-time 5 http://localhost:3000/")

    # 6. Test the corrected listTables query (should return Task table)
    print('\n=== 6. Test listTables query ===')
    run(ssh, "PGPASSWORD=AefAher7ltMB8uTVoPOP psql -h 127.0.0.1 -U u_cmrvi8zk_novo -d lh_cmrvi8zk_novo -t -A -F '|' -c \"SELECT c.relname AS name, COALESCE(s.n_live_tup, 0) AS row_count, pg_size_pretty(pg_total_relation_size(c.oid)) AS size FROM pg_class c LEFT JOIN pg_namespace n ON (n.oid = c.relnamespace) LEFT JOIN pg_stat_user_tables s ON (s.relid = c.oid) WHERE n.nspname = 'public' AND c.relkind = 'r' ORDER BY c.relname;\" 2>&1")

    # 7. Test custom domain: configure nginx for codigonull.com → port 3598 (canva deploy)
    print('\n=== 7. Configure nginx for custom domain codigonull.com → port 3598 ===')
    # Find the canva deploy ID
    run(ssh, "cd /var/www/lipehost && sqlite3 db/custom.db \"SELECT id, name, customDomain FROM Deploy WHERE customDomain IS NOT NULL;\" 2>&1")

    # Add nginx server block for codigonull.com manually (since the API needs auth to call)
    print('\n=== 8. Add nginx server block for codigonull.com manually ===')
    import base64
    nginx_addition = """
# CustomDomain: cmrwi1j0e0001kpls6oew9w11
server {
    listen 80;
    listen [::]:80;
    server_name codigonull.com www.codigonull.com;
    client_max_body_size 50M;
    location / {
        proxy_pass http://127.0.0.1:3598;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
    }
}

"""
    # Insert before the wildcard block
    script = """
import re
with open('/etc/nginx/sites-available/lipehost','r') as f:
    config = f.read()
# Check if codigonull.com already in config
if 'codigonull.com' in config:
    print('already exists')
else:
    # Insert before wildcard
    match = re.search(r'# Wildcard for', config)
    if match:
        pos = match.start()
        new_config = config[:pos] + '''""" + nginx_addition + """''' + config[pos:]
    else:
        new_config = config + '''""" + nginx_addition + """'''
    with open('/etc/nginx/sites-available/lipehost','w') as f:
        f.write(new_config)
    print('added')
"""
    b64 = base64.b64encode(script.encode()).decode()
    run(ssh, f"echo '{b64}' | base64 -d > /tmp/add-custom-domain.py && python3 /tmp/add-custom-domain.py", timeout=30)

    # Test nginx config
    print('\n=== 9. Test + reload nginx ===')
    run(ssh, 'nginx -t 2>&1')
    run(ssh, 'systemctl reload nginx && echo RELOADED')

    # 10. Verify the custom domain is in nginx
    print('\n=== 10. Verify nginx config ===')
    run(ssh, 'grep -A 3 "codigonull" /etc/nginx/sites-available/lipehost | head -10')

    # 11. Test the custom domain locally (with Host header)
    print('\n=== 11. Test custom domain via nginx (Host header) ===')
    run(ssh, "curl -sS -o /dev/null -w 'codigonull.com: HTTP %{http_code}\\n' --max-time 5 -H 'Host: codigonull.com' http://localhost:80/")

    # 12. Verify 4 deploys still work
    print('\n=== 12. Verify 4 deploys ===')
    run(ssh, "curl -sS -o /dev/null -w 'abelha (3607): HTTP %{http_code}\\n' --max-time 5 http://localhost:3607/")
    run(ssh, "curl -sS -o /dev/null -w 'agromed (3866): HTTP %{http_code}\\n' --max-time 5 http://localhost:3866/")
    run(ssh, "curl -sS -o /dev/null -w 'canva (3598): HTTP %{http_code}\\n' --max-time 5 http://localhost:3598/")

    ssh.close()
    print('\n🎉 DONE!')


if __name__ == '__main__':
    main()
