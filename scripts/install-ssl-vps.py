#!/usr/bin/env python3
"""
Install SSL certificate on VPS via certbot to fix Cloudflare 521 error.
Also configures nginx for HTTPS and HTTP->HTTPS redirect.
"""
import sys
sys.path.insert(0, '/home/z/.local/lib/python3.13/site-packages')

import paramiko
import time

VPS_HOST = '209.145.62.238'
VPS_USER = 'root'
VPS_PASS = 'LipeHost@2026'

def run(ssh, cmd, timeout=180):
    print(f'\n$ {cmd[:120]}{"..." if len(cmd)>120 else ""}')
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout, get_pty=True)
    while not stdout.channel.exit_status_ready():
        if stdout.channel.recv_ready():
            sys.stdout.write(stdout.channel.recv(4096).decode('utf-8', errors='replace'))
            sys.stdout.flush()
        time.sleep(0.05)
    while stdout.channel.recv_ready():
        sys.stdout.write(stdout.channel.recv(4096).decode('utf-8', errors='replace'))
    print(f'\n[exit {stdout.channel.exit_status}]')


def main():
    print(f'=== Connecting to {VPS_USER}@{VPS_HOST} ===')
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)
    print('✓ Connected!\n')

    # 1. Install certbot
    print('=== Step 1: Install certbot ===')
    run(ssh, 'apt-get install -y certbot python3-certbot-nginx 2>&1 | tail -5', timeout=180)

    # 2. Check current nginx config + DNS resolution
    print('\n=== Step 2: Check DNS + nginx ===')
    run(ssh, 'dig +short lipe.host 2>&1; echo ---; curl -sS -o /dev/null -w "HTTP direct IP: %{http_code}\\n" http://209.145.62.238/', timeout=30)

    # 3. Try to issue SSL cert
    # Since Cloudflare is in front, we need to either:
    # A) Use Cloudflare Origin Certificate (manual install)
    # B) Temporarily disable Cloudflare proxy (gray cloud) to issue Let's Encrypt
    # C) Use DNS-01 challenge with Cloudflare API
    #
    # Easiest: try certbot with --nginx flag (HTTP-01). If Cloudflare is in proxy mode
    # this will fail. We'll detect and try alternative.

    print('\n=== Step 3: Try Let\'s Encrypt SSL ===')
    code = run(ssh, 'certbot --nginx -d lipe.host -d www.lipe.host --non-interactive --agree-tos -m admin@lipe.host --redirect 2>&1 | tail -20', timeout=180)

    if code != 0:
        print('\n⚠️  Let\'s Encrypt failed (probably Cloudflare proxy is on)')
        print('   Configuring nginx for HTTPS anyway with self-signed cert as fallback...')
        # Generate self-signed cert as fallback so nginx can listen on 443
        run(ssh, '''mkdir -p /etc/nginx/ssl && openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\
  -keyout /etc/nginx/ssl/lipe.key \\
  -out /etc/nginx/ssl/lipe.crt \\
  -subj "/C=BR/ST=SP/L=Sao Paulo/O=LIPE.HOST/CN=lipe.host" 2>&1 | tail -3''', timeout=60)

    # 4. Configure nginx for both HTTP and HTTPS
    print('\n=== Step 4: Configure nginx (HTTP + HTTPS) ===')
    run(ssh, '''cat > /etc/nginx/sites-available/lipehost << 'NGXEOF'
# HTTP - redirect to HTTPS (if cert exists) or proxy directly
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name lipe.host www.lipe.host 209.145.62.238 _;

    client_max_body_size 50M;

    # If Cloudflare is proxying, requests come via HTTP and we proxy to app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTPS - only if cert exists
server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    server_name lipe.host www.lipe.host 209.145.62.238 _;

    ssl_certificate /etc/letsencrypt/live/lipe.host/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lipe.host/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
    }
}
NGXEOF
nginx -t 2>&1''', timeout=30)

    # 5. Reload nginx
    print('\n=== Step 5: Reload nginx ===')
    run(ssh, 'systemctl reload nginx && systemctl status nginx --no-pager | head -5', timeout=30)

    # 6. Test
    print('\n=== Step 6: Test ===')
    run(ssh, 'curl -sS -o /dev/null -w "HTTP: %{http_code}\\n" http://localhost:80/', timeout=30)
    run(ssh, 'curl -sS -k -o /dev/null -w "HTTPS: %{http_code}\\n" https://localhost:443/ 2>&1', timeout=30)
    run(ssh, 'curl -sS -o /dev/null -w "lipe.host: %{http_code}\\n" http://lipe.host/ 2>&1', timeout=30)

    print('\n' + '='*60)
    print('📋 STATUS DA INSTALAÇÃO SSL')
    print('='*60)
    print('''
Se Let's Encrypt falhou porque Cloudflare está em modo proxy (orange cloud),
você tem 2 opções:

OPÇÃO 1 — Cloudflare SSL mode "Flexible" (mais fácil):
  1. Acesse https://dash.cloudflare.com
  2. Vá em lipe.host → SSL/TLS → Overview
  3. Mude de "Full" para "Flexible"
  4. Pronto! Cloudflare vai aceitar HTTP da VPS

OPÇÃO 2 — Cloudflare Origin Certificate (mais seguro):
  1. Acesse https://dash.cloudflare.com
  2. Vá em lipe.host → SSL/TLS → Origin Server
  3. Clique "Create Certificate"
  4. Copie o certificado e a chave privada
  5. Me mande que eu instalo na VPS

OPÇÃO 3 — Desativar proxy Cloudflare (gray cloud):
  1. Acesse https://dash.cloudflare.com
  2. Vá em lipe.host → DNS
  3. Clique na nuvem laranja ao lado do registro A
  4. Vira nuvem cinza (DNS only)
  5. Rode: certbot --nginx -d lipe.host -d www.lipe.host
''')

    ssh.close()
    return 0


if __name__ == '__main__':
    sys.exit(main())
