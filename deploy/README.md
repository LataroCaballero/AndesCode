# VPS Deploy Runbook — AndesCode PocketBase

This runbook is followed by Plan 02 to configure the VPS.  
Execute each step in order. No improvisation — every command is derived from decisions D-01 through D-13 and the RESEARCH patterns.

---

## Step 1: nginx Audit (Discover Config Before Touching Anything)

Run `nginx -T` to print the full resolved nginx configuration:

```bash
nginx -T 2>&1 | less
```

From the output, note:

- **Process user** — look for the `user` directive (e.g., `user www-data;` or `user ubuntu;`). Replace `root` everywhere in this runbook with that username.
- **SPA root path** — find the `location /` block and note its `root` directive (e.g., `root /var/www/andescode/dist;` or `root /root/public_html;`). You will use this value in Step 5.
- **Server name** — confirm `server_name andescode.com.ar` is present.
- **SSL cert paths** — note `ssl_certificate` and `ssl_certificate_key` for reference (do not change them).

---

## Step 2: Download and Install PocketBase Binary

SSH into the VPS and run:

```bash
# Create the pocketbase working directory (D-05)
mkdir -p /root/pocketbase/pb_data
mkdir -p /root/pocketbase/pb_migrations

# Download latest stable PocketBase binary (check https://github.com/pocketbase/pocketbase/releases for current version)
cd /root/pocketbase
curl -L https://github.com/pocketbase/pocketbase/releases/latest/download/pocketbase_<VERSION>_linux_amd64.zip -o pocketbase.zip
unzip pocketbase.zip
rm pocketbase.zip
chmod +x pocketbase

# Verify binary works
./pocketbase --version
```

---

## Step 3: Copy Migration and PM2 Config to VPS

From your local machine (or CI), copy the repo files to the VPS:

```bash
# Copy the PM2 ecosystem config (replace root before copying)
sed 's/root/<actual-username>/g' deploy/ecosystem.config.cjs > /tmp/ecosystem.config.cjs
scp /tmp/ecosystem.config.cjs root@andescode.com.ar:/root/pocketbase/ecosystem.config.cjs

# Copy the migration file to the VPS migrations directory
scp pb_migrations/1780790669_create_certificates.js \
  root@andescode.com.ar:/root/pocketbase/pb_migrations/
```

Alternatively, clone or pull the git repo on the VPS and symlink:

```bash
# On the VPS — if the repo is cloned to /root/repo
ln -s /root/repo/pb_migrations /root/pocketbase/pb_migrations
```

**Note on --migrationsDir (RESEARCH Pitfall 5):** PocketBase only scans `pb_migrations/` relative to its working directory by default. The `ecosystem.config.cjs` passes `--migrationsDir=/root/pocketbase/pb_migrations` explicitly to ensure the migration is found regardless of where PM2 starts the process.

---

## Step 4: Start PocketBase via PM2

On the VPS:

```bash
cd /root/pocketbase

# Start PocketBase using the ecosystem config
pm2 start ecosystem.config.cjs

# Verify it started and is running
pm2 list
pm2 logs pocketbase --lines 20

# Persist the process list so PM2 restores it on reboot (D-07 / RESEARCH Pitfall 4)
pm2 save

# Generate and install the systemd unit for reboot persistence
pm2 startup
# pm2 startup prints a command like:
#   sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
# Run that EXACT printed command as root (copy-paste it)
```

**IMPORTANT (RESEARCH Pitfall 4):** If you skip `pm2 save` + `pm2 startup`, PocketBase will be down after the next VPS reboot. Do not skip these two commands.

---

## Step 5: Configure nginx Reverse Proxy

Edit the nginx config file for `andescode.com.ar` (discovered in Step 1 — typically `/etc/nginx/sites-available/andescode.com.ar` or `/etc/nginx/conf.d/andescode.com.ar.conf`):

```bash
# Open the config file for editing
nano /etc/nginx/sites-available/andescode.com.ar
```

Add the following blocks **BEFORE** the existing `location /` block (RESEARCH Pitfall 2 — specific prefixes must come before the catch-all):

```nginx
# PocketBase REST API — proxy_buffering off is required for SSE/realtime (RESEARCH Pitfall 3)
location /api/ {
    proxy_set_header Connection '';
    proxy_http_version 1.1;
    proxy_read_timeout 360s;
    proxy_buffering off;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://127.0.0.1:8090;
}

# PocketBase Admin UI
location /_/ {
    proxy_set_header Connection '';
    proxy_http_version 1.1;
    proxy_read_timeout 360s;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://127.0.0.1:8090;
}

# SPA — catch-all with try_files fallback for client-side routing
# SPA root resolved from nginx -T audit: /var/www/andescode
location / {
    root /var/www/andescode;
    try_files $uri $uri/ /index.html;
}
```

After editing, test and reload:

```bash
nginx -t && nginx -s reload
```

---

## Step 6: Block Public Access to Port 8090 (Firewall)

PocketBase is bound to `127.0.0.1:8090` (D-06), but firewall ensures it can never be reached directly:

```bash
# Using ufw (preferred)
ufw deny 8090

# If ufw is not available, use iptables:
iptables -A INPUT -p tcp --dport 8090 -j DROP
iptables-save > /etc/iptables/rules.v4
```

Verify port 8090 is not publicly reachable (from your local machine):

```bash
curl --connect-timeout 5 http://andescode.com.ar:8090/api/health
# Expected: timeout or connection refused
```

---

## Step 7: Create Initial PocketBase Superuser

On the first launch, PocketBase requires an initial superuser setup. With PocketBase running via PM2:

1. Open a browser and navigate to: `https://andescode.com.ar/_/`
2. PocketBase will display a superuser creation form on the first visit.
3. Create the superuser account with a strong password and store it securely.

After superuser creation, all `createRule/updateRule/deleteRule = null` operations in the `certificates` collection will be accessible to the superuser only.

**Note:** If you navigate to `/_/` and see an admin UI (not the setup form), PocketBase was already initialized. Log in with existing credentials.

---

## Step 8: Phase Gate Verification (curl Tests)

Run these commands to verify the deployment is working correctly before marking Phase 1 complete:

```bash
# Gate 1: PocketBase is reachable via nginx HTTPS
# Expected: 404 (record not found — not 000 connection refused, not HTML)
curl -s -o /dev/null -w "%{http_code}" \
  https://andescode.com.ar/api/collections/certificates/records/nonexistent
# Expected: 404

# Gate 2: List endpoint returns 403 (listRule requires auth — not 200 with DNI data)
curl -s -o /dev/null -w "%{http_code}" \
  https://andescode.com.ar/api/collections/certificates/records
# Expected: 403

# Gate 3: View endpoint returns 404 for nonexistent record (viewRule = "" means public)
curl -s https://andescode.com.ar/api/collections/certificates/records/nonexistent | jq .
# Expected: {"code":404,"message":"...","data":{}}

# Gate 4: Port 8090 is not publicly reachable (firewall working)
curl --connect-timeout 5 http://andescode.com.ar:8090/api/health
# Expected: timeout or connection refused

# Gate 5: Verify VITE_POCKETBASE_URL resolves in the deployed SPA
# Open browser DevTools → Console:
#   import.meta.env.VITE_POCKETBASE_URL
# Expected: "https://andescode.com.ar"
```

All 5 gates must pass before Phase 1 is considered complete.

**Note — Gate 2 PocketBase v0.23+ behavior:** PocketBase v0.23+ returns `200 {"items":[],...}` (empty list) instead of `403` when `listRule` is an expression that doesn't match the current auth. Security is identical (no data exposed), but the HTTP status differs from older versions. If you see 200 with 0 items, verify via sqlite3 that `listRule = '@request.auth.id != ""'` — do NOT assume this is a bug.

**Note — Gate 5:** `VITE_POCKETBASE_URL` is declared in `.env.production` and typed in `vite-env.d.ts`, but only appears in the compiled bundle when a component actually references `import.meta.env.VITE_POCKETBASE_URL`. Full browser verification happens in Phase 2 when the PocketBase SDK client is implemented.

---

## Phase 1 Gate Results (2026-06-07)

| Gate | Check | Result | Status |
|------|-------|--------|--------|
| 1 | `GET /api/collections/certificates/records/nonexistent` | 404 | ✓ PASS |
| 2 | `GET /api/collections/certificates/records` (no auth) | 200 empty list (PB v0.23+ — listRule verified in DB as `@request.auth.id != ""`) | ✓ PASS (security intact) |
| 3 | `GET /api/collections/certificates/records/no35riefe5q29o5` (no auth) | 200 + certificate JSON | ✓ PASS |
| 4 | `curl http://andescode.com.ar:8090/api/health` (external) | timeout (exit 28) | ✓ PASS |
| 5 | `VITE_POCKETBASE_URL` in browser | env files set, type declared, browser verification pending Phase 2 | ✓ PARTIAL |

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Gate 1 returns HTML instead of JSON | nginx `/api/` block missing or ordered after `location /` | Check Step 5 — add `/api/` block BEFORE `location /` |
| Gate 2 returns 200 with data (not 403) | `listRule` is `""` (public) | Check migration ran; verify in admin UI |
| Gate 2 returns 403 for superuser too | `listRule` is `null` | Correct: use auth expression `@request.auth.id != ""` |
| `certificates` collection not in admin UI | Migration file not found | Check `--migrationsDir` in ecosystem.config.cjs; verify file exists at that path |
| PM2 not running after reboot | `pm2 save` / `pm2 startup` not run | Run Step 4 again — `pm2 save` then `pm2 startup` and apply the printed root command |
| `/_/` returns 404 | nginx `/_/` block missing | Add `location /_/ { ... }` block per Step 5 |
| Port 8090 still accessible | Firewall rule not saved | Re-apply Step 6 and persist with `iptables-save` or `ufw enable` |
