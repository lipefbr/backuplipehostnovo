#!/usr/bin/env python3
"""Phase 1: SFTP fix, commit, push, trigger background rebuild."""
import sys
sys.path.insert(0, '/home/z/.local/lib/python3.13/site-packages')
import paramiko, time

VPS_HOST = '209.145.62.238'
VPS_USER = 'root'
VPS_PASS = 'LipeHost@2026'
PROJECT_DIR = '/var/www/lipehost'

def run(ssh, cmd, timeout=120):
    print(f'$ {cmd[:180]}')
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    exit_code = stdout.channel.exit_status
    if out: print(out.rstrip())
    if err: print('STDERR:', err.rstrip())
    print(f'[exit {exit_code}]')
    return exit_code, out


def main():
    print(f'Connecting to {VPS_HOST}...')
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=15)
    print('✓ Connected')

    # SFTP upload
    print('\nUploading deploy-executor.ts via SFTP...')
    sftp = ssh.open_sftp()
    sftp.put('/home/z/my-project/src/lib/deploy-executor.ts', f'{PROJECT_DIR}/src/lib/deploy-executor.ts')
    sftp.close()
    print('✓ Uploaded')

    # Verify
    print('\n--- Verify ---')
    run(ssh, f"wc -l {PROJECT_DIR}/src/lib/deploy-executor.ts")
    run(ssh, f"grep -c 'ROBUST STANDALONE DETECTION' {PROJECT_DIR}/src/lib/deploy-executor.ts")
    run(ssh, f"grep -c 'WRAPPER SCRIPT' {PROJECT_DIR}/src/lib/deploy-executor.ts")

    # Commit + push
    print('\n--- git add + commit ---')
    run(ssh, f"cd {PROJECT_DIR} && git add -A && git commit -m 'fix(deploy): robust standalone + wrapper script - any Next.js project deploys automatically' 2>&1 | tail -5")
    print('\n--- git push ---')
    run(ssh, f"cd {PROJECT_DIR} && git push origin main 2>&1 | tail -8")

    # Trigger rebuild in background
    print('\n--- Triggering background rebuild (will take ~3 min) ---')
    run(ssh, f"cd {PROJECT_DIR} && nohup bash -c 'NODE_ENV=production bun run build > /tmp/lipehost-build.log 2>&1 && systemctl restart lipehost && echo DONE_RESTART >> /tmp/lipehost-build.log' >/dev/null 2>&1 &", timeout=10)

    print('\n✅ Fix applied + pushed. Rebuild running in background.')
    ssh.close()


if __name__ == '__main__':
    main()
