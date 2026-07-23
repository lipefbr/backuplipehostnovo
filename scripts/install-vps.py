#!/usr/bin/env python3
"""
Install LIPE.HOST on the user's VPS (lipe.host).
- Connects via SSH (paramiko)
- Installs Node.js, Bun, Git, nginx
- Clones the repo from GitHub
- Installs deps, builds, starts the app
- Configures nginx reverse proxy
"""
import sys
sys.path.insert(0, '/home/z/.local/lib/python3.13/site-packages')

import paramiko
import time

VPS_HOST = '209.145.62.238'
VPS_USER = 'root'
VPS_PASS = 'LipeHost@2026'
REPO_URL = 'https://github.com/lipefbr/novolandingoklipehost.git'
PROJECT_DIR = '/var/www/lipehost'

def run(ssh, cmd, timeout=300):
    """Run command, print output in real-time, return exit code."""
    print(f'\n$ {cmd}')
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout, get_pty=True)
    while not stdout.channel.exit_status_ready():
        if stdout.channel.recv_ready():
            data = stdout.channel.recv(4096).decode('utf-8', errors='replace')
            sys.stdout.write(data)
            sys.stdout.flush()
        if stdout.channel.recv_stderr_ready():
            data = stdout.channel.recv_stderr(4096).decode('utf-8', errors='replace')
            sys.stderr.write(data)
            sys.stderr.flush()
        time.sleep(0.1)
    # Drain remaining
    while stdout.channel.recv_ready():
        sys.stdout.write(stdout.channel.recv(4096).decode('utf-8', errors='replace'))
    while stdout.channel.recv_stderr_ready():
        sys.stderr.write(stdout.channel.recv_stderr(4096).decode('utf-8', errors='replace'))
    exit_code = stdout.channel.exit_status
    print(f'\n[exit {exit_code}]')
    return exit_code


def main():
    print(f'=== Connecting to {VPS_USER}@{VPS_HOST} ===')
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)
    except Exception as e:
        print(f'Connection failed: {e}')
        return 1

    print('✓ Connected!\n')

    # 1. Check OS + update packages
    print('=== Step 1: System update ===')
    run(ssh, 'cat /etc/os-release | head -3')
    run(ssh, 'apt-get update -y 2>&1 | tail -3', timeout=120)

    # 2. Install dependencies (Node.js 20 LTS, git, nginx, curl)
    print('\n=== Step 2: Install Node.js 20 LTS + nginx + git ===')
    run(ssh, 'apt-get install -y curl git nginx 2>&1 | tail -3', timeout=180)
    # Install Node.js 20 via NodeSource
    run(ssh, 'curl -fsSL https://deb.nodesource.com/setup_20.x | bash - 2>&1 | tail -3', timeout=120)
    run(ssh, 'apt-get install -y nodejs 2>&1 | tail -3', timeout=180)
    run(ssh, 'node --version && npm --version && nginx -v 2>&1')

    # 3. Install Bun (via npm — more reliable than curl in some environments)
    print('\n=== Step 3: Install Bun ===')
    run(ssh, 'npm install -g bun 2>&1 | tail -5', timeout=180)
    run(ssh, 'bun --version')

    # 4. Clean previous installation (user said "pode apagar tudo que ta la")
    print('\n=== Step 4: Clean previous installation ===')
    run(ssh, f'rm -rf {PROJECT_DIR}')
    run(ssh, 'rm -f /etc/nginx/sites-enabled/lipehost')
    run(ssh, 'systemctl stop lipehost 2>/dev/null; systemctl disable lipehost 2>/dev/null; rm -f /etc/systemd/system/lipehost.service', timeout=30)
    run(ssh, 'systemctl daemon-reload', timeout=30)

    # 5. Clone the repo
    print('\n=== Step 5: Clone repo ===')
    run(ssh, f'mkdir -p /var/www && cd /var/www && git clone {REPO_URL} lipehost 2>&1 | tail -5', timeout=120)
    run(ssh, f'ls {PROJECT_DIR}/ | head -10')

    # 6. Install dependencies
    print('\n=== Step 6: Install dependencies (bun install) ===')
    run(ssh, f'cd {PROJECT_DIR} && bun install 2>&1 | tail -10', timeout=300)

    # 7. Setup .env
    print('\n=== Step 7: Configure .env ===')
    run(ssh, f'''cd {PROJECT_DIR} && cat > .env << 'EOF'
DATABASE_URL=file:/var/www/lipehost/db/custom.db
NEXTAUTH_SECRET=lipehost-vps-production-secret-$(openssl rand -hex 16)
NEXTAUTH_URL=http://lipe.host
PORT=3000
NODE_ENV=production
EOF
cat .env''', timeout=30)

    # 8. Push Prisma schema to DB
    print('\n=== Step 8: Setup database ===')
    run(ssh, f'cd {PROJECT_DIR} && bun run db:push 2>&1 | tail -10', timeout=120)

    # 9. Build the project
    print('\n=== Step 9: Build project (this may take a while) ===')
    run(ssh, f'cd {PROJECT_DIR} && NODE_ENV=production bun run build 2>&1 | tail -20', timeout=600)

    # 10. Run seed (creates admin + cliente users + 13 systems)
    print('\n=== Step 10: Run seed ===')
    run(ssh, f'cd {PROJECT_DIR} && (bun run start &); sleep 8 && curl -sS -X POST http://localhost:3000/api/seed 2>&1 | head -3; pkill -f "next-server" 2>/dev/null; pkill -f "bun" 2>/dev/null', timeout=60)

    # 11. Create systemd service
    print('\n=== Step 11: Create systemd service ===')
    run(ssh, f'''cat > /etc/systemd/system/lipehost.service << 'EOF'
[Unit]
Description=LIPE.HOST Production Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory={PROJECT_DIR}
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ExecStart=/usr/bin/bun run start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload && systemctl enable lipehost && systemctl start lipehost
sleep 3
systemctl status lipehost --no-pager | head -15''', timeout=60)

    # 12. Configure nginx reverse proxy
    print('\n=== Step 12: Configure nginx ===')
    run(ssh, '''cat > /etc/nginx/sites-available/lipehost << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name lipe.host www.lipe.host 209.145.62.238;

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
EOF
ln -sf /etc/nginx/sites-available/lipehost /etc/nginx/sites-enabled/lipehost
rm -f /etc/nginx/sites-enabled/default
nginx -t 2>&1
systemctl restart nginx
systemctl status nginx --no-pager | head -10''', timeout=60)

    # 13. Final test
    print('\n=== Step 13: Final test ===')
    run(ssh, 'sleep 3 && curl -sS -o /dev/null -w "HTTP %{http_code}\\n" http://localhost:3000/ && curl -sS -o /dev/null -w "HTTP %{http_code} (via nginx)\\n" http://localhost:80/', timeout=30)

    print('\n' + '='*60)
    print('🎉 INSTALAÇÃO COMPLETA!')
    print('='*60)
    print(f'''
Site:        http://lipe.host  (ou http://209.145.62.238)
Login:       http://lipe.host/login

Credenciais:
  👑 Admin:    admin@lipe.host / admin123
  👤 Cliente:  cliente@lipe.host / cliente123

Comandos úteis na VPS:
  systemctl status lipehost     # ver status
  systemctl restart lipehost    # reiniciar
  journalctl -u lipehost -f     # logs em tempo real
  cd /var/www/lipehost          # diretorio do projeto

Próximos passos:
  1. Aponte o DNS do lipe.host para 209.145.62.238 (se ainda não fez)
  2. Instale SSL gratuito: certbot --nginx -d lipe.host -d www.lipe.host
  3. Acesse http://lipe.host e faça login!
''')

    ssh.close()
    return 0


if __name__ == '__main__':
    sys.exit(main())
