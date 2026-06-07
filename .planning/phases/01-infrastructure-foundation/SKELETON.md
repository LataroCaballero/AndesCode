# Walking Skeleton — AndesCode Sistema de Certificados Verificables

**Phase:** 1
**Generated:** 2026-06-06

## Capability Proven End-to-End

Anyone can fetch a real certificate record by ID over HTTPS at `https://andescode.com.ar/api/collections/certificates/records/:id` with no auth, while unauthenticated listing is blocked (403) and the React app can read `import.meta.env.VITE_POCKETBASE_URL` — proving the full stack (browser → nginx → PocketBase → SQLite) is wired and secured.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Backend | PocketBase (latest stable 0.27.x) self-hosted on VPS | Project constraint — single binary BaaS, no external DB/Supabase/Firebase |
| Process management | PM2 with `interpreter: "none"` bound to `127.0.0.1:8090` | D-04: PM2 already on VPS; loopback bind keeps PocketBase off the public port |
| Reverse proxy / TLS | Existing nginx + Let's Encrypt, same-domain split (`/api/`, `/_/`, SPA `try_files`) | D-01/D-03: SSL already configured; same-origin eliminates CORS entirely |
| Schema management | PocketBase JS migrations in `pb_migrations/` (git-versioned) | D-08: reproducible schema-as-code; auto-applied on serve via `--migrationsDir` |
| Access control | PocketBase API rules: `listRule='@request.auth.id != ""'`, `viewRule=""`, writes=null | D-10: public verify-by-ID, auth-gated list (no DNI enumeration), superuser-only writes |
| Frontend env | Vite `VITE_POCKETBASE_URL` in `.env`/`.env.production` + `vite-env.d.ts` augmentation | D-09: dev and prod both target the VPS; type-safe `import.meta.env` access |
| Backups | PocketBase native backup, nightly cron, `maxKeep=7` | D-11/D-12/D-13: local disk, 7-day retention, native mechanism (no custom shell script) |
| Directory layout | `pb_migrations/` + `deploy/` (ecosystem.config + runbook) in repo; PocketBase at `/home/[user]/pocketbase/` on VPS | D-05: infra-as-code in repo, runtime data in user home |

## Stack Touched in Phase 1

- [x] Project scaffold — `pocketbase` SDK already in package.json; `pb_migrations/`, `.env`, `deploy/` created
- [x] Routing — nginx splits `/api/*` and `/_/*` to PocketBase, all else to the SPA
- [x] Database — `certificates` collection created (migration) with a real read (public view-by-id 200) and a real write (test record created in admin UI)
- [x] UI — frontend reads `import.meta.env.VITE_POCKETBASE_URL` (verified in browser DevTools); no feature UI yet (Phase 2)
- [x] Deployment — PocketBase running under PM2 on the production VPS, reachable over HTTPS; reboot-persistent via `pm2 startup`

## Out of Scope (Deferred to Later Slices)

- Admin login UI and session persistence (Phase 2 — AUTH-*)
- Public verification page `/certificados` and `/certificados/:code` (Phase 2 — VERIF-*, VIS-*)
- Admin CRUD panel: list, create/edit forms, revoke/reactivate (Phase 3 — ADMIN-*)
- QR generation, PDF download, HTML certificate reproduction (Phase 4 — QRPDF-*, VIS-01)
- `technologies`/`competencies` taxonomy enforcement (json now; client-side structure in Phase 3)
- Badges, advanced social sharing, statistics dashboard (v2)

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions:

- **Phase 2:** Admin logs in with persistent session; anyone verifies a certificate instantly at `/certificados/:code` with no account.
- **Phase 3:** Admin manages the full certificate lifecycle (create with auto `AC-YYYY-NNN`, edit, revoke/reactivate) from the panel.
- **Phase 4:** Verification page is print-ready — QR (error correction H), self-hosted-font PDF download, and an HTML/CSS reproduction of the physical certificate.
