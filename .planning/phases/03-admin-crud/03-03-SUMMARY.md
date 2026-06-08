---
phase: 03-admin-crud
plan: "03"
subsystem: admin-panel
tags: [admin, revoke, reactivate, qr-download, confirm-modal, pocketbase]
dependency_graph:
  requires: [03-02]
  provides: [ADMIN-08, ADMIN-09, ADMIN-10]
  affects: [src/pages/admin/index.tsx, src/sections/admin/AdminCertificateList.tsx]
tech_stack:
  added: []
  patterns:
    - ConfirmModal with useEffect Escape-to-close
    - CertificateRowQRDownload lazy-mount off-screen QRCodeSVG
    - XMLSerializer + Blob + URL.createObjectURL SVG download
    - confirmModal state object with action derived from certificate status
    - refreshKey increment for post-mutation list re-fetch
key_files:
  created:
    - src/sections/admin/ConfirmModal.tsx
  modified:
    - src/sections/admin/AdminCertificateList.tsx
    - src/pages/admin/index.tsx
decisions:
  - D-07 implemented: revoke/reactivate toggle buttons in list rows, openConfirm(cert) wired to onToggleStatus
  - D-08 implemented: ConfirmModal shows student name + code, color-coded confirm button, Escape closes
  - D-09 implemented: per-row QR download button always visible, self-contained CertificateRowQRDownload
  - D-10 implemented: client-side SVG serialization via XMLSerializer + Blob download, no server involvement
metrics:
  duration: ~20 min
  completed: "2026-06-08"
  tasks_completed: 3
  files_changed: 3
---

# Phase 03 Plan 03: Revoke/Reactivate + QR Download Summary

**One-liner:** Revoke/reactivate behind a color-coded confirmation modal and per-row QR SVG download via XMLSerializer, completing the admin CRUD lifecycle.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create ConfirmModal (revoke/reactivate) | 34acf30 | src/sections/admin/ConfirmModal.tsx |
| 2 | Wire QR SVG download into list rows | 2eef20d | src/sections/admin/AdminCertificateList.tsx |
| 3 | Wire ConfirmModal + status updates into AdminPage orchestrator | a0d9ffd | src/pages/admin/index.tsx |
| 4 | Human verification checkpoint | — | awaiting user |

## What Was Built

### Task 1 — ConfirmModal

Created `src/sections/admin/ConfirmModal.tsx` as the default export. Props: `{ open, record, action, loading, error, onConfirm, onCancel }`.

Key behaviors:
- Returns `null` when `!open || !record` (guard clause after hooks per React rules)
- `useEffect` registers `window` keydown listener calling `onCancel` on `Escape` when `open` is true; cleans up on unmount/close
- Revoke: heading "¿Revocar este certificado?" + `bg-red-600` confirm button labeled "Revocar"
- Reactivate: heading "¿Reactivar este certificado?" + `bg-green-600` confirm button labeled "Reactivar"
- Body renders `{record.certificateCode}` and `{record.studentName}` via JSX spans (no `dangerouslySetInnerHTML`)
- Loading state: spinner SVG + "Revocando…"/"Reactivando…", confirm button `disabled`
- Inline error (`bg-red-50 border-red-200`) above button row when `error` prop is set
- Cancel buttons: "No revocar"/"No reactivar" via `btn-secondary`

### Task 2 — QR SVG Download

Extended `src/sections/admin/AdminCertificateList.tsx`:
- Added `import { QRCodeSVG } from 'qrcode.react'` and `useRef` from React
- Added `CertificateRowQRDownload` helper component (co-located in the same file)
- Renders `QRCodeSVG` off-screen (`position: absolute; left: -9999px`) with `level="H"`, `size={256}`, `marginSize={4}`
- `verificationUrl = window.location.origin + '/certificados/' + certificateCode` (code comment documents dev-origin behavior per RESEARCH Pitfall 6)
- Download handler: `XMLSerializer().serializeToString(svgRef.current)` → `Blob('image/svg+xml')` → `URL.createObjectURL` → `<a download="QR-{code}.svg">` → `URL.revokeObjectURL`
- Button: `title="Descargar QR"`, `aria-label` template literal referencing `certificateCode`
- Removed `onDownloadQR` prop from interface (self-contained, no orchestrator wiring)

### Task 3 — AdminPage Orchestrator

Extended `src/pages/admin/index.tsx`:
- Imported `ConfirmModal`
- Added state: `confirmModal: { open, record, action }`, `statusUpdating`, `statusError`
- `openConfirm(record)`: derives `action = record.status === 'active' ? 'revoke' : 'reactivate'`
- `cancelConfirm()`: closes modal, clears `statusError`
- `updateCertificateStatus(id, newStatus)`: calls `pb.collection('certificates').update(id, { status: newStatus })`
- `confirmStatusChange()`: async function that sets `statusUpdating`, calls `updateCertificateStatus`, on success increments `refreshKey` (re-fetch per RESEARCH Pitfall 5), on failure sets `statusError`
- Wired `AdminCertificateList` prop `onToggleStatus={(cert) => openConfirm(cert)}`
- Rendered `<ConfirmModal>` after `<AdminCertificateDrawer>` with `loading={statusUpdating}` and `error={statusError}`

## Deviations from Plan

None — plan executed exactly as written. The `node_modules` directory was absent from the worktree at start; `npm install` was run to install dependencies (including `qrcode.react@4.2.0` which was already in `package.json` from Plan 01).

## Verification

- `npx tsc --noEmit` passes with no type errors
- `npm run build` succeeds (build output ✓ 1.16s)
- `ConfirmModal`: Escape calls `onCancel` ✓, `bg-red-600` for revoke ✓, `bg-green-600` for reactivate ✓
- `AdminCertificateList`: `QRCodeSVG` with `level="H"` off-screen ✓, `XMLSerializer` download ✓
- `AdminPage`: `onToggleStatus` wired ✓, `status:` update call wired ✓, `ConfirmModal` rendered ✓

## Awaiting Human Verification

Task 4 is a `checkpoint:human-verify`. The user must:

1. Run `npm run dev`, log in at `/admin/login`, go to `/admin`
2. Confirm list columns (Código, Nombre, Fecha, Estado) + search/filter/pagination
3. Create a certificate: code pre-filled as AC-YYYY-NNN, required field validation, tags via Enter
4. Edit a certificate: change a field, save, confirm public page reflects change
5. Revoke: toggle active cert → red modal with name + code → confirm → badge "Revocado" → public shows REVOKED; then reactivate via green modal
6. QR download: row icon → QR-{code}.svg downloads → scans to /certificados/{code}
7. Escape closes the confirm modal without status change

Resume signal: type "approved" or describe issues.

## Known Stubs

None — all functionality is fully wired.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced beyond those in the plan's threat model. All certificate values rendered via JSX (no `dangerouslySetInnerHTML`). QR value is a plain URL string. Status update goes through `pb.collection('certificates').update()` which is protected by PocketBase `updateRule` + auth (T-03-STATUS-AUTHZ — accepted).

## Self-Check

Files verified:
- `src/sections/admin/ConfirmModal.tsx`: EXISTS
- `src/sections/admin/AdminCertificateList.tsx`: EXISTS (modified)
- `src/pages/admin/index.tsx`: EXISTS (modified)

Commits verified:
- 34acf30: feat(03-03): create ConfirmModal
- 2eef20d: feat(03-03): wire QR SVG download
- a0d9ffd: feat(03-03): wire ConfirmModal and status updates

## Self-Check: PASSED
