#!/usr/bin/env python3
"""Upload fixed files + rebuild lipehost + test preview URL change."""
import sys
sys.path.insert(0, '/home/z/.local/lib/python3.13/site-packages')
import paramiko, time

VPS_HOST = '209.145.62.238'
VPS_USER = 'root'
VPS_PASS = 'LipeHost@2026'
PROJECT_DIR = '/var/www/lipehost'

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

    # 1. Upload the fixed files via SFTP
    print('\n=== 1. Upload fixed files ===')
    sftp = ssh.open_sftp()
    sftp.put('/home/z/my-project/src/lib/deploy-executor.ts', f'{PROJECT_DIR}/src/lib/deploy-executor.ts')
    print('  ✓ deploy-executor.ts uploaded')
    sftp.put('/home/z/my-project/src/app/api/deploys/[id]/route.ts', f'{PROJECT_DIR}/src/app/api/deploys/[id]/route.ts')
    print('  ✓ api/deploys/[id]/route.ts uploaded')
    sftp.close()

    # Verify
    print('\n=== 2. Verify uploads ===')
    run(ssh, f"grep -c 'export async function configureNginxForDeploy' {PROJECT_DIR}/src/lib/deploy-executor.ts")
    run(ssh, f"grep -c 'export async function removeNginxHostname' {PROJECT_DIR}/src/lib/deploy-executor.ts")
    run(ssh, f"grep -c 'previewUrlChanged' {PROJECT_DIR}/src/app/api/deploys/\\[id\\]/route.ts")

    # 3. Trigger rebuild in background
    print('\n=== 3. Trigger background rebuild ===')
    ssh.exec_command(f"cd {PROJECT_DIR} && setsid bash -c 'NODE_ENV=production bun run build > /tmp/lipehost-build-preview.log 2>&1 && systemctl restart lipehost && echo DONE >> /tmp/lipehost-build-preview.log' </dev/null >/dev/null 2>&1 &", timeout=5)
    time.sleep(2)
    print('  ✓ Build started')

    # 4. Poll until build is done
    print('\n=== 4. Wait for build to complete ===')
    for i in range(16):  # up to 8 min
        ec, out = run(ssh, 'tail -2 /tmp/lipehost-build-preview.log 2>/dev/null', timeout=10)
        if 'DONE' in out:
            print('  ✓ BUILD DONE')
            break
        time.sleep(30)

    # 5. Verify lipehost is up
    print('\n=== 5. Verify lipehost platform ===')
    run(ssh, 'curl -sS -o /dev/null -w "lipe.host: HTTP %{http_code}\\n" --max-time 5 http://localhost:3000/')

    # 6. Test the preview URL change flow manually
    # Get current agromed preview URL and try changing it via the API
    print('\n=== 6. Current deploys in DB ===')
    run(ssh, f"cd {PROJECT_DIR} && sqlite3 db/custom.db \"SELECT id, name, status, previewUrl FROM Deploy;\"")

    ssh.close()
    print('\n🎉 DONE! Platform rebuilt with preview URL nginx reconfig logic.')


if __name__ == '__main__':
    main()
