#!/usr/bin/env python3
"""Upload all renamed files to VPS + rebuild lipehost."""
import sys
sys.path.insert(0, '/home/z/.local/lib/python3.13/site-packages')
import paramiko, time, os

VPS_HOST = '209.145.62.238'
VPS_USER = 'root'
VPS_PASS = 'LipeHost@2026'
PROJECT_DIR = '/var/www/lipehost'

# All files changed in the rename commit
LOCAL_BASE = '/home/z/my-project'
VPS_BASE = PROJECT_DIR

FILES = [
    'src/app/admin/page.tsx',
    'src/app/api/chat/route.ts',
    'src/app/api/seed/route.ts',
    'src/app/globals.css',
    'src/app/layout.tsx',
    'src/app/login/page.tsx',
    'src/app/loja/[slug]/page.tsx',
    'src/app/loja/page.tsx',
    'src/app/painel/chat/page.tsx',
    'src/app/painel/suporte/page.tsx',
    'src/app/preview/[slug]/page.tsx',
    'src/components/footer.tsx',
    'src/components/loja/loja-catalog.tsx',
    'src/components/navbar.tsx',
    'src/components/painel/admin-shell.tsx',
    'src/components/painel/notifications-bell.tsx',
    'src/components/painel/painel-shell.tsx',
    'src/components/preview/preview-page-client.tsx',
    'src/components/sections/featured-systems.tsx',
    'src/components/sections/hero.tsx',
    'src/components/sections/servers.tsx',
    'src/components/sections/testimonials.tsx',
    'src/lib/content.ts',
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
        for line in err.rstrip().split('\n')[:3]:
            print(f'  ERR: {line}')
    print(f'  [exit {exit_code}]')
    return exit_code, out


def main():
    print(f'Connecting to {VPS_HOST}...')
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=15)
    print('✓ Connected')

    # 1. Upload all 23 files via SFTP
    print(f'\n=== 1. Upload {len(FILES)} files via SFTP ===')
    sftp = ssh.open_sftp()
    for f in FILES:
        local_path = os.path.join(LOCAL_BASE, f)
        remote_path = os.path.join(VPS_BASE, f)
        # Create remote dirs if needed
        remote_dir = os.path.dirname(remote_path)
        try:
            sftp.stat(remote_dir)
        except FileNotFoundError:
            # mkdir -p equivalent
            parts = remote_dir.split('/')
            cur = ''
            for p in parts[1:]:
                cur = cur + '/' + p
                try:
                    sftp.stat(cur)
                except FileNotFoundError:
                    try:
                        sftp.mkdir(cur)
                    except Exception:
                        pass
        sftp.put(local_path, remote_path)
        print(f'  ✓ {f}')
    sftp.close()

    # 2. Verify no LIPE.HOST remains in uploaded files (except SEO keyword)
    print('\n=== 2. Verify no LIPE.HOST in updated code (excluding SEO keyword) ===')
    run(ssh, f"grep -rn 'LIPE\\.HOST' {PROJECT_DIR}/src/ 2>/dev/null | grep -v 'LIPE HOST' | head -5", timeout=15)

    # 3. Trigger background rebuild
    print('\n=== 3. Trigger background rebuild ===')
    ssh.exec_command(f"cd {PROJECT_DIR} && setsid bash -c 'NODE_ENV=production bun run build > /tmp/lipehost-build-rename.log 2>&1 && systemctl restart lipehost && echo DONE >> /tmp/lipehost-build-rename.log' </dev/null >/dev/null 2>&1 &", timeout=5)
    time.sleep(2)
    print('  ✓ Build started')

    # 4. Poll for build completion
    print('\n=== 4. Wait for build to complete ===')
    for i in range(16):
        ec, out = run(ssh, 'tail -2 /tmp/lipehost-build-rename.log 2>/dev/null', timeout=10)
        if 'DONE' in out:
            print('  ✓ BUILD DONE')
            break
        time.sleep(30)

    # 5. Verify lipehost platform
    print('\n=== 5. Verify lipehost platform ===')
    run(ssh, 'curl -sS -o /dev/null -w "lipe.host: HTTP %{http_code}\\n" --max-time 5 http://localhost:3000/')

    # 6. Verify SEO metadata is updated — fetch the homepage and check title
    print('\n=== 6. Verify SEO metadata (title should contain LipeHost, not LIPE.HOST) ===')
    run(ssh, "curl -sS --max-time 5 http://localhost:3000/ | grep -oE '<title>[^<]+</title>' | head -1", timeout=15)
    run(ssh, "curl -sS --max-time 5 http://localhost:3000/ | grep -oE 'og:site_name\" content=\"[^\"]+\"' | head -1", timeout=15)

    # 7. Test public URL via Cloudflare
    print('\n=== 7. Test public URL ===')
    run(ssh, "curl -sS -o /dev/null -w 'public lipe.host: HTTP %{http_code}\\n' --max-time 10 https://lipe.host/")

    ssh.close()
    print('\n🎉 DONE! Site renomeado para LipeHost.')


if __name__ == '__main__':
    main()
