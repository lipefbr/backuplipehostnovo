#!/usr/bin/env python3
"""
Update VPS deployment — pulls latest code, rebuilds, restarts service.
"""
import sys
sys.path.insert(0, '/home/z/.local/lib/python3.13/site-packages')

import paramiko
import time

VPS_HOST = '209.145.62.238'
VPS_USER = 'root'
VPS_PASS = 'LipeHost@2026'
PROJECT_DIR = '/var/www/lipehost'

def run(ssh, cmd, timeout=600):
    print(f'\n$ {cmd[:120]}{"..." if len(cmd)>120 else ""}')
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout, get_pty=True)
    while not stdout.channel.exit_status_ready():
        if stdout.channel.recv_ready():
            sys.stdout.write(stdout.channel.recv(4096).decode('utf-8', errors='replace'))
            sys.stdout.flush()
        time.sleep(0.05)
    while stdout.channel.recv_ready():
        sys.stdout.write(stdout.channel.recv(4096).decode('utf-8', errors='replace'))
    exit_code = stdout.channel.exit_status
    print(f'\n[exit {exit_code}]')
    return exit_code


def main():
    print(f'=== Connecting to {VPS_USER}@{VPS_HOST} ===')
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)
    print('✓ Connected!\n')

    # 1. Pull latest code
    print('=== Step 1: Pull latest code ===')
    run(ssh, f'cd {PROJECT_DIR} && git pull origin main 2>&1 | tail -5', timeout=120)

    # 2. Install any new deps
    print('\n=== Step 2: Install dependencies ===')
    run(ssh, f'cd {PROJECT_DIR} && bun install 2>&1 | tail -5', timeout=180)

    # 3. Push any schema changes
    print('\n=== Step 3: Update database schema ===')
    run(ssh, f'cd {PROJECT_DIR} && bun run db:push 2>&1 | tail -5', timeout=120)

    # 4. Rebuild
    print('\n=== Step 4: Rebuild project ===')
    run(ssh, f'cd {PROJECT_DIR} && NODE_ENV=production bun run build 2>&1 | tail -10', timeout=600)

    # 5. Restart service
    print('\n=== Step 5: Restart service ===')
    run(ssh, 'systemctl restart lipehost && sleep 3 && systemctl status lipehost --no-pager | head -10', timeout=60)

    # 6. Verify
    print('\n=== Step 6: Verify ===')
    run(ssh, 'curl -sS -o /dev/null -w "App: HTTP %{http_code}\\n" http://localhost:3000/ && curl -sS -o /dev/null -w "Nginx: HTTP %{http_code}\\n" http://localhost:80/', timeout=30)

    print('\n🎉 VPS ATUALIZADA!')
    ssh.close()
    return 0


if __name__ == '__main__':
    sys.exit(main())
