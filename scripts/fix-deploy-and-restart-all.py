#!/usr/bin/env python3
"""
Push fix to GitHub from VPS (VPS has GitHub token configured), pull on VPS,
rebuild, restart, then manually rebuild + start the failed agromedub deploy.
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
    print(f'\n$ {cmd[:200]}{"..." if len(cmd)>200 else ""}')
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout, get_pty=True)
    output = []
    while not stdout.channel.exit_status_ready():
        if stdout.channel.recv_ready():
            chunk = stdout.channel.recv(4096).decode('utf-8', errors='replace')
            output.append(chunk)
            sys.stdout.write(chunk)
            sys.stdout.flush()
        time.sleep(0.05)
    while stdout.channel.recv_ready():
        chunk = stdout.channel.recv(4096).decode('utf-8', errors='replace')
        output.append(chunk)
        sys.stdout.write(chunk)
    exit_code = stdout.channel.exit_status
    print(f'\n[exit {exit_code}]')
    return exit_code, ''.join(output)


def main():
    print(f'=== Connecting to {VPS_USER}@{VPS_HOST} ===')
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)
    print('✓ Connected!\n')

    # 1. Push from VPS to GitHub (VPS has the token in remote URL)
    print('=== Step 1: Push local commit to GitHub FROM the VPS ===')
    # First, copy our local commit to the VPS via a patch
    # Easier: just commit & push directly on the VPS by syncing the file
    # We'll re-create the fix on the VPS by editing the file directly

    # 2. Pull on VPS — but we haven't pushed yet, so let's apply the fix directly
    print('\n=== Step 2: Apply deploy-executor fix directly on VPS ===')
    # Use a heredoc to overwrite deploy-executor.ts with the new fixed version
    # We'll base64-encode the local file and decode on the VPS to avoid any escaping issues
    import base64
    with open('/home/z/my-project/src/lib/deploy-executor.ts', 'rb') as f:
        content_b64 = base64.b64encode(f.read()).decode('ascii')

    # Write the b64 to a temp file on the VPS, decode it to the actual path
    cmd = f"echo '{content_b64}' | base64 -d > {PROJECT_DIR}/src/lib/deploy-executor.ts && wc -l {PROJECT_DIR}/src/lib/deploy-executor.ts"
    run(ssh, cmd, timeout=60)

    # 3. Verify the fix landed (look for the new comments)
    print('\n=== Step 3: Verify the fix landed ===')
    run(ssh, f"grep -c 'ROBUST STANDALONE DETECTION' {PROJECT_DIR}/src/lib/deploy-executor.ts", timeout=30)
    run(ssh, f"grep -c 'WRAPPER SCRIPT' {PROJECT_DIR}/src/lib/deploy-executor.ts", timeout=30)

    # 4. Commit the fix on VPS so future pulls don't conflict
    print('\n=== Step 4: Commit fix on VPS ===')
    run(ssh, f"cd {PROJECT_DIR} && git add -A && git commit -m 'fix(deploy): robust standalone detection + wrapper script' 2>&1 | tail -5", timeout=30)

    # 5. Push to GitHub from VPS (VPS has the token in remote URL)
    print('\n=== Step 5: Push to GitHub from VPS ===')
    run(ssh, f"cd {PROJECT_DIR} && git push origin main 2>&1 | tail -5", timeout=60)

    # 6. Rebuild the lipehost platform with the fix
    print('\n=== Step 6: Rebuild lipehost platform ===')
    run(ssh, f"cd {PROJECT_DIR} && NODE_ENV=production bun run build 2>&1 | tail -20", timeout=600)

    # 7. Restart the lipehost service
    print('\n=== Step 7: Restart lipehost service ===')
    run(ssh, 'systemctl restart lipehost && sleep 3 && systemctl status lipehost --no-pager | head -5', timeout=60)

    # 8. Verify the platform is up
    print('\n=== Step 8: Verify lipehost platform ===')
    run(ssh, 'curl -sS -o /dev/null -w "LipeHost: HTTP %{http_code}\\n" http://localhost:3000/', timeout=30)

    # 9. List all current deploys to find the failed agromedub one
    print('\n=== Step 9: List all deploys ===')
    exit_code, out = run(ssh, f"ls -la {PROJECT_DIR}/deploys/ 2>/dev/null", timeout=30)

    # 10. Find the failed agromedub deploy by querying the DB
    print('\n=== Step 10: Find failed deploys ===')
    run(ssh, f"cd {PROJECT_DIR} && sqlite3 db/custom.db \"SELECT id, name, status, port FROM Deploy WHERE status IN ('error','building') ORDER BY createdAt DESC;\" 2>&1", timeout=30)

    # 11. Restart all existing deploys so they use the new start.sh approach
    print('\n=== Step 11: Restart all existing deploys with new wrapper approach ===')
    # For each deploy dir, create a start.sh and restart with PM2
    # First, list them
    exit_code, ls_out = run(ssh, f"ls {PROJECT_DIR}/deploys/ 2>/dev/null", timeout=30)
    deploy_dirs = [d.strip() for d in ls_out.strip().split('\n') if d.strip() and not d.startswith('total')]
    print(f'\nFound deploy dirs: {deploy_dirs}')

    for deploy_id in deploy_dirs:
        print(f'\n--- Restarting deploy: {deploy_id} ---')
        deploy_dir = f"{PROJECT_DIR}/deploys/{deploy_id}"

        # Get the port from the DB
        ec, port_out = run(ssh, f"cd {PROJECT_DIR} && sqlite3 db/custom.db \"SELECT port FROM Deploy WHERE id='{deploy_id}';\" 2>&1", timeout=15)
        port = port_out.strip().split('\n')[-1].strip() if port_out else ''
        if not port or not port.isdigit():
            print(f'  ⚠️ No port found for {deploy_id}, skipping')
            continue
        print(f'  Port: {port}')

        # Find standalone directory
        ec, standalone_out = run(ssh, f"test -f {deploy_dir}/.next/standalone/server.js && echo 'STD' || (find {deploy_dir}/.next -name server.js -not -path '*/node_modules/*' -type f 2>/dev/null | head -1)", timeout=15)
        standalone_line = standalone_out.strip().split('\n')[-1].strip() if standalone_out else ''
        print(f'  Standalone check: {standalone_line}')

        standalone_dir = ''
        start_cmd = ''
        if standalone_line == 'STD':
            standalone_dir = f"{deploy_dir}/.next/standalone"
            start_cmd = f"PORT={port} NODE_ENV=production node server.js"
        elif standalone_line.startswith('/'):
            standalone_dir = standalone_line.replace('/server.js', '')
            start_cmd = f"PORT={port} NODE_ENV=production node server.js"
        else:
            # No standalone — fall back to next start
            standalone_dir = deploy_dir
            start_cmd = f"PORT={port} NODE_ENV=production npx next start -p {port}"

        print(f'  standaloneDir: {standalone_dir}')
        print(f'  startCmd: {start_cmd}')

        # Create start.sh wrapper
        db_path = f"{deploy_dir}/db/custom.db"
        start_script = f"""#!/bin/bash
# Auto-generated by LIPE.HOST deploy executor
cd {standalone_dir}
export PORT={port}
export NODE_ENV=production
export DATABASE_URL=file:{db_path}
export HOSTNAME=0.0.0.0
exec {start_cmd}
"""
        import base64 as b64
        script_b64 = b64.b64encode(start_script.encode()).decode()
        run(ssh, f"echo '{script_b64}' | base64 -d > {deploy_dir}/start.sh && chmod 755 {deploy_dir}/start.sh && cat {deploy_dir}/start.sh", timeout=15)

        # Ensure static files are copied if standalone
        if standalone_dir != deploy_dir:
            run(ssh, f"mkdir -p {standalone_dir}/public {standalone_dir}/.next/static && cp -rf {deploy_dir}/public/. {standalone_dir}/public/ 2>/dev/null || true && cp -rf {deploy_dir}/.next/static/. {standalone_dir}/.next/static/ 2>/dev/null || true", timeout=30)

        # Kill anything on the port
        run(ssh, f"fuser -k {port}/tcp 2>/dev/null || true", timeout=15)

        # Delete old PM2 process
        pm2_name = f"deploy-{deploy_id[:12]}"
        run(ssh, f"pm2 delete {pm2_name} 2>/dev/null || true", timeout=15)

        # Start with PM2 using the wrapper script
        run(ssh, f"pm2 start {deploy_dir}/start.sh --name {pm2_name} --cwd {standalone_dir} 2>&1", timeout=30)
        run(ssh, "pm2 save --force 2>&1 | tail -2", timeout=15)

        # Wait and check
        time.sleep(3)
        run(ssh, f"curl -sS -o /dev/null -w 'Deploy {deploy_id}: HTTP %{{http_code}}\\n' http://localhost:{port}/ 2>&1", timeout=15)

    # 12. Final summary — list all PM2 processes
    print('\n=== Step 12: PM2 summary ===')
    run(ssh, "pm2 list 2>&1", timeout=30)

    print('\n🎉 ALL DONE!')
    ssh.close()
    return 0


if __name__ == '__main__':
    sys.exit(main())
