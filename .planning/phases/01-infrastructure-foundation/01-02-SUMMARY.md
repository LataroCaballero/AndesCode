---
phase: 01-infrastructure-foundation
plan: 02
subsystem: infrastructure
tags: [pocketbase, pm2, nginx, firewall, vps, deploy]
dependency_graph:
  requires:
    - pb_migrations/1780790669_create_certificates.js (from plan 01)
    - deploy/ecosystem.config.cjs (from plan 01)
    - deploy/README.md (from plan 01)
  provides:
    - PocketBase running at 127.0.0.1:8090 under PM2
    - nginx proxy /api/ + /_/ on andescode.com.ar
    - certificates collection with D-10 API rules
    - PM2 systemd unit for reboot persistence
    - ufw rule blocking port 8090 from internet
  affects:
    - Plan 03 (backup config + full gate verification)
    - Phase 2+ (all phases using https://andescode.com.ar/api/)
tech_stack:
  added: []
  patterns:
    - Repurpose existing PocketBase binary (don't reinstall if already present)
    - PocketBase v0.23+ list behavior (200 empty vs 403 when listRule fails)
    - PM2 ecosystem.config.cjs managing non-Node binary (interpreter: "none")
key_files:
  created: []
  modified:
    - deploy/ecosystem.config.cjs (resolved __USER__ placeholder, updated to existing PB path)
    - deploy/README.md (resolved paths, added gate results section)
  vps_artifacts:
    - /home/pocketbase/pb/pb_migrations/1780790669_create_certificates.js
    - /home/pocketbase/pb/ecosystem.config.cjs
    - /etc/nginx/sites-available/andescode (added /api/ + /_/ blocks)
    - /etc/systemd/system/pm2-root.service (pm2 startup)
decisions:
  - "Repurposed existing PocketBase v0.36.6 at /home/pocketbase/pb/ instead of fresh install — binary already present, pb_data preserved"
  - "PocketBase v0.23+ returns 200+empty for unauthenticated list when listRule is an expression — this is expected behavior, security intact (SQLite confirms listRule = '@request.auth.id != \"\"')"
  - "Gate 5 (VITE_POCKETBASE_URL) verified as env-file-only — browser verification deferred to Phase 2 when first component uses import.meta.env.VITE_POCKETBASE_URL"
  - "pb.andescode.com.ar subdomain kept as-is — provides alternative admin access URL"
metrics:
  completed_date: "2026-06-07"
  tasks_completed: 3
  tasks_total: 3
---

# Phase 01 Plan 02: VPS Deploy Summary

**One-liner:** PocketBase running under PM2 on 127.0.0.1:8090, nginx proxying /api/ + /_ on andescode.com.ar, ufw blocking port 8090 — gates 1, 3, 4 pass; gate 2 verified as PocketBase v0.23+ behavior.

---

## What Was Built

1. **Migration deployed** — `1780790669_create_certificates.js` copied to `/home/pocketbase/pb/pb_migrations/` and applied on PocketBase restart. The `certificates` collection exists with all 14 fields, `listRule = '@request.auth.id != ""'`, `viewRule = ""`, and UNIQUE index on `certificateCode`.

2. **PocketBase under PM2** — existing PocketBase v0.36.6 at `/home/pocketbase/pb/pocketbase` (previously running unmanaged) now managed by PM2 process `pocketbase` (id=3). `pm2 save` persists the process list; `pm2 startup systemd` created `/etc/systemd/system/pm2-root.service` for reboot persistence.

3. **nginx augmented** — `/etc/nginx/sites-available/andescode` updated with `/api/` and `/_/` proxy blocks (with `proxy_buffering off` on `/api/`) inserted BEFORE the catch-all `location /`. Backup at `andescode.bak`.

4. **Firewall** — `ufw deny 8090` (IPv4 + IPv6) blocks direct external access to PocketBase port.

5. **SPA redeployed** — frontend rebuilt with Plan 01 `.env` files and rsync'd to `/var/www/andescode/`.

---

## Tasks Completed

| Task | Name | Method | Key Result |
|------|------|--------|-----------|
| 1 | Audit nginx + resolve __USER__ | SSH audit | username=root (home=/root), SPA root=/var/www/andescode, SSL confirmed |
| 2 | Install PocketBase + PM2 | SSH execution | Repurposed existing PB v0.36.6; PM2 online; migration applied |
| 3 | nginx proxy + firewall + verify | SSH + curl | /api/ + /_/ proxied; 8090 firewalled; gates 1+3+4 pass |

---

## Deviations from Plan

### 1. Repurposed existing PocketBase instead of fresh install
- **Found during:** Task 1 audit
- **Issue:** PocketBase v0.36.6 was already running unmanaged at `/home/pocketbase/pb/pocketbase` with `pb_data` and `pb_migrations` directories. Installing at `/root/pocketbase/` would create a duplicate instance.
- **Fix:** Reused existing installation. Updated `ecosystem.config.cjs` to point to `/home/pocketbase/pb/pocketbase`. The previous unmanaged process (PID 4153145) was killed and replaced with PM2-managed one.
- **Impact:** PocketBase binary path differs from original plan (`/home/pocketbase/pb/` vs `/root/pocketbase/`). Behavior identical.

### 2. Gate 2 returns 200 (empty list) instead of 403
- **Found during:** Task 3 verification
- **Root cause:** PocketBase v0.23+ changed list rule semantics. Instead of returning 403 when the listRule expression doesn't match the current auth state, it filters records and returns an empty list with 200. This is intentional PocketBase behavior, not a misconfiguration.
- **Verification:** SQLite confirms `listRule = '@request.auth.id != ""'` — the rule IS set correctly. No DNI data is exposed (empty list, 0 items).
- **Impact on ROADMAP criterion 2:** Updated to expect "200 empty list (equivalent to 403)" for PocketBase v0.23+.

### 3. Gate 5 partially verified
- **Found during:** Task 3 verification
- **Issue:** `VITE_POCKETBASE_URL` is not referenced in any source component yet (Phase 2 work). Vite only bakes env vars that are actually used in source code. The env files and TypeScript types are correctly configured.
- **Impact:** Browser verification `import.meta.env.VITE_POCKETBASE_URL === "https://andescode.com.ar"` will be confirmed in Phase 2.

---

## Phase Gate Results

| Gate | Criterion | Result |
|------|-----------|--------|
| 1 | HTTPS 404 for nonexistent record | ✓ 404 |
| 2 | listRule enforced (no auth) | ✓ 200 empty (PB v0.23+ — data protected, SQLite verified) |
| 3 | Public view by ID without auth | ✓ 200 + JSON (test cert AC-2025-TEST, id=no35riefe5q29o5) |
| 4 | Port 8090 blocked from internet | ✓ timeout (exit 28, http 000) |
| 5 | VITE_POCKETBASE_URL in browser | ⚠ partial — env configured, browser verify in Phase 2 |

---

## Requirements Coverage

| Requirement | Status |
|-------------|--------|
| INFRA-01 (PocketBase bound to 127.0.0.1:8090, 8090 blocked) | ✓ Covered |
| INFRA-02 (nginx proxies /api/* and /\_/*) | ✓ Covered |
| INFRA-03 (SSL confirmed for andescode.com.ar) | ✓ Covered (Let's Encrypt existing cert) |

---

## Threat Flags

- T-01-04 (port 8090 elevation): mitigated — ufw deny 8090 + PocketBase bound to 127.0.0.1
- T-01-05 (nginx ordering): mitigated — /api/ + /_/ before location / (verified: curl returns JSON 404, not SPA HTML)
- T-01-06 (admin UI): existing superuser caballerolautarodev@gmail.com in place
- T-01-07 (HTTPS/MITM): existing Let's Encrypt cert confirmed

## Self-Check: PASSED
