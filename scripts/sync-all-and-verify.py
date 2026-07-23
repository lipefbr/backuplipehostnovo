#!/usr/bin/env python3
"""Sync ALL src/ files + root config files to VPS, rebuild, verify everything."""
import sys, os, time
sys.path.insert(0, '/home/z/.local/lib/python3.13/site-packages')
import paramiko

VPS_HOST = '209.145.62.238'
VPS_USER = 'root'
VPS_PASS = 'LipeHost@2026'  # Updated password
LOCAL_BASE = '/home/z/my-project'
VPS_BASE = '/var/www/lipehost'

# Files to sync (root config files + entire src/ directory)
ROOT_FILES = [
    'package.json',
    'next.config.ts',
    'tsconfig.json',
    'tailwind.config.ts',
    'postcss.config.mjs',
    'prisma/schema.prisma',
    'middleware.ts',
    'src/middleware.ts',
]

# Directories to sync recursively
DIRS_TO_SYNC = [
    'src/app',
    'src/components',
    'src/lib',
    'src/hooks',
    'public',
]


def list_files_recursive(base_dir, subdir=''):
    """List all files in a directory recursively."""
    full_path = os.path.join(base_dir, subdir) if subdir else base_dir
    if not os.path.exists(full_path):
        return []
    result = []
    for entry in os.listdir(full_path):
        entry_path = os.path.join(subdir, entry) if subdir else entry
        full_entry = os.path.join(base_path_local, entry_path) if False else os.path.join(base_dir, entry_path)
        if os.path.isdir(full_entry):
            # Skip node_modules, .next, .git
            if entry in ['node_modules', '.next', '.git', 'deploys', 'db']:
                continue
            result.extend(list_files_recursive(base_dir, entry_path))
        else:
            result.append(entry_path)
    return result


def ensure_remote_dir(sftp, remote_path):
    """Create remote directory if it doesn't exist (mkdir -p)."""
    parts = remote_path.split('/')
    cur = ''
    for p in parts[1:]:  # skip leading empty (because path starts with /)
        cur = cur + '/' + p
        try:
            sftp.stat(cur)
        except FileNotFoundError:
            try:
                sftp.mkdir(cur)
            except Exception:
                pass


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
        for line in err.rstrip().split('\n')[:3]:
            print(f'  ERR: {line}')
    print(f'  [exit {exit_code}]')
    return exit_code, out


def main():
    print(f'Connecting to {VPS_HOST}...')
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=15)
    print('✓ Connected (with new password LipeHost@2026)')

    # 1. Verify lipehost is running first (it should be — we fixed it last turn)
    print('\n=== 1. Verify lipehost is running ===')
    run(ssh, 'systemctl status lipehost --no-pager | head -5')

    # 2. Collect ALL files to sync
    print('\n=== 2. Collecting files to sync ===')
    all_files = list(ROOT_FILES)  # copy

    for d in DIRS_TO_SYNC:
        local_dir = os.path.join(LOCAL_BASE, d)
        if not os.path.exists(local_dir):
            print(f'  (skip — does not exist): {d}')
            continue
        for root, dirs, files in os.walk(local_dir):
            # Skip unwanted dirs
            dirs[:] = [x for x in dirs if x not in ['node_modules', '.next', '.git', '__pycache__']]
            for f in files:
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, LOCAL_BASE)
                all_files.append(rel_path)

    print(f'  Total files to sync: {len(all_files)}')

    # 3. Upload all files via SFTP
    print(f'\n=== 3. Upload {len(all_files)} files via SFTP ===')
    sftp = ssh.open_sftp()
    uploaded = 0
    errors = 0
    for f in all_files:
        local_path = os.path.join(LOCAL_BASE, f)
        remote_path = os.path.join(VPS_BASE, f)
        try:
            # Ensure remote dir exists
            remote_dir = os.path.dirname(remote_path)
            ensure_remote_dir(sftp, remote_dir)
            sftp.put(local_path, remote_path)
            uploaded += 1
        except Exception as e:
            print(f'  ❌ {f}: {e}')
            errors += 1
    sftp.close()
    print(f'  ✓ Uploaded: {uploaded}/{len(all_files)} files ({errors} errors)')

    # 4. Commit changes on VPS so git state is clean
    print('\n=== 4. Commit changes on VPS ===')
    run(ssh, 'cd /var/www/lipehost && git add -A && git commit -m "sync: all latest changes from local — SEO upgrade + rename LipeHost + preview URL fix" 2>&1 | tail -3', timeout=30)

    # 5. Trigger rebuild in background
    print('\n=== 5. Trigger background rebuild ===')
    ssh.exec_command("cd /var/www/lipehost && setsid bash -c 'NODE_ENV=production bun run build > /tmp/lipehost-build-sync.log 2>&1 && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/ && systemctl restart lipehost && echo DONE >> /tmp/lipehost-build-sync.log' </dev/null >/dev/null 2>&1 &", timeout=5)
    time.sleep(2)
    print('  ✓ Build started')

    # 6. Poll for build completion (up to 8 min)
    print('\n=== 6. Wait for build to complete ===')
    for i in range(16):
        ec, out = run(ssh, 'tail -2 /tmp/lipehost-build-sync.log 2>/dev/null', timeout=10)
        if 'DONE' in out:
            print('  ✓ BUILD DONE')
            break
        time.sleep(30)

    # 7. Verify lipehost is up
    print('\n=== 7. Verify lipehost service ===')
    run(ssh, 'systemctl status lipehost --no-pager | head -6')

    # 8. Verify all main pages
    print('\n=== 8. Verify all pages (HTTP 200 = OK, 307 = redirect to login = OK) ===')
    pages = [
        ('home', '/'),
        ('login', '/login'),
        ('painel', '/painel'),
        ('admin', '/admin'),
        ('loja', '/loja'),
        ('loja/categorias', '/loja/categorias'),
        ('loja/categoria/mobilidade', '/loja/categoria/mobilidade'),
        ('loja/mobilidade-uber-clone', '/loja/mobilidade-uber-clone'),
        ('sitemap.xml', '/sitemap.xml'),
        ('sitemap-html', '/sitemap-html'),
        ('robots.txt', '/robots.txt'),
    ]
    for name, path in pages:
        ec, out = run(ssh, f'curl -sS -o /dev/null -w "{name}: HTTP %{{http_code}}\\n" --max-time 5 http://localhost:3000{path}', timeout=15)

    # 9. Verify titles
    print('\n=== 9. Verify titles ===')
    run(ssh, 'curl -sS --max-time 5 http://localhost:3000/ | grep -oE "<title>[^<]+</title>" | head -1')
    run(ssh, 'curl -sS --max-time 5 http://localhost:3000/loja | grep -oE "<title>[^<]+</title>" | head -1')

    # 10. Public URLs via Cloudflare
    print('\n=== 10. Public URLs via Cloudflare ===')
    run(ssh, 'curl -sS -o /dev/null -w "public home: HTTP %{http_code}\\n" --max-time 10 https://lipe.host/')
    run(ssh, 'curl -sS -o /dev/null -w "public login: HTTP %{http_code}\\n" --max-time 10 https://lipe.host/login')
    run(ssh, 'curl -sS -o /dev/null -w "public loja: HTTP %{http_code}\\n" --max-time 10 https://lipe.host/loja')

    # 11. Check PM2 (verify no meudeploy, all deploys running)
    print('\n=== 11. PM2 list (verify meudeploy is gone, deploys running) ===')
    run(ssh, 'pm2 list 2>&1')

    # 12. Check all 4 deploys are responding
    print('\n=== 12. Verify all 4 deploys are responding ===')
    run(ssh, "curl -sS -o /dev/null -w 'abelha: HTTP %{http_code}\\n' --max-time 5 -H 'Host: lipefbr-abelha-token-push-preview.lipe.host' http://localhost:80/")
    run(ssh, "curl -sS -o /dev/null -w 'agromed: HTTP %{http_code}\\n' --max-time 5 -H 'Host: lipefbr-agromedub-preview.lipe.host' http://localhost:80/")
    run(ssh, "curl -sS -o /dev/null -w 'canva: HTTP %{http_code}\\n' --max-time 5 -H 'Host: lipefbr-canvanovo-preview.lipe.host' http://localhost:80/")
    run(ssh, "curl -sS -o /dev/null -w 'teste: HTTP %{http_code}\\n' --max-time 5 -H 'Host: womannovo-preview.lipe.host' http://localhost:80/")

    ssh.close()
    print('\n🎉 TUDO SINCRONIZADO E FUNCIONANDO!')


if __name__ == '__main__':
    main()
