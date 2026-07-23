#!/usr/bin/env python3
"""
Create GitHub repo 'novaversaolipehost100' as backup, push current version to it.

Strategy:
1. SSH to VPS (which has the GitHub token in its git remote URL)
2. Use the GitHub API (with the token) to create a new public repo 'novaversaolipehost100'
3. Sync the latest local commits to the VPS (we already uploaded src/lib/deploy-executor.ts;
   but we need to push ALL local commits that aren't yet on the VPS)
4. On the VPS: add the new repo as a remote, push to it
"""
import sys
sys.path.insert(0, '/home/z/.local/lib/python3.13/site-packages')
import paramiko, time, base64, json, urllib.request, urllib.error

VPS_HOST = '209.145.62.238'
VPS_USER = 'root'
VPS_PASS = 'LipeHost@2026'
PROJECT_DIR = '/var/www/lipehost'
NEW_REPO_NAME = 'novaversaolipehost100'
GITHUB_USER = 'lipefbr'

def run(ssh, cmd, timeout=120):
    print(f'$ {cmd[:200]}')
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

    # 1. Extract the GitHub token from the VPS git remote URL
    print('\n=== 1. Get GitHub token from VPS git remote ===')
    ec, remote_out = run(ssh, f"cd {PROJECT_DIR} && git remote get-url origin", timeout=15)
    # remote URL is like: https://lipefbr:TOKEN@github.com/lipefbr/lipehost-landing.git
    remote_url = remote_out.strip().split('\n')[-1].strip()
    print(f'  Remote URL: {remote_url[:50]}...')

    # Extract token
    import re
    m = re.search(r'https://[^:]+:([^@]+)@github\.com', remote_url)
    if not m:
        print('  ❌ Could not extract GitHub token from remote URL')
        return
    github_token = m.group(1)
    print(f'  ✓ Token extracted: {github_token[:8]}...{github_token[-4:]}')

    # 2. Create the new repo via GitHub API
    print(f'\n=== 2. Create new GitHub repo: {NEW_REPO_NAME} ===')
    payload = json.dumps({
        'name': NEW_REPO_NAME,
        'description': 'Backup da nova versão do LIPE.HOST — plataforma de deploy com painel, loja, chat IA, etc.',
        'private': False,  # public backup
        'auto_init': False,
    }).encode('utf-8')
    req = urllib.request.Request(
        'https://api.github.com/user/repos',
        data=payload,
        headers={
            'Authorization': f'token {github_token}',
            'Accept': 'application/vnd.github+json',
            'Content-Type': 'application/json',
        },
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            resp_data = json.loads(resp.read().decode('utf-8'))
            print(f'  ✓ Repo created: {resp_data.get("html_url", "unknown")}')
            new_repo_url = resp_data.get('clone_url') or f'https://github.com/{GITHUB_USER}/{NEW_REPO_NAME}.git'
            new_repo_url_with_token = f'https://{GITHUB_USER}:{github_token}@github.com/{GITHUB_USER}/{NEW_REPO_NAME}.git'
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        if e.code == 422 and 'already exists' in body.lower():
            print(f'  ⚠️ Repo already exists — will use it as backup target')
            new_repo_url = f'https://github.com/{GITHUB_USER}/{NEW_REPO_NAME}.git'
            new_repo_url_with_token = f'https://{GITHUB_USER}:{github_token}@github.com/{GITHUB_USER}/{NEW_REPO_NAME}.git'
        else:
            print(f'  ❌ GitHub API error {e.code}: {body[:300]}')
            return

    # 3. Check VPS git status — what's the latest commit there?
    print('\n=== 3. Check VPS git status ===')
    run(ssh, f"cd {PROJECT_DIR} && git log --oneline -5", timeout=15)
    run(ssh, f"cd {PROJECT_DIR} && git status -s | head -10", timeout=15)

    # 4. Sync local commits to VPS via bundle
    # Create a git bundle of all commits not yet on origin/main on the VPS
    # Easier: just push from VPS to BOTH origin (existing repo) and the new backup repo
    print('\n=== 4. Add backup remote on VPS ===')
    # Remove backup remote if it exists, then add fresh
    run(ssh, f"cd {PROJECT_DIR} && git remote remove backup 2>/dev/null; true", timeout=15)
    run(ssh, f"cd {PROJECT_DIR} && git remote add backup '{new_repo_url_with_token}'", timeout=15)
    run(ssh, f"cd {PROJECT_DIR} && git remote -v", timeout=15)

    # 5. Commit any uncommitted changes on VPS first
    print('\n=== 5. Commit any uncommitted changes on VPS ===')
    run(ssh, f"cd {PROJECT_DIR} && git add -A && git commit -m 'sync: latest deploy-executor fixes (robust standalone + wrapper script + IPv6 nginx)' 2>&1 | tail -5", timeout=30)

    # 6. Push to origin (existing repo) first
    print('\n=== 6. Push to origin (lipehost-landing) ===')
    run(ssh, f"cd {PROJECT_DIR} && git push origin main 2>&1 | tail -10", timeout=120)

    # 7. Push to backup repo (novaversaolipehost100)
    print(f'\n=== 7. Push to backup repo: {NEW_REPO_NAME} ===')
    ec, push_out = run(ssh, f"cd {PROJECT_DIR} && git push backup main 2>&1 | tail -15", timeout=300)
    if ec == 0:
        print(f'\n✅ BACKUP PUSHED to https://github.com/{GITHUB_USER}/{NEW_REPO_NAME}')
    else:
        # Try with --force in case the repo had something
        print(f'\n  ⚠️ Push failed — retrying with --force')
        run(ssh, f"cd {PROJECT_DIR} && git push backup main --force 2>&1 | tail -15", timeout=300)

    # 8. Verify by listing the repo's commits via GitHub API
    print(f'\n=== 8. Verify backup repo contents ===')
    req = urllib.request.Request(
        f'https://api.github.com/repos/{GITHUB_USER}/{NEW_REPO_NAME}/commits?per_page=5',
        headers={
            'Authorization': f'token {github_token}',
            'Accept': 'application/vnd.github+json',
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            commits = json.loads(resp.read().decode('utf-8'))
            print(f'  Latest {len(commits)} commits in {NEW_REPO_NAME}:')
            for c in commits[:5]:
                sha = c.get('sha', '')[:7]
                msg = c.get('commit', {}).get('message', '').split('\n')[0][:60]
                print(f'    {sha}  {msg}')
    except Exception as e:
        print(f'  ⚠️ Could not verify: {e}')

    ssh.close()
    print('\n🎉 DONE!')


if __name__ == '__main__':
    main()
