---
phase: 03-admin-crud
plan: "02"
subsystem: admin-panel
tags: [admin, certificate-form, drawer, framer-motion, validation, pocketbase-crud]
dependency_graph:
  requires:
    - 03-01 (AdminPage orchestrator, AdminCertificateList, TagsInput, AdminTopBar)
    - phase-02 (AdminGuard, PocketBaseContext, Certificate type, pb singleton)
  provides:
    - AdminCertificateDrawer slide-in framer-motion shell
    - AdminCertificateForm 14-field create/edit form with client validation
    - AdminPage extended with drawer state, generateNextCertificateCode, scroll lock
  affects:
    - src/pages/admin/index.tsx (extended with drawer wiring)
    - Plans 03 (can add onToggleStatus/onDownloadQR on top of this orchestrator)
tech_stack:
  added: []
  patterns:
    - framer-motion AnimatePresence for slide-in/slide-out drawer (import from 'framer-motion')
    - Client-side required-field gate before PocketBase create/update (T-03-VALIDATION)
    - validation_not_unique 400 error mapped to actionable copy (T-03-UNIQUE)
    - generateNextCertificateCode via getList(1,1) filtered by year created range
    - body.style.overflow='hidden' scroll lock in useEffect cleanup (Pitfall 4)
    - refreshKey increment in onSaved() to retrigger list re-fetch (Pitfall 5)
key_files:
  created:
    - src/sections/admin/AdminCertificateDrawer.tsx
    - src/sections/admin/AdminCertificateForm.tsx
  modified:
    - src/pages/admin/index.tsx
decisions:
  - "Form field layout: left col = studentName/dni/university/degree/supervisorName/score; right col = certificateCode/issueDate/startDate/endDate; full-width = description/technologies/competencies"
  - "status field excluded from form — changed only via revoke/reactivate buttons with confirmation (D-07/D-08)"
  - "generateNextCertificateCode uses totalItems from getList — acceptable race condition for single-admin v1; UNIQUE index is the collision guard (Pitfall 3)"
  - "initialCode prop on drawer/form — orchestrator generates code before opening drawer; form can override"
metrics:
  duration: "~60 minutes"
  completed: "2026-06-08"
  tasks_completed: 3
  tasks_total: 3
  files_created: 2
  files_modified: 1
---

# Phase 03 Plan 02: Certificate Create/Edit Drawer Summary

**One-liner:** framer-motion slide-in drawer with 14-field form, AC-YYYY-NNN auto-generated editable code, client-side required-field validation, and PocketBase create/update with duplicate-code error handling — ADMIN-04/05/06/07 satisfied.

---

## Objective

Add the create and edit vertical slice to the admin panel. The admin can click "Nuevo certificado" to open a slide-in drawer, receive an auto-generated editable AC-YYYY-NNN code, fill all 14 certificate fields with client-side required-field validation, and save to PocketBase. The same drawer pre-populated edits any existing certificate.

---

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create AdminCertificateDrawer (framer-motion shell) | `6869213` | src/sections/admin/AdminCertificateDrawer.tsx |
| 2 | Create AdminCertificateForm (14 fields, validation, create/update) | `815d4ef` | src/sections/admin/AdminCertificateForm.tsx |
| 3 | Wire drawer + code generation into AdminPage orchestrator | `8cd64ef` | src/pages/admin/index.tsx |

---

## What Was Built

### AdminCertificateDrawer (`src/sections/admin/AdminCertificateDrawer.tsx`)

Framer-motion slide-in shell. Props: `{ open, mode, record, initialCode, onClose, onSaved }`. Renders `<AnimatePresence>` wrapping two `motion.div` elements when `open` is true:
- Backdrop: `fixed inset-0 bg-black/30 z-40`, `opacity 0->1` on enter, click calls `onClose`
- Panel: `fixed right-0 top-0 h-full w-full max-w-[600px] bg-white shadow-2xl z-50 overflow-y-auto`, `x: '100%' -> 0` on enter, `x: 0 -> '100%'` on exit, tween 200ms easeOut

Import: `from 'framer-motion'` (not `motion/react` — Pitfall 2 avoided). Renders `AdminCertificateForm` with all props passed through.

### AdminCertificateForm (`src/sections/admin/AdminCertificateForm.tsx`)

14-field create/edit form. Props: `{ mode, record, initialCode, onClose, onSaved }`.

Field layout (two-column grid `grid-cols-1 sm:grid-cols-2`):
- Left column: studentName*, dni*, university*, degree*, supervisorName*, score (optional)
- Right column: certificateCode* (fira-code-regular, pre-populated), issueDate*, startDate*, endDate*
- Full-width (sm:col-span-2): description (textarea), technologies (TagsInput), competencies (TagsInput)

`status` field intentionally excluded — changed only via revoke/reactivate buttons (D-07/D-08).

Validation:
- `requiredFields`: certificateCode, studentName, dni, university, degree, startDate, endDate, issueDate, supervisorName (9 fields)
- Submit computes missing fields, sets `fieldErrors` with `border-red-400` + red helper text, returns WITHOUT calling PocketBase (T-03-VALIDATION)
- On validation pass: calls `pb.collection('certificates').create(data)` or `.update(record.id, data)`
- Error handling: `validation_not_unique` -> "El codigo ya existe. Modifica el codigo e intenta de nuevo."; else "Error al guardar. Intenta de nuevo."

Save button shows spinner + "Guardando..." while `saving`. All values via JSX `{value}` — no `dangerouslySetInnerHTML` (T-03-XSS).

### AdminPage orchestrator extensions (`src/pages/admin/index.tsx`)

Added state: `drawerOpen`, `drawerMode`, `drawerRecord`, `generatedCode`.

`generateNextCertificateCode()`: calls `pb.collection('certificates').getList(1, 1, { filter: 'created >= "YYYY-01-01 00:00:00" && created <= "YYYY-12-31 23:59:59"', sort: '-certificateCode', fields: 'certificateCode' })`, returns `AC-${year}-${String(totalItems + 1).padStart(3, '0')}`.

`openDrawer(mode, cert?)`: sets mode/record, generates code on create (or clears on edit), sets `drawerOpen = true`.

`closeDrawer()`: sets `drawerOpen = false`.

`onSaved()`: calls `closeDrawer()` then increments `refreshKey` to trigger list re-fetch.

Scroll lock `useEffect`: `document.body.style.overflow = 'hidden'` when drawer open, restored via cleanup function.

`onCreateNew` and `onEdit` placeholders from Plan 01 replaced with real `openDrawer` calls.

---

## Verification Results

- `npx tsc --noEmit` — PASS (0 type errors)
- `npm run build` — PASS (built in ~1s)
- `grep -q "from 'framer-motion'" AdminCertificateDrawer.tsx` — PASS
- `grep "motion/react" src/sections/admin/AdminCertificateDrawer.tsx` — no matches (PASS)
- `grep -Eq "\.(create|update)\(" AdminCertificateForm.tsx` — PASS
- `grep -q "validation_not_unique" AdminCertificateForm.tsx` — PASS
- `grep -q "TagsInput" AdminCertificateForm.tsx` — PASS
- `grep "dangerouslySetInnerHTML" AdminCertificateForm.tsx` — no matches (PASS)
- `grep -q "AdminCertificateDrawer" index.tsx` — PASS
- `grep -q "generateNextCertificateCode" index.tsx` — PASS
- `grep -q "body.style.overflow" index.tsx` — PASS
- requiredFields array: 9 fields confirmed (certificateCode, studentName, dni, university, degree, startDate, endDate, issueDate, supervisorName)

---

## Deviations from Plan

### Pre-execution Fix [Rule 3 - Blocking]

**Found during:** Worktree branch check (before Task 1)
**Issue:** The worktree branch `worktree-agent-ad24ce59196d57787` was set to `ff3f89e` (an older main commit predating Phase 01 admin work at `6a1e189`). The admin files built in Plan 01 were absent from the working directory.
**Fix:** `git reset --hard 6a1e189` on the worktree branch to align with the correct base. No task file changes were lost.
**Impact:** None to plan deliverables.

No other deviations — plan executed exactly as written.

---

## Known Stubs

`onToggleStatus` and `onDownloadQR` on `AdminCertificateList` remain as optional props (undefined, no-op). These are intentional placeholders for Plan 03. They do not block Plan 02's deliverables (ADMIN-04/05/06/07).

---

## Threat Surface Scan

No new threat surface beyond the plan's threat model. All STRIDE mitigations applied:

- **T-03-VALIDATION**: Client-side required-field gate and guarded return before pb.create/update confirmed
- **T-03-UNIQUE**: validation_not_unique caught and mapped to actionable copy
- **T-03-TOKEN**: Accepted — token expiry handled by AdminGuard 401 redirect
- **T-03-XSS**: All form values via JSX {value} — no dangerouslySetInnerHTML

---

## Self-Check: PASSED

All files exist and all commits verified:
- FOUND: src/sections/admin/AdminCertificateDrawer.tsx
- FOUND: src/sections/admin/AdminCertificateForm.tsx
- FOUND: src/pages/admin/index.tsx (modified)
- FOUND commit: 6869213 (Task 1)
- FOUND commit: 815d4ef (Task 2)
- FOUND commit: 8cd64ef (Task 3)
