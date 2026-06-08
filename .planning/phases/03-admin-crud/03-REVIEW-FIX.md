---
phase: 03-admin-crud
fixed_at: 2026-06-08T00:00:00Z
review_path: .planning/phases/03-admin-crud/03-REVIEW.md
iteration: 1
findings_in_scope: 9
fixed: 9
skipped: 0
status: all_fixed
---

# Phase 03: Code Review Fix Report

**Fixed at:** 2026-06-08T00:00:00Z
**Source review:** .planning/phases/03-admin-crud/03-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 9 (3 Critical + 6 Warning)
- Fixed: 9
- Skipped: 0

## Fixed Issues

### CR-01: Certificate code generation is racy — duplicate codes possible under concurrent creates

**Files modified:** `src/pages/admin/index.tsx`
**Commit:** a318a22
**Applied fix:** Replaced the `totalItems + 1` strategy with a prefix-based lookup (`certificateCode ~ {:prefix}`) that sorts descending and increments from the highest existing code. This eliminates both the race-condition window (two simultaneous creates reading the same count) and the year-boundary timezone bug (no longer filters on `created` with bare datetime strings). Added `'$autoCancel': false` in the same change (see CR-03).

---

### CR-02: Unparameterized `status` value interpolated directly into PocketBase filter string — injection risk

**Files modified:** `src/pages/admin/index.tsx`
**Commit:** a318a22
**Applied fix:** Replaced `filterParts.push(\`status = "${filter}"\`)` with `filterParts.push(pb.filter('status = {:status}', { status: filter }))`, consistent with the search filter pattern already used three lines above. The inline comment warning against direct concatenation now matches the actual implementation.

---

### CR-03: `$autoCancel: false` missing from `generateNextCertificateCode` — request cancelled in React 19 Strict Mode

**Files modified:** `src/pages/admin/index.tsx`
**Commit:** a318a22
**Applied fix:** Added `'$autoCancel': false` to the `getList` call inside `generateNextCertificateCode`. Fixed together with CR-01 since the entire function was rewritten to use the safer prefix-based approach.

---

### WR-01: Scroll lock effect returns no cleanup when `drawerOpen` is `false` — fragile pattern

**Files modified:** `src/pages/admin/index.tsx`
**Commit:** a318a22
**Applied fix:** Replaced the conditional `if (drawerOpen) { lock; return cleanup; }` pattern with the unconditional form: `document.body.style.overflow = drawerOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; };`. The cleanup now always runs regardless of which branch was taken.

---

### WR-02: ConfirmModal ignores the `error` prop value — always renders hardcoded string

**Files modified:** `src/sections/admin/ConfirmModal.tsx`
**Commit:** b813ac3
**Applied fix:** Replaced the hardcoded `Error al actualizar el estado. Intentá de nuevo.` literal with `{error}` so the component renders whatever string the caller passes. The caller (`AdminPage`) already passes `statusError` as the prop value.

---

### WR-03: `score` field has no client-side range/NaN validation — `NaN` and out-of-range values reach PocketBase

**Files modified:** `src/sections/admin/AdminCertificateForm.tsx`
**Commit:** f87b58f
**Applied fix:** Added explicit pre-submit validation: if `form.score` is non-empty, `parseFloat` is called and the result is checked for `isNaN` or outside `[0, 10]`. On failure, a `fieldErrors.score` entry is set with the message "Debe ser un número entre 0 y 10" and the function returns early. Added the corresponding error display `<span>` in the score field JSX (mirrors the pattern used by all other fields).

---

### WR-04: `endDate` is never validated against `startDate` — logically invalid certificates can be created

**Files modified:** `src/sections/admin/AdminCertificateForm.tsx`
**Commit:** f87b58f
**Applied fix:** Added date-ordering check after the required-fields check: if both `form.startDate` and `form.endDate` are present and `endDate < startDate` (ISO string comparison is correct for `YYYY-MM-DD` format), a `fieldErrors.endDate` entry is set with the message "La fecha de fin debe ser posterior o igual a la de inicio" and the function returns early. The `endDate` field already rendered `fieldErrors.endDate` in the JSX.

---

### WR-05: QR download does not append to `document.body` before clicking — may silently fail in Safari

**Files modified:** `src/sections/admin/AdminCertificateList.tsx`
**Commit:** 0d27ed6
**Applied fix:** Added `document.body.appendChild(a)` before `a.click()` and `document.body.removeChild(a)` immediately after. Changed `URL.revokeObjectURL(url)` to run inside `setTimeout(() => ..., 100)` so the browser has time to initiate the download before the object URL is revoked.

---

### WR-06: `drawerRecord` and `drawerMode` state are not reset when the drawer closes — stale data on rapid re-open

**Files modified:** `src/pages/admin/index.tsx`
**Commit:** a318a22
**Applied fix:** Extended `closeDrawer` to call `setTimeout(() => { setDrawerRecord(null); setGeneratedCode(''); }, 250)` after `setDrawerOpen(false)`. The 250ms delay lets the framer-motion exit animation complete before the stale record/code state is cleared, preventing a flash of emptied form during the animation.

---

## Skipped Issues

None — all 9 in-scope findings were fixed.

---

_Fixed: 2026-06-08T00:00:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
