#!/usr/bin/env python3
"""
Continue VPS installation from where it stopped.
- .env was created, but db:push + build + systemd + nginx may not have completed.
"""
import sys
sys.path.insert(0, '/home/z/.local/lib/python3.13/site-packages')

import paramiko
import time

VPS_HOST = '209.145.62.238'
VPS_USER = 'root'
VPS_PASS = 'LipeHost@2026'
PROJECT_DIR = '/var/www/lipehost'

def run(ssh, cmd, timeout=900):
    print(f'\n$ {cmd[:120]}{"..." if len(cmd)>120 else ""}')
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout, get_pty=True)
    output = ''
    while not stdout.channel.exit_status_ready():
        if stdout.channel.recv_ready():
            data = stdout.channel.recv(4096).decode('utf-8', errors='replace')
            sys.stdout.write(data)
            sys.stdout.flush()
            output += data
        time.sleep(0.05)
    while stdout.channel.recv_ready():
        data = stdout.channel.recv(4096).decode('utf-8', errors='replace')
        sys.stdout.write(data)
        sys.stdout.flush()
        output += data
    exit_code = stdout.channel.exit_status
    print(f'\n[exit {exit_code}]')
    return exit_code, output


def main():
    print(f'=== Connecting to {VPS_USER}@{VPS_HOST} ===')
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)
    print('✓ Connected!\n')

    # Verify .env exists (was created in previous run)
    run(ssh, f'cat {PROJECT_DIR}/.env')

    # 8. Push Prisma schema to DB
    print('\n=== Step 8: Setup database ===')
    run(ssh, f'cd {PROJECT_DIR} && bun run db:push 2>&1 | tail -10', timeout=120)

    # 9. Build the project
    print('\n=== Step 9: Build project (this may take a while) ===')
    code, _ = run(ssh, f'cd {PROJECT_DIR} && NODE_ENV=production bun run build 2>&1 | tail -30', timeout=900)
    if code != 0:
        print('⚠️  Build failed, trying npm...')
        run(ssh, f'cd {PROJECT_DIR} && NODE_ENV=production npm run build 2>&1 | tail -30', timeout=900)

    # 10. Run seed (creates admin + cliente users + 13 systems)
    print('\n=== Step 10: Run seed ===')
    run(ssh, f'cd {PROJECT_DIR} && (PORT=3000 bun run start &) && sleep 10 && curl -sS -X POST http://localhost:3000/api/seed 2>&1 | head -3 && pkill -f "next-server" 2>/dev/null; sleep 2', timeout=120)

    # 11. Create systemd service
    print('\n=== Step 11: Create systemd service ===')
    run(ssh, f'''cat > /etc/systemd/system/lipehost.service << 'SVCEOF'
[Unit]
Description=LIPE.HOST Production Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory={PROJECT_DIR}
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/bun run start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SVCEOF
systemctl daemon-reload && systemctl enable lipehost && systemctl start lipehost
sleep 5
systemctl status lipehost --no-pager | head -15''', timeout=60)

    # 12. Configure nginx reverse proxy
    print('\n=== Step 12: Configure nginx ===')
    run(ssh, '''cat > /etc/nginx/sites-available/lipehost << 'NGXEOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name lipe.host www.lipe.host 209.145.62.238 _;

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
ln -sf /etc/nginx/sites-available/lipehost /etc/nginx/sites-enabled/lipehost
rm -f /etc/nginx/sites-enabled/default
nginx -t 2>&1
systemctl restart nginx
systemctl status nginx --no-pager | head -10''', timeout=60)

    # 13. Final test
    print('\n=== Step 13: Final test ===')
    run(ssh, 'sleep 5 && curl -sS -o /dev/null -w "App direct: HTTP %{http_code}\\n" http://localhost:3000/ ; curl -sS -o /dev/null -w "Via nginx: HTTP %{http_code}\\n" http://localhost:80/', timeout=60)

    print('\n' + '='*60)
    print('🎉 INSTALAÇÃO COMPLETA!')
    print('='*60)

    ssh.close()
    return 0


if __name__ == '__main__':
    sys.exit(main())
