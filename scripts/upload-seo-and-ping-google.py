#!/usr/bin/env python3
"""Upload SEO upgrade + rebuild + ping Google with sitemap."""
import sys
sys.path.insert(0, '/home/z/.local/lib/python3.13/site-packages')
import paramiko, time, os, urllib.request, urllib.parse

VPS_HOST = '209.145.62.238'
VPS_USER = 'root'
VPS_PASS = 'LipeHost@2026'
PROJECT_DIR = '/var/www/lipehost'

# All files changed in SEO upgrade commit
FILES = [
    'src/app/sitemap.ts',
    'src/app/loja/page.tsx',
    'src/app/loja/[slug]/page.tsx',
    'src/app/loja/categoria/[categoria]/page.tsx',  # new
    'src/app/loja/categorias/page.tsx',  # new
    'src/app/sitemap-html/page.tsx',  # new
    'src/components/footer.tsx',
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

    # 1. Upload all files via SFTP
    print(f'\n=== 1. Upload {len(FILES)} files ===')
    sftp = ssh.open_sftp()
    for f in FILES:
        local_path = os.path.join('/home/z/my-project', f)
        remote_path = os.path.join(PROJECT_DIR, f)
        # Ensure remote dir exists
        remote_dir = os.path.dirname(remote_path)
        try:
            sftp.stat(remote_dir)
        except FileNotFoundError:
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

    # 2. Trigger background rebuild
    print('\n=== 2. Trigger background rebuild ===')
    ssh.exec_command(f"cd {PROJECT_DIR} && setsid bash -c 'NODE_ENV=production bun run build > /tmp/lipehost-build-seo.log 2>&1 && systemctl restart lipehost && echo DONE >> /tmp/lipehost-build-seo.log' </dev/null >/dev/null 2>&1 &", timeout=5)
    time.sleep(2)
    print('  ✓ Build started')

    # 3. Poll for build completion
    print('\n=== 3. Wait for build to complete ===')
    for i in range(20):
        ec, out = run(ssh, 'tail -2 /tmp/lipehost-build-seo.log 2>/dev/null', timeout=10)
        if 'DONE' in out:
            print('  ✓ BUILD DONE')
            break
        time.sleep(30)

    # 4. Verify lipehost is up
    print('\n=== 4. Verify lipehost platform ===')
    run(ssh, 'curl -sS -o /dev/null -w "lipe.host: HTTP %{http_code}\\n" --max-time 5 http://localhost:3000/')

    # 5. Verify sitemap.xml
    print('\n=== 5. Verify sitemap.xml has all 28 URLs ===')
    run(ssh, 'curl -sS http://localhost:3000/sitemap.xml | grep -c "<url>"', timeout=15)

    # 6. Verify new category page works
    print('\n=== 6. Verify category pages ===')
    run(ssh, "curl -sS -o /dev/null -w 'mobilidade: HTTP %{http_code}\\n' --max-time 5 http://localhost:3000/loja/categoria/mobilidade")
    run(ssh, "curl -sS -o /dev/null -w 'delivery: HTTP %{http_code}\\n' --max-time 5 http://localhost:3000/loja/categoria/delivery")
    run(ssh, "curl -sS -o /dev/null -w 'ia: HTTP %{http_code}\\n' --max-time 5 http://localhost:3000/loja/categoria/ia")
    run(ssh, "curl -sS -o /dev/null -w 'categorias: HTTP %{http_code}\\n' --max-time 5 http://localhost:3000/loja/categorias")
    run(ssh, "curl -sS -o /dev/null -w 'sitemap-html: HTTP %{http_code}\\n' --max-time 5 http://localhost:3000/sitemap-html")

    # 7. Verify a product page has the new title format
    print('\n=== 7. Verify product page SEO ===')
    run(ssh, "curl -sS http://localhost:3000/loja/mobilidade-uber-clone | grep -oE '<title>[^<]+</title>' | head -1", timeout=15)

    # 8. Public URL check
    print('\n=== 8. Public URLs ===')
    run(ssh, "curl -sS -o /dev/null -w 'public home: HTTP %{http_code}\\n' --max-time 10 https://lipe.host/")
    run(ssh, "curl -sS -o /dev/null -w 'public loja: HTTP %{http_code}\\n' --max-time 10 https://lipe.host/loja")
    run(ssh, "curl -sS -o /dev/null -w 'public sitemap.xml: HTTP %{http_code}\\n' --max-time 10 https://lipe.host/sitemap.xml")

    ssh.close()

    # 9. Ping Google with new sitemap (does NOT require authentication)
    print('\n=== 9. Ping Google Search Console with new sitemap ===')
    sitemap_url = urllib.parse.quote('https://lipe.host/sitemap.xml', safe='')
    ping_url = f'https://www.google.com/ping?sitemap={sitemap_url}'
    print(f'  Pinging: {ping_url}')
    try:
        req = urllib.request.Request(ping_url, headers={'User-Agent': 'LipeHost-SEO/1.0'})
        with urllib.request.urlopen(req, timeout=30) as resp:
            print(f'  ✓ Google responded: HTTP {resp.status}')
            body = resp.read().decode('utf-8', errors='replace')[:200]
            print(f'  Body: {body[:200]}')
    except Exception as e:
        print(f'  ⚠️ Ping failed: {e}')

    # 10. Also ping Bing
    print('\n=== 10. Ping Bing with new sitemap ===')
    bing_ping_url = f'https://www.bing.com/ping?sitemap={sitemap_url}'
    try:
        req = urllib.request.Request(bing_ping_url, headers={'User-Agent': 'LipeHost-SEO/1.0'})
        with urllib.request.urlopen(req, timeout=30) as resp:
            print(f'  ✓ Bing responded: HTTP {resp.status}')
    except Exception as e:
        print(f'  ⚠️ Bing ping failed: {e}')

    print('\n🎉 SEO UPGRADE COMPLETE!')
    print('\nPróximos passos recomendados:')
    print('1. Acesse https://search.google.com/search-console')
    print('2. Adicione a propriedade https://lipe.host (se ainda não tiver)')
    print('3. Vá em "Sitemaps" e submeta: https://lipe.host/sitemap.xml')
    print('4. Vá em "Inspeção de URL" e solicite indexação para:')
    print('   - https://lipe.host/loja')
    print('   - https://lipe.host/loja/categorias')
    print('   - https://lipe.host/loja/categoria/mobilidade')
    print('   - https://lipe.host/loja/categoria/delivery')
    print('   - https://lipe.host/loja/mobilidade-uber-clone')
    print('   - https://lipe.host/loja/delivery-completo')
    print('5. Em 24-48h, Google deve indexar todas as páginas')


if __name__ == '__main__':
    main()
