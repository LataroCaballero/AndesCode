---
phase: 01-infrastructure-foundation
reviewed: 2026-06-07T21:30:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - pb_migrations/1780790669_create_certificates.js
  - .env
  - .env.production
  - src/vite-env.d.ts
  - .gitignore
  - deploy/ecosystem.config.cjs
  - deploy/README.md
findings:
  critical: 2
  warning: 3
  info: 1
  total: 6
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-06-07T21:30:00Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

---

## Summary

Seven files were reviewed covering the PocketBase migration, environment variable wiring, PM2 ecosystem config, and the VPS deploy runbook. The migration's API rules are correctly configured — `listRule`, `viewRule`, `createRule`, `updateRule`, and `deleteRule` all match the required values from D-10 exactly. No secrets are present in the committed `.env` or `.env.production` files.

Two blockers were found: the deploy runbook uses a completely different filesystem path from the actual ecosystem config, which would cause PM2 to fail to start PocketBase on a fresh VPS (it would look for a binary that doesn't exist at the path the runbook creates). A second blocker is that the admin UI (`/_/`) is exposed to the public internet without any IP restriction or rate limiting, making it a brute-force target for the superuser account that controls all certificate data.

Three warnings round out the findings: a version skew between the PocketBase JS SDK (0.27) and the running server (0.36), a misleading Gate 2 note that may cause operators to not investigate an actual misconfiguration, and the committed `.env` file carrying no protection against future secret additions.

---

## Critical Issues

### CR-01: README Runbook and `ecosystem.config.cjs` Use Incompatible Filesystem Paths

**File:** `deploy/README.md:31-68` and `deploy/ecosystem.config.cjs:13-20`

**Issue:** The runbook instructs the operator to create directories and copy files under `/root/pocketbase/`, but `ecosystem.config.cjs` — the source of truth for PM2 — points the binary and all data paths to `/home/pocketbase/pb/`. Following the runbook on a fresh VPS creates the wrong directory tree and leaves the ecosystem config pointing at paths that do not exist, so PM2 will fail to start PocketBase. The Step 3 note ("the ecosystem config passes `--migrationsDir=/root/pocketbase/pb_migrations`") is also incorrect — the actual value in `ecosystem.config.cjs` is `--migrationsDir=/home/pocketbase/pb/pb_migrations`.

Specifically:

| Location | Path used |
|----------|-----------|
| `ecosystem.config.cjs` script | `/home/pocketbase/pb/pocketbase` |
| `ecosystem.config.cjs` `--dir` | `/home/pocketbase/pb/pb_data` |
| `ecosystem.config.cjs` `--migrationsDir` | `/home/pocketbase/pb/pb_migrations` |
| README Step 2 `mkdir` | `/root/pocketbase/pb_data` and `/root/pocketbase/pb_migrations` |
| README Step 3 `scp` dest | `/root/pocketbase/pb_migrations/` |
| README Step 4 `cd` | `/root/pocketbase` |
| README Step 3 note | `--migrationsDir=/root/pocketbase/pb_migrations` (wrong) |

**Fix:** Align the runbook with the committed ecosystem config. Either update all README path references to `/home/pocketbase/pb/` or add a clear note at the top of the runbook explaining that the VPS was provisioned with a non-root user and the paths are already baked into `ecosystem.config.cjs`.

Minimum README correction for Steps 2–4:

```bash
# Step 2: Create directories matching ecosystem.config.cjs
mkdir -p /home/pocketbase/pb/pb_data
mkdir -p /home/pocketbase/pb/pb_migrations

# Download PocketBase binary to the path referenced in ecosystem.config.cjs
cd /home/pocketbase/pb
curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.36.6/pocketbase_0.36.6_linux_amd64.zip -o pocketbase.zip
unzip pocketbase.zip && rm pocketbase.zip
chmod +x pocketbase
./pocketbase --version

# Step 3: Copy migration
scp pb_migrations/1780790669_create_certificates.js \
  user@andescode.com.ar:/home/pocketbase/pb/pb_migrations/

# Step 4: Start PM2 from the directory containing ecosystem.config.cjs
cd /home/pocketbase/pb
pm2 start /path/to/ecosystem.config.cjs
pm2 save && pm2 startup
```

Also fix the Step 3 note:
```
--migrationsDir=/home/pocketbase/pb/pb_migrations
```

---

### CR-02: PocketBase Admin UI (`/_/`) Publicly Exposed Without Access Restriction

**File:** `deploy/README.md:126-136`

**Issue:** The nginx configuration added in Step 5 proxies `/_/` publicly to PocketBase with no IP allowlist, no rate limiting, and no additional authentication layer. The admin UI is the single entry point that can create, update, and delete certificates (all collection rules are `null`, so only a superuser can mutate data). Exposing it to the public internet makes the superuser account a target for brute-force and credential-stuffing attacks. If the superuser account is compromised, all certificate data including DNI numbers can be exported.

The `certificates` collection has a `viewRule: ""` (public), but `createRule/updateRule/deleteRule: null` meaning only superusers can write. Protecting the only write path is critical for this data.

**Fix:** Restrict the `/_/` nginx block to known IP addresses, or at minimum add rate limiting before the block is deployed. If operator IPs are dynamic, add HTTP basic auth as an outer layer:

```nginx
# Option A: IP allowlist (preferred)
location /_/ {
    allow 203.0.113.5;   # operator IP
    deny all;
    proxy_set_header Connection '';
    proxy_http_version 1.1;
    proxy_read_timeout 360s;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://127.0.0.1:8090;
}

# Option B: Rate limiting (add to http {} block, then reference here)
# limit_req_zone $binary_remote_addr zone=admin:10m rate=5r/m;
# limit_req zone=admin burst=3 nodelay;
```

If the admin UI is never needed publicly (admin operations are done via API or SSH tunnel), consider removing the `/_/` location block entirely and accessing the admin UI through an SSH tunnel:

```bash
ssh -L 8090:127.0.0.1:8090 user@andescode.com.ar
# Then access: http://localhost:8090/_/
```

---

## Warnings

### WR-01: PocketBase SDK Version (0.27) is 9 Minor Versions Behind the Running Server (0.36)

**File:** `package.json` (dependency) vs `deploy/ecosystem.config.cjs:3` (server version)

**Issue:** The PocketBase JS client SDK installed is `0.27.0` while the server binary in production is `v0.36.6`. The SDK changelog confirms `0.27.0` was released to support server `0.39.0` preview features, but PocketBase SDK versioning tracks closely with server releases. Server versions `0.28` through `0.36` may have introduced API changes, new field types, or auth flow changes not reflected in SDK `0.27`. The Phase 2 PocketBase client will be built against `0.27` while running against a `0.36` server — any schema or API mismatch will surface as runtime errors.

**Fix:** Update the SDK to match or exceed the server version before Phase 2 implementation begins:

```bash
npm install pocketbase@^0.36.0
```

Verify the updated version still resolves against the running server before writing Phase 2 client code.

---

### WR-02: Gate 2 Note May Mask a Real `listRule` Misconfiguration

**File:** `deploy/README.md:221-222`

**Issue:** The Gate 2 verification note states: "PocketBase v0.23+ returns `200 {"items":[],...}` (empty list) instead of `403` when `listRule` is an expression that doesn't match the current auth." This behavioral claim is not accurate for PocketBase v0.36. When `listRule` is set to an expression (`@request.auth.id != ""`), PocketBase v0.23+ still returns `403` for unauthenticated requests — it does NOT silently return a 200 with an empty list. A 200 empty list response to an unauthenticated list request is a symptom of `listRule` being misconfigured as an empty string `""` (public access), not of correct behavior in a newer PB version.

The gate results table (line 232) already recorded a 200 response for Gate 2 and accepted it. If that 200 response is real and not a misread, the `listRule` may actually be `""` rather than `@request.auth.id != ""` — which would expose all DNI data to the public.

**Fix:** Verify the actual `listRule` value in the running PocketBase admin UI or via sqlite3:

```bash
# SSH into VPS and run:
sqlite3 /home/pocketbase/pb/pb_data/data.db \
  "SELECT name, list_rule FROM _collections WHERE name='certificates';"
# Expected output:
# certificates|@request.auth.id != ""
```

If the query returns `certificates|` (empty) or `certificates|null`, the listRule is wrong and must be corrected immediately. Update the Gate 2 note to remove the inaccurate behavioral claim so future operators do not accept a 200 response as valid.

---

### WR-03: Committed `.env` File Has No Guard Against Future Secret Addition

**File:** `.gitignore:16-19` and `.env:1-3`

**Issue:** Both `.env` and `.env.production` are intentionally committed to git and currently contain only the public VPS URL — no secrets. However, the `.gitignore` comment explains the reasoning but there is no technical control preventing a future developer from adding a `VITE_POCKETBASE_ADMIN_PASSWORD=...` or similar secret to `.env` and committing it. Once committed, git history retains secrets permanently even after deletion. PocketBase requires no secrets on the frontend (all auth is runtime via the admin UI), but as Phase 2 and Phase 3 add functionality the temptation to add credentials to `.env` will grow.

**Fix:** Add a `.env.example` file that documents all acceptable variables, and add a pre-commit hook or CI check to scan for credential patterns in `.env` before commit. At minimum, add a comment to `.env` explicitly listing what is and is not acceptable:

```bash
# .env
# ACCEPTABLE: public infrastructure URLs (no auth tokens, no passwords, no private keys)
# NEVER ADD: POCKETBASE_ADMIN_*, SECRET_*, *_PASSWORD, *_TOKEN, *_KEY
VITE_POCKETBASE_URL=https://andescode.com.ar
```

---

## Info

### IN-01: Migration Down Function Will Throw Uncaught Error if Collection Does Not Exist

**File:** `pb_migrations/1780790669_create_certificates.js:76-77`

**Issue:** The `down()` function calls `app.findCollectionByNameOrId("certificates")` without a try-catch. If the collection was partially created or already deleted, `findCollectionByNameOrId` throws and the migration runner surfaces an unhandled error. PocketBase will report the rollback as failed and may leave the migration state inconsistent. This is low impact in normal operation (migrations are applied once, rolled back only in failure scenarios) but adds friction during development iteration.

**Fix:** Wrap the down logic in a try-catch or use a conditional check:

```javascript
(app) => {
  try {
    let collection = app.findCollectionByNameOrId("certificates");
    app.delete(collection);
  } catch (_) {
    // Collection already gone — nothing to roll back
  }
}
```

---

_Reviewed: 2026-06-07T21:30:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
