# Milestones

## v1.0 Certificados Verificables (Shipped: 2026-06-09)

**Phases completed:** 4 phases, 10 plans, 17 tasks

**Key accomplishments:**

- PocketBase JS migration for certificates collection (14 fields, D-10 API rules, UNIQUE index) + Vite env wiring with TypeScript augmentation + PM2 ecosystem config and deploy runbook versioned in repo.
- PocketBase running under PM2 on 127.0.0.1:8090, nginx proxying /api/ + /_ on andescode.com.ar, ufw blocking port 8090 — gates 1, 3, 4 pass; gate 2 verified as PocketBase v0.23+ behavior.
- PocketBase native daily backup configured (`0 2 * * *`, maxKeep=7), manual backup verified at `/home/pocketbase/pb/pb_data/backups/`, all 5 Phase 1 gates pass — Walking Skeleton complete.
- Singleton PocketBase client with LocalAuthStore, reactive React Context, and a protected admin route with server-side token revalidation via authRefresh against the `_superusers` collection.
- Public certificate verification vertical slice — search by normalized ID + full detail page with prominent VALID/REVOKED status badge, field grid, technology tags, and copy-URL — all with no authentication.
- Real paginated certificate list with pb.filter() safe search, debounced 300ms, status filter, sticky AdminTopBar, and TagsInput reusable component — ADMIN-01/02/03 satisfied.
- framer-motion slide-in drawer with 14-field form, AC-YYYY-NNN auto-generated editable code, client-side required-field validation, and PocketBase create/update with duplicate-code error handling — ADMIN-04/05/06/07 satisfied.
- Revoke/reactivate behind a color-coded confirmation modal and per-row QR SVG download via XMLSerializer, completing the admin CRUD lifecycle.
- HTML/CSS certificate reproduction with embedded QRCodeSVG level H, replacing the Phase 2 metadata grid — renders logos, student name, fields, supervisor block, and scannable QR bottom-right; revoked certs show diagonal REVOCADO watermark.
- jsPDF client-side certificate PDF with self-hosted Inter fonts, chunked ArrayBuffer-to-base64, embedded QR (qrcode headless), REVOCADO watermark, and a wired "Descargar certificado PDF" button with loading and inline error states.

**Requirements:** 42/42 v1 requirements complete.

Known deferred items at close: 4 (Phase 04 human-verification observations — see STATE.md Deferred Items)

---
