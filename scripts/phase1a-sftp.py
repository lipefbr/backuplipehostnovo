#!/usr/bin/env python3
"""Phase 1a: Apply fix via SFTP, commit, push to GitHub from VPS."""
import sys
sys.path.insert(0, '/home/z/.local/lib/python3.13/site-packages')
import paramiko, time

VPS_HOST = '209.145.62.238'
VPS_USER = 'root'
VPS_PASS = 'LipeHost@2026'
PROJECT_DIR = '/var/www/lipehost'

def run(ssh, cmd, timeout=120):
    print(f'$ {cmd[:200]}')
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout, get_pty=True)
    out = []
    while not stdout.channel.exit_status_ready():
        if stdout.channel.recv_ready():
            chunk = stdout.channel.recv(4096).decode('utf-8', errors='replace')
            out.append(chunk)
            sys.stdout.write(chunk)
            sys.stdout.flush()
        time.sleep(0.05)
    while stdout.channel.recv_ready():
        chunk = stdout.channel.recv(4096).decode('utf-8', errors='replace')
        out.append(chunk)
        sys.stdout.write(chunk)
    exit_code = stdout.channel.exit_status
    print(f'[exit {exit_code}]')
    return exit_code, ''.join(out)


def main():
    print(f'Connecting to {VPS_HOST}...')
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)
    print('✓ Connected')

    # Use SFTP to upload the file directly
    print('\nUploading deploy-executor.ts via SFTP...')
    sftp = ssh.open_sftp()
    sftp.put('/home/z/my-project/src/lib/deploy-executor.ts', f'{PROJECT_DIR}/src/lib/deploy-executor.ts')
    sftp.close()
    print('✓ Uploaded')

    # Verify
    run(ssh, f"wc -l {PROJECT_DIR}/src/lib/deploy-executor.ts && grep -c 'ROBUST STANDALONE DETECTION' {PROJECT_DIR}/src/lib/deploy-executor.ts && grep -c 'WRAPPER SCRIPT' {PROJECT_DIR}/src/lib/deploy-executor.ts", timeout=15)

    # Commit + push
    print('\n--- git commit ---')
    run(ssh, f"cd {PROJECT_DIR} && git add -A && git commit -m 'fix(deploy): robust standalone + wrapper script - any Next.js project deploys automatically'", timeout=30)
    print('\n--- git push ---')
    run(ssh, f"cd {PROJECT_DIR} && git push origin main 2>&1 | tail -8", timeout=60)

    # Trigger rebuild in background (nohup) — so we don't block
    print('\n--- Triggering background rebuild ---')
    run(ssh, f"cd {PROJECT_DIR} && nohup bash -c 'NODE_ENV=production bun run build > /tmp/lipehost-build.log 2>&1 && systemctl restart lipehost && echo DONE >> /tmp/lipehost-build.log' &", timeout=10)

    print('\n✅ Fix applied + pushed. Rebuild running in background on VPS.')
    print('Monitor with: ssh root@209.145.62.238 "tail -f /tmp/lipehost-build.log"')
    ssh.close()


if __name__ == '__main__':
    main()
