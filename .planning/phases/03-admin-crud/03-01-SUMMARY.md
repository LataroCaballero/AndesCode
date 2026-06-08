---
phase: 03-admin-crud
plan: "01"
subsystem: admin-panel
tags: [admin, certificate-list, pagination, search, filter, pocketbase, tagsInput]
dependency_graph:
  requires:
    - phase-02 (AdminGuard, PocketBaseContext, Certificate type, pb singleton)
  provides:
    - AdminPage orchestrator with list/search/filter/page state
    - AdminTopBar sticky header component
    - AdminCertificateList paginated table component
    - TagsInput reusable component
    - qrcode.react dependency
  affects:
    - src/pages/admin/index.tsx (replaced stub)
    - Plans 02 and 03 (extend AdminPage state, wire drawer and QR handlers)
tech_stack:
  added:
    - qrcode.react@4.2.0 (ISC license, npm install)
  patterns:
    - pb.filter() for safe search parameter binding (T-03-FILTER mitigation)
    - refreshKey pattern for mutation-triggered list refresh
    - 300ms debounce on search input via setTimeout/useEffect
    - React strict mode compatible with useCallback for stable fetch reference
key_files:
  created:
    - src/components/TagsInput.tsx
    - src/sections/admin/AdminTopBar.tsx
    - src/sections/admin/AdminCertificateList.tsx
  modified:
    - src/pages/admin/index.tsx
    - package.json
    - package-lock.json
decisions:
  - "ITEMS_PER_PAGE=20 (Claude's discretion, standard for PocketBase)"
  - "Sort by -created (most recent first, Claude's discretion)"
  - "TitleManager already handles /admin — no useEffect title override needed"
  - "onCreateNew and onEdit are no-op placeholders; Plan 02 will wire the drawer"
  - "onToggleStatus/onDownloadQR are optional props on AdminCertificateList; Plans 02/03 pass real handlers"
metrics:
  duration: "~70 minutes"
  completed: "2026-06-08"
  tasks_completed: 3
  tasks_total: 3
  files_created: 3
  files_modified: 3
---

# Phase 03 Plan 01: Admin Shell and Certificate List Summary

**One-liner:** Real paginated certificate list with pb.filter() safe search, debounced 300ms, status filter, sticky AdminTopBar, and TagsInput reusable component — ADMIN-01/02/03 satisfied.

---

## Objective

Replace the placeholder admin dashboard with the real admin shell and a working read-only certificate list. The admin now lands on /admin and sees every certificate in a paginated table, can search by name or code (debounced 300ms), and can filter by status. The plan also installs `qrcode.react` (needed by Plan 03) and creates the reusable `TagsInput` (needed by Plan 02).

---

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Install qrcode.react and create TagsInput | `1d14dcd` | package.json, package-lock.json, src/components/TagsInput.tsx |
| 2 | Create AdminTopBar and AdminCertificateList | `0c0a717` | src/sections/admin/AdminTopBar.tsx, src/sections/admin/AdminCertificateList.tsx |
| 3 | Replace AdminPage stub with orchestrator | `77aff1e` | src/pages/admin/index.tsx |

---

## What Was Built

### TagsInput (`src/components/TagsInput.tsx`)

Reusable tags input component. Props: `value: string[]`, `onChange: (tags: string[]) => void`, `placeholder?: string`. Behavior: Enter or comma adds a tag (trims whitespace, skips duplicates); Backspace on empty input removes the last tag; x button removes individual tags. Wrapper has `focus-within:outline-2 focus-within:outline-[var(--color-primary)] min-h-[44px]`; chips are styled `bg-[#4342FF]/10 text-[#4342FF] fira-code-regular`.

### AdminTopBar (`src/sections/admin/AdminTopBar.tsx`)

Sticky `h-14` header with ANDESCODE wordmark (fira-code-bold text-xl), admin email (hidden below 480px via `hidden sm:block`), and "Cerrar sesion" btn-secondary. Props: `{ record: RecordModel | null; onLogout: () => void }`.

### AdminCertificateList (`src/sections/admin/AdminCertificateList.tsx`)

Full-featured certificate table with:
- Controls row: search input with FiSearch icon, status filter select (Todos/Activo/Revocado), "Nuevo certificado" btn-primary (right-aligned)
- Table columns: Codigo (fira-code-regular primary color, 140px), Nombre del estudiante (truncate), Fecha de emision (DD/MM/YYYY format, 130px), Estado (green/red badge pill), Acciones (3 icon buttons always visible)
- Status badges: Active `bg-green-100 text-green-700 border border-green-200`; Revoked `bg-red-100 text-red-700 border border-red-200`
- Action buttons: FiEdit2 (edit), FiToggleRight/FiToggleLeft (status toggle), FiDownload (QR); all `min-h-[44px] min-w-[44px]` with title and aria-label
- Loading state: 5 animate-pulse skeleton rows, table header visible
- Error state: `bg-red-50 border border-red-200` with FiAlertCircle and "Reintentar" link
- Empty state: context-aware copy (with or without active filter)
- Pagination: Anterior/Siguiente btn-secondary, disabled at boundaries, "Pagina N de M" label

All field values rendered with JSX `{value}` — no `dangerouslySetInnerHTML` (T-03-XSS mitigation).

### AdminPage orchestrator (`src/pages/admin/index.tsx`)

Replaces the placeholder stub with full orchestrator. State: `items`, `loading`, `error`, `page`, `totalPages`, `search`, `debouncedSearch`, `statusFilter`, `refreshKey`. Key behaviors:
- `fetchCertificates()` uses `pb.filter('(studentName ~ {:q} || certificateCode ~ {:q})', { q })` for safe search (T-03-FILTER mitigation)
- 300ms debounce via setTimeout/useEffect; `page` resets to 1 when search or filter changes
- `useEffect([page, debouncedSearch, statusFilter, refreshKey])` triggers fetch
- `handleLogout` preserved exactly: `pb.authStore.clear()` + `navigate('/admin/login', { replace: true })`
- `onCreateNew` and `onEdit` are no-op placeholders (Plan 02 will wire the drawer)
- Shell: `<div className="grid-bg min-h-screen">` + `<AdminTopBar>` + `<main className="px-4 sm:px-8 py-6"><AdminCertificateList /></main>`

---

## Verification Results

- `npm run build` — PASS (tsc strict + vite build, 0 errors)
- `npx tsc --noEmit` — PASS (0 type errors)
- `grep -rn "motion/react" src/sections/admin` — no matches
- `grep -n "dangerouslySetInnerHTML" src/sections/admin/AdminCertificateList.tsx` — no matches
- `grep -n 'studentName ~ "\${' src/pages/admin/index.tsx` — no matches (pb.filter used correctly)
- `node -e "require('qrcode.react')"` — PASS (importable)
- Status badges confirmed in source: green (bg-green-100 text-green-700) and red (bg-red-100 text-red-700)
- Pagination disabled at page === 1 and page === totalPages confirmed in source

---

## Deviations from Plan

### Pre-execution Fix [Rule 3 - Blocking]

**Found during:** Pre-execution setup
**Issue:** The worktree was created at `ff3f89e` (an old commit predating the admin files added in Phase 2) instead of the expected base `edaff54`. Files like `src/pages/admin/index.tsx`, `src/types/certificate.ts`, and `src/services/pb.ts` were absent from the working directory.
**Fix:** `git reset --hard edaff54` on the worktree branch to align it with the correct base commit. No changes to task files were lost (the worktree branch had no prior task commits — it was freshly created at the wrong base).
**Impact:** None to plan deliverables. All files from Phase 2 became accessible after the fix.

No other deviations — plan executed as written.

---

## Known Stubs

`handleCreateNew` and `handleEdit` in `src/pages/admin/index.tsx` are intentional no-op placeholders. These are callback slots that Plan 02 will replace with the `AdminCertificateDrawer` open logic. They do not prevent this plan's goal (ADMIN-01/02/03: list, search, filter, pagination) from being achieved.

---

## Threat Surface Scan

No new threat surface introduced beyond what was already scoped in the plan's threat model.

Mitigations applied:
- **T-03-FILTER**: `pb.filter('(studentName ~ {:q} || certificateCode ~ {:q})', { q })` used exclusively — no raw string concatenation of user input
- **T-03-XSS**: All certificate field values rendered with `{value}` JSX interpolation — confirmed no `dangerouslySetInnerHTML`

---

## Self-Check: PASSED

All files exist and all commits are verified:
- FOUND: src/components/TagsInput.tsx
- FOUND: src/sections/admin/AdminTopBar.tsx
- FOUND: src/sections/admin/AdminCertificateList.tsx
- FOUND: src/pages/admin/index.tsx
- FOUND: 03-01-SUMMARY.md
- FOUND commit: 1d14dcd (Task 1)
- FOUND commit: 0c0a717 (Task 2)
- FOUND commit: 77aff1e (Task 3)
