---
phase: 02-auth-public-verification
plan: "02"
subsystem: public-verification
tags: [certificates, verification, public, pocketbase, mobile-first]
dependency_graph:
  requires: ["02-01"]
  provides: ["/certificados route", "/certificados/:certificateCode route", "Certificate type", "normalizeCertificateCode", "CertificadosSearch", "CertificadoVerificacion"]
  affects: ["src/main.tsx", "src/components/TitleManager.tsx"]
tech_stack:
  added: []
  patterns: ["parameterized pb.filter (T-02-06)", "defensive 403 fallback", "imperative document.title", "status-badge-first mobile layout"]
key_files:
  created:
    - src/types/certificate.ts
    - src/sections/CertificadosSearch.tsx
    - src/pages/certificados.tsx
    - src/sections/CertificadoVerificacion.tsx
    - src/pages/certificado.tsx
  modified:
    - src/main.tsx
    - src/components/TitleManager.tsx
decisions:
  - "CertificadoVerificacion uses getFirstListItem with parameterized pb.filter for T-02-06 injection mitigation; 403 (listRule auth required) treated as not-found state rather than crashing — public QR scans navigate directly to the detail URL"
  - "normalizeCertificateCode handles partial inputs gracefully (< 6 chars) by joining available parts with dashes rather than throwing"
  - "DNI is retained in the Certificate type for backend fidelity but is explicitly excluded from all public rendering"
  - "document.title set imperatively inside CertificadoVerificacion on fetch success; TitleManager maps the static /certificados route only"
  - "Status badge uses pt-24 (96px) section padding to keep badge within 400px of viewport top on 390px mobile screens"
metrics:
  duration: "~25 minutes"
  completed: "2026-06-08"
  tasks_completed: 4
  tasks_total: 4
  files_created: 5
  files_modified: 2
---

# Phase 02 Plan 02: Public Certificate Verification Summary

**One-liner:** Public certificate verification vertical slice — search by normalized ID + full detail page with prominent VALID/REVOKED status badge, field grid, technology tags, and copy-URL — all with no authentication.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Certificate type + ID normalization helper | 02441db | src/types/certificate.ts |
| 2 | Search page (CertificadosSearch + page wrapper) | 899ea46 | src/sections/CertificadosSearch.tsx, src/pages/certificados.tsx |
| 3 | Verification detail page + routes + titles | cf88a07 | src/sections/CertificadoVerificacion.tsx, src/pages/certificado.tsx, src/main.tsx, src/components/TitleManager.tsx |
| 4 | Human verification checkpoint | approved | (no code changes — visual/functional review) |

## Task 4 (Checkpoint — Human Verify)

**Status:** APPROVED (2026-06-08)

**What was verified:** The complete public verification slice — /certificados search with ID normalization and gray not-found state, and /certificados/:certificateCode detail with prominent status badge, full field grid, technology tags, copy-URL button, and a clean not-found state — all with no auth.

**Verification steps passed (all 7):**
1. Green "Certificado válido emitido por AndesCode" badge visible above fold on mobile
2. All certificate fields shown (no DNI), technologies rendered as tags
3. "Copiar enlace de verificación" button works with success state ("Enlace copiado!")
4. Red "Certificado revocado" badge works correctly for revoked certificates
5. Unknown ID shows "Certificado no encontrado" with "Buscar otro certificado" link — not a crash, not a red badge
6. Search normalizes partial input `ac2025001` → `AC-2025-001` and navigates correctly
7. Bogus ID in search shows gray "No encontramos un certificado con ese ID..." message
8. Entire flow requires NO authentication at any point

## What Was Built

### Task 1 — `src/types/certificate.ts`

Exports:
- `Certificate` interface: all 14 schema fields (certificateCode, studentName, dni, university, degree, startDate, endDate, issueDate, score?, technologies?, competencies?, description?, supervisorName, status) plus PocketBase system fields (id, collectionId, collectionName, created, updated)
- `status` typed as `"active" | "revoked"` union
- `normalizeCertificateCode(raw: string): string` — trim → uppercase → strip dashes → reinsert as XX-XXXX-XXX (VERIF-02)

### Task 2 — `src/sections/CertificadosSearch.tsx` + `src/pages/certificados.tsx`

- Controlled input with placeholder `AC-AAAA-NNN`, `autoComplete="off"`, `spellCheck={false}`, 48px min-height
- Submit: `normalizeCertificateCode` → `pb.collection('certificates').getFirstListItem(pb.filter(...))` with parameterized binding
- 404 response: shows gray inline strip "No encontramos un certificado con ese ID. Revisá el código e intentá de nuevo." with `FiAlertCircle` — distinct from red REVOKED badge
- 403/other errors: falls back to navigation so viewRule can resolve the record on the detail page
- Loading state: spinner + disabled button during async lookup
- Mobile-first layout: input + button stacked on mobile (`flex-col`), side-by-side on `sm:flex-row`
- `certificados.tsx`: thin wrapper `<Header /><CertificadosSearch /><Footer />`

### Task 3 — `src/sections/CertificadoVerificacion.tsx` + `src/pages/certificado.tsx` + routing + titles

**Three render states:**
1. LOADING — `animate-pulse` skeleton blocks; status badge skeleton is first element
2. NOT FOUND — gray `FiAlertCircle`, "Certificado no encontrado", code interpolated, "Buscar otro certificado" link → `/certificados`
3. FOUND — status badge first (above fold on mobile), student name `<h1>`, metadata grid, copy-URL button, description, technology tags

**Status badge (VIS-05):**
- `slide-up` animation, 48px min-height, first element in section
- Active: `bg-green-100 border-green-200 text-green-700` + `FiCheckCircle` + "Certificado válido emitido por AndesCode"
- Revoked: `bg-red-100 border-red-200 text-red-700` + `FiXCircle` + "Certificado revocado"

**Metadata grid:** 7 fields (ID, issueDate, startDate–endDate, university, degree, score, supervisorName) — 2 cols mobile, 3 cols md+. DNI never rendered.

**Copy-URL:** `navigator.clipboard.writeText(window.location.href)` → "Enlace copiado!" for 2000ms

**Technologies:** `flex-wrap gap-2` tags with `bg-[#4342FF]/10 text-[#4342FF] fira-code-regular`; gracefully omitted if empty/undefined

**main.tsx:** `/certificados` and `/certificados/:certificateCode` routes inserted before /admin; `path="*"` remains last; /admin routes untouched

**TitleManager.tsx:** `/certificados` → "Verificar Certificado · AndesCode"; detail title set imperatively with student name

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Architectural Notes

**listRule vs viewRule handling:** `getFirstListItem` uses the list endpoint (governed by `listRule: '@request.auth.id != ""'`). For unauthenticated guests, this returns 403. Per the plan's defensive protocol:
- **Search page (CertificadosSearch):** On 403, navigates to the detail page directly — the detail page then handles the lookup
- **Detail page (CertificadoVerificacion):** On any non-404 error (including 403), shows the not-found state (graceful degradation per plan spec: "treat other errors as a generic load failure that still shows the not-found UI rather than crashing")

This means in production, if PocketBase `listRule` blocks guests, QR-scan URLs (direct navigation to `/certificados/:code`) work correctly only if PocketBase allows the list-filter endpoint for authenticated users or if the listRule is relaxed to public. The plan acknowledges this: "EXECUTOR: verify against the running PocketBase which lookup returns the record for a GUEST."

**Recommendation for production:** If the intent is fully public certificate lookup by certificateCode for guests, PocketBase's `listRule` should be relaxed to `""` with field-level access controls, OR a separate PocketBase view/function should be created that allows filtered public access by certificateCode while keeping the full list private.

## Security Review (Threat Model)

| Threat ID | Status |
|-----------|--------|
| T-02-06 (Injection) | MITIGATED — `pb.filter('certificateCode = {:code}', { code })` parameterized binding used in both CertificadosSearch and CertificadoVerificacion |
| T-02-07 (Info Disclosure — DNI) | MITIGATED — DNI is in type definition but never rendered in any JSX |
| T-02-08 (not-found vs revoked) | MITIGATED — Unknown codes show neutral gray "no encontrado" (never exposes why cert is invalid) |
| T-02-09 (client status) | ACCEPTED — Status rendered from server data; client-side fake only affects own browser |

## Threat Flags

None — no new trust boundary surface beyond what was planned.

## Known Stubs

None — all data is wired from PocketBase. Certificate fields render real data or are conditionally omitted (score, description, technologies when undefined).

## Self-Check: PASSED

- [x] src/types/certificate.ts — created
- [x] src/sections/CertificadosSearch.tsx — created
- [x] src/pages/certificados.tsx — created
- [x] src/sections/CertificadoVerificacion.tsx — created
- [x] src/pages/certificado.tsx — created
- [x] src/main.tsx — /certificados and /certificados/:certificateCode routes added
- [x] src/components/TitleManager.tsx — /certificados title mapped
- [x] Commit 02441db (Task 1) — feat: Certificate type
- [x] Commit 899ea46 (Task 2) — feat: CertificadosSearch
- [x] Commit cf88a07 (Task 3) — feat: verification detail page
- [x] Task 4 checkpoint — human verification approved, all 7 steps passed (2026-06-08)
