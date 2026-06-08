---
phase: 01-infrastructure-foundation
plan: 01
subsystem: infrastructure
tags: [pocketbase, migration, vite-env, pm2, nginx, deploy]
dependency_graph:
  requires: []
  provides:
    - pb_migrations/1780790669_create_certificates.js
    - .env
    - .env.production
    - src/vite-env.d.ts (VITE_POCKETBASE_URL type augmentation)
    - deploy/ecosystem.config.cjs
    - deploy/README.md
  affects:
    - Plan 02 (VPS deploy — consumes deploy/ artifacts)
    - Plan 03 (Verification — depends on migration schema)
    - All future plans using import.meta.env.VITE_POCKETBASE_URL
tech_stack:
  added: []
  patterns:
    - PocketBase JS migration format (migrate callback, new Collection, app.save, app.delete)
    - Vite ImportMetaEnv global augmentation (no imports in .d.ts)
    - PM2 ecosystem config for non-Node binary (interpreter: "none")
key_files:
  created:
    - pb_migrations/1780790669_create_certificates.js
    - .env
    - .env.production
    - deploy/ecosystem.config.cjs
    - deploy/README.md
  modified:
    - src/vite-env.d.ts
    - .gitignore
decisions:
  - "Use json type for technologies and competencies fields (free-form tags, not pre-defined select values) per RESEARCH open question A1"
  - "ecosystem.config uses .cjs extension because project has type:module in package.json; PM2 accepts .cjs identically"
  - ".env and .env.production committed to git (contain only public VPS URL, no secrets per T-01-02 acceptance)"
metrics:
  duration_seconds: 312
  completed_date: "2026-06-07"
  tasks_completed: 3
  tasks_total: 3
  files_created: 5
  files_modified: 2
---

# Phase 01 Plan 01: Infrastructure Source-of-Truth Artifacts Summary

**One-liner:** PocketBase JS migration for certificates collection (14 fields, D-10 API rules, UNIQUE index) + Vite env wiring with TypeScript augmentation + PM2 ecosystem config and deploy runbook versioned in repo.

---

## What Was Built

All repo-side source-of-truth artifacts for the infrastructure layer, ready for Plan 02 to deploy mechanically:

1. **`pb_migrations/1780790669_create_certificates.js`** — PocketBase migration that creates the `certificates` base collection with all 14 fields (INFRA-04), exact D-10 API rules (INFRA-06), and a UNIQUE index on `certificateCode` (INFRA-05). Reversible via down migration.

2. **`.env` + `.env.production`** — Vite environment files setting `VITE_POCKETBASE_URL=https://andescode.com.ar`. Both committed to git (contain only the public VPS URL; no secrets). `.env.local` remains git-ignored via `*.local` rule.

3. **`src/vite-env.d.ts`** — Augmented with `ImportMetaEnv { readonly VITE_POCKETBASE_URL: string }` and `ImportMeta { readonly env: ImportMetaEnv }`. No import statements (global augmentation preserved). `tsc` passes strict mode with the new type.

4. **`.gitignore`** — Added explicit `# Env` section with `.env.local` and `.env.*.local` rules to clarify intent alongside the existing `*.local` catch-all.

5. **`deploy/ecosystem.config.cjs`** — PM2 config with `interpreter: "none"` (required for PocketBase binary), `--http=127.0.0.1:8090` (D-06), `--migrationsDir` flag (RESEARCH Pitfall 5), and `__USER__` placeholder token.

6. **`deploy/README.md`** — 8-step VPS deploy runbook: nginx audit, PocketBase binary install, migration copy, PM2 start/save/startup, nginx `/api/` + `/_/` + `/` blocks with `proxy_buffering off`, firewall port 8090 block, superuser creation, and phase-gate curl verification commands.

---

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Create the certificates collection migration | 84a88e9 | pb_migrations/1780790669_create_certificates.js |
| 2 | Wire Vite env vars and TypeScript augmentation | 1ecef57 | .env, .env.production, src/vite-env.d.ts, .gitignore |
| 3 | Version the PM2 ecosystem config and deploy runbook | e6072d8 | deploy/ecosystem.config.cjs, deploy/README.md |

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] ecosystem.config.js renamed to ecosystem.config.cjs**
- **Found during:** Task 3
- **Issue:** The plan specified `deploy/ecosystem.config.js` but the project has `"type": "module"` in `package.json`. Node.js treats `.js` files as ES modules in this project, making `require('./deploy/ecosystem.config.js')` fail with `TypeError: Cannot read properties of undefined`. The plan's verification command uses `require()`.
- **Fix:** Renamed to `deploy/ecosystem.config.cjs`. The `.cjs` extension forces CommonJS regardless of `package.json` `type` field. PM2 accepts `.cjs` files identically to `.js` files. Updated `deploy/README.md` references accordingly and added explanatory comment in the file header.
- **Files modified:** `deploy/ecosystem.config.cjs` (renamed from `.js`), `deploy/README.md`
- **Commit:** e6072d8
- **Impact on Plan 02:** Use `pm2 start ecosystem.config.cjs` instead of `pm2 start ecosystem.config.js`. Behavior is identical.

---

## Verification Results

All plan-level checks pass:

- `npm run build` (tsc strict + vite build) exits 0 with augmented `vite-env.d.ts`
- Migration grep confirms exact D-10 API rules (`listRule: '@request.auth.id != ""'`, `viewRule: ""`, `createRule: null`) and the UNIQUE index
- `git check-ignore .env` returns nothing (`.env` is committed); `git check-ignore .env.local` returns `.env.local` (ignored)
- `deploy/ecosystem.config.cjs` requires cleanly with `name: "pocketbase"`, `interpreter: "none"`, `--http=127.0.0.1:8090`, `--migrationsDir`
- `deploy/README.md` contains all required sections: nginx -T, pm2 start, pm2 save, pm2 startup, proxy_buffering off, 8090, location /api/, location /_/

---

## Requirements Coverage

| Requirement | Artifact | Status |
|-------------|----------|--------|
| INFRA-04 (all 14 schema fields) | pb_migrations/1780790669_create_certificates.js | Covered |
| INFRA-05 (UNIQUE index on certificateCode) | pb_migrations/1780790669_create_certificates.js | Covered |
| INFRA-06 (exact D-10 API rules) | pb_migrations/1780790669_create_certificates.js | Covered |
| INFRA-08 (VITE_POCKETBASE_URL in .env + type augmentation) | .env, .env.production, src/vite-env.d.ts | Covered |

---

## Known Stubs

None — all files deliver their complete intended artifacts with no placeholder data flowing to any rendering path.

The `__USER__` token in `deploy/ecosystem.config.cjs` is an intentional deploy-time substitution marker, not a UI stub. Plan 02 resolves it via the `nginx -T` audit (D-02).

---

## Threat Flags

No new threat surface beyond the plan's threat model. All mitigations from T-01-01 (listRule auth expression) and T-01-03 (createRule/updateRule/deleteRule = null) are implemented in the migration. T-01-02 (committed env files) accepted per plan — files contain only the public VPS URL.

## Self-Check: PASSED
