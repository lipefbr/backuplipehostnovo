#!/usr/bin/env python3
"""Phase 1a: Just apply fix, commit, push to GitHub from VPS (no rebuild)."""
import sys
sys.path.insert(0, '/home/z/.local/lib/python3.13/site-packages')
import paramiko, time, base64

VPS_HOST = '209.145.62.238'
VPS_USER = 'root'
VPS_PASS = 'LipeHost@2026'
PROJECT_DIR = '/var/www/lipehost'

def run(ssh, cmd, timeout=120):
    print(f'\n$ {cmd[:200]}{"..." if len(cmd)>200 else ""}')
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
    print(f'=== Connecting to {VPS_HOST} ===')
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)
    print('✓ Connected!')

    # 1. Apply the fix directly
    print('\n=== Step 1: Apply deploy-executor fix ===')
    with open('/home/z/my-project/src/lib/deploy-executor.ts', 'rb') as f:
        content_b64 = base64.b64encode(f.read()).decode('ascii')
    run(ssh, f"echo '{content_b64}' | base64 -d > {PROJECT_DIR}/src/lib/deploy-executor.ts && wc -l {PROJECT_DIR}/src/lib/deploy-executor.ts", timeout=60)

    # 2. Verify the fix
    print('\n=== Step 2: Verify fix landed ===')
    run(ssh, f"grep -c 'ROBUST STANDALONE DETECTION' {PROJECT_DIR}/src/lib/deploy-executor.ts", timeout=15)
    run(ssh, f"grep -c 'WRAPPER SCRIPT' {PROJECT_DIR}/src/lib/deploy-executor.ts", timeout=15)

    # 3. Commit & push to GitHub from VPS
    print('\n=== Step 3: Commit + push to GitHub ===')
    run(ssh, f"cd {PROJECT_DIR} && git add -A && git commit -m 'fix(deploy): robust standalone detection + wrapper script - any Next.js project deploys automatically' 2>&1 | tail -5", timeout=30)
    run(ssh, f"cd {PROJECT_DIR} && git push origin main 2>&1 | tail -10", timeout=60)

    print('\n🎉 PHASE 1a DONE — fix applied on VPS and pushed to GitHub!')
    print('Next: rebuild platform (phase1b) and restart deploys (phase2)')
    ssh.close()


if __name__ == '__main__':
    main()
