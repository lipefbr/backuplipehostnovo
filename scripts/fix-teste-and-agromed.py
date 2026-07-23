#!/usr/bin/env python3
"""Fix agromed crash + add teste to nginx config + test preview URL change."""
import sys
sys.path.insert(0, '/home/z/.local/lib/python3.13/site-packages')
import paramiko, time

VPS_HOST = '209.145.62.238'
VPS_USER = 'root'
VPS_PASS = 'LipeHost@2026'
PROJECT_DIR = '/var/www/lipehost'


def get_port_for_deploy(deploy_id: str) -> int:
    """Port of JS: hash = ((hash << 5) - hash) + charCode; 3001 + (abs(hash) % 999)"""
    h = 0
    for ch in deploy_id:
        h = ((h << 5) - h) + ord(ch)
        h &= 0xFFFFFFFF
        if h >= 0x80000000:
            h -= 0x100000000
    return 3001 + (abs(h) % 999)


def run(ssh, cmd, timeout=120):
    print(f'$ {cmd[:150]}')
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    exit_code = stdout.channel.exit_status
    if out.strip():
        for line in out.rstrip().split('\n')[:15]:
            print(f'  {line}')
    if err.strip():
        for line in err.rstrip().split('\n')[:5]:
            print(f'  ERR: {line}')
    print(f'  [exit {exit_code}]')
    return exit_code, out


def main():
    print(f'Connecting to {VPS_HOST}...')
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=15)
    print('✓ Connected')

    # 1. Check why agromed is crashing (336 restarts)
    print('\n=== 1. Check agromed PM2 logs ===')
    run(ssh, 'pm2 logs deploy-cmrwh59s3000 --lines 30 --nostream 2>&1 | tail -40', timeout=20)

    # 2. Get deploy IDs and ports
    print('\n=== 2. Calculate ports for all deploys ===')
    deploys = [
        ('cmrvihbg20001odvdzrxudtd8', 'Abelha Token Push', 'lipefbr-abelha-token-push-preview.lipe.host'),
        ('cmrwh59s30001kp9flrq8zh21', 'agromed', 'lipefbr-agromedub-preview.lipe.host'),
        ('cmrwi1j0e0001kpls6oew9w11', 'canva', 'lipefbr-canvanovo-preview.lipe.host'),
        ('cmrwic5wg0003kplsq58zcstk', 'teste', 'womannovo-preview.lipe.host'),
    ]
    for deploy_id, name, hostname in deploys:
        port = get_port_for_deploy(deploy_id)
        print(f'  {name}: port {port} → {hostname}')

    # 3. Add missing 'teste' deploy to nginx config
    teste_port = get_port_for_deploy('cmrwic5wg0003kplsq58zcstk')
    print(f'\n=== 3. Add teste to nginx config (port {teste_port}) ===')

    # Use a Python script on the VPS to safely insert the server block
    nginx_script = f"""
import re
config_path = '/etc/nginx/sites-available/lipehost'
with open(config_path, 'r') as f:
    config = f.read()

hostname = 'womannovo-preview.lipe.host'
port = {teste_port}

# Check if already exists
if f'server_name {hostname};' in config:
    # Update port
    pattern = re.compile(r'(server\\s*\\{{[^}}]*?server_name\\s+' + re.escape(hostname) + r'\\s*;[^}}]*?proxy_pass\\s+http://127\\.0\\.0\\.1:)\\d+', re.DOTALL)
    config = pattern.sub(r'\\g<1>' + str(port), config)
    print('updated existing block port')
else:
    # Insert before wildcard block
    new_block = f'''# Deploy: teste
server {{
    listen 80;
    listen [::]:80;
    server_name {hostname};
    client_max_body_size 50M;
    location / {{
        proxy_pass http://127.0.0.1:{{port}};
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
    }}
}}

'''
    new_block = new_block.replace('{{port}}', str(port))
    # Find the wildcard block and insert before it
    wildcard_match = re.search(r'# Wildcard for', config)
    if wildcard_match:
        pos = wildcard_match.start()
        config = config[:pos] + new_block + '\\n' + config[pos:]
    else:
        config = config.rstrip() + '\\n\\n' + new_block
    print('inserted new block')

with open(config_path, 'w') as f:
    f.write(config)
print('done')
"""
    import base64
    b64 = base64.b64encode(nginx_script.encode()).decode()
    run(ssh, f"echo '{b64}' | base64 -d > /tmp/fix-nginx.py && python3 /tmp/fix-nginx.py", timeout=30)

    # Test nginx config + reload
    print('\n=== 4. Test + reload nginx ===')
    run(ssh, 'nginx -t 2>&1')
    run(ssh, 'systemctl reload nginx && echo RELOADED')

    # 5. Now test all preview URLs
    print('\n=== 5. Test all preview URLs ===')
    run(ssh, "curl -sS -o /dev/null -w 'abelha: HTTP %{http_code}\\n' --max-time 5 -H 'Host: lipefbr-abelha-token-push-preview.lipe.host' http://localhost:80/")
    run(ssh, "curl -sS -o /dev/null -w 'agromed: HTTP %{http_code}\\n' --max-time 5 -H 'Host: lipefbr-agromedub-preview.lipe.host' http://localhost:80/")
    run(ssh, "curl -sS -o /dev/null -w 'canva: HTTP %{http_code}\\n' --max-time 5 -H 'Host: lipefbr-canvanovo-preview.lipe.host' http://localhost:80/")
    run(ssh, "curl -sS -o /dev/null -w 'teste: HTTP %{http_code}\\n' --max-time 5 -H 'Host: womannovo-preview.lipe.host' http://localhost:80/")

    # 6. Fix agromed crash — check the actual error
    print('\n=== 6. Check agromed detailed error ===')
    run(ssh, 'pm2 describe deploy-cmrwh59s3000 2>&1 | grep -E "script path|exec cwd|status" | head -5', timeout=15)
    run(ssh, 'pm2 logs deploy-cmrwh59s3000 --err --lines 20 --nostream 2>&1 | tail -25', timeout=15)

    ssh.close()
    print('\n🎉 DONE!')


if __name__ == '__main__':
    main()
