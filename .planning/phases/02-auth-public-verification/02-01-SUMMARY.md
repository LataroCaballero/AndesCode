---
phase: 02-auth-public-verification
plan: "01"
subsystem: auth
tags: [pocketbase, auth, admin, react-context, route-guard]
dependency_graph:
  requires: []
  provides: [pb-singleton, PocketBaseContext, AdminGuard, admin-login-page, admin-dashboard, admin-routes]
  affects: [src/main.tsx, src/components/TitleManager.tsx]
tech_stack:
  added: [pocketbase SDK usage (already installed)]
  patterns: [singleton-service, react-context-provider, route-guard, authRefresh-revalidation]
key_files:
  created:
    - src/services/pb.ts
    - src/contexts/PocketBaseContext.tsx
    - src/components/AdminGuard.tsx
    - src/pages/admin/login.tsx
    - src/pages/admin/index.tsx
  modified:
    - src/main.tsx
    - src/components/TitleManager.tsx
decisions:
  - PocketBase LocalAuthStore used as-is (no custom auth store) — persists to localStorage under pocketbase_auth key
  - AdminGuard calls authRefresh on every mount for server-side token revalidation (AUTH-03)
  - AdminGuard is defense-in-depth; real access control is PocketBase collection rules server-side (T-02-02)
  - navigate with replace:true on all guard redirects to prevent back-button re-entry (T-02-05)
  - PocketBaseProvider placed inside BrowserRouter so AdminGuard can use both router hooks and auth context
metrics:
  duration: "~90 minutes (implementation + human verification)"
  completed: "2026-06-08"
  tasks_completed: 4
  tasks_total: 4
  files_created: 5
  files_modified: 2
---

# Phase 02 Plan 01: Admin Auth Vertical Slice Summary

**One-liner:** Singleton PocketBase client with LocalAuthStore, reactive React Context, and a protected admin route with server-side token revalidation via authRefresh against the `_superusers` collection.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | PocketBase client singleton + PocketBaseContext | fa946f4 | src/services/pb.ts, src/contexts/PocketBaseContext.tsx |
| 2 | Admin login page + AdminGuard + protected dashboard | fde0df2 | src/pages/admin/login.tsx, src/components/AdminGuard.tsx, src/pages/admin/index.tsx |
| 3 | Wire admin routes, PocketBaseProvider, and titles | 532fb23 | src/main.tsx, src/components/TitleManager.tsx |
| 4 | Verify admin auth flow end-to-end | — | checkpoint:human-verify — APPROVED (all 7 steps passed) |

## What Was Built

### Task 1: PocketBase Singleton + Context

- `src/services/pb.ts`: Exports a single `pb` (PocketBase instance) constructed with `import.meta.env.VITE_POCKETBASE_URL`. Uses the SDK's default `LocalAuthStore` (persists to `pocketbase_auth` key in localStorage, tab-synced).
- `src/contexts/PocketBaseContext.tsx`: Exports `PocketBaseProvider` and `usePocketBase`. Provider subscribes to `pb.authStore.onChange` in a `useEffect` for reactive auth state (`isValid`, `record`). Cleanup unsubscribes on unmount.

### Task 2: Login Page, Guard, Dashboard

- `src/pages/admin/login.tsx`: Standalone page (no Header, no Footer). Centered card on `.grid-bg` background with `fade-in` animation. Authenticates against `pb.collection('_superusers').authWithPassword`. Inline error alert with exact copy "Credenciales incorrectas. Revisá tu correo y contraseña." clears on any input change. Spinner + "Iniciando sesión..." during loading. Navigates to `/admin` on success.
- `src/components/AdminGuard.tsx`: On mount checks `pb.authStore.isValid`; if false, redirects to `/admin/login` with `replace: true`. If valid, calls `pb.collection('_superusers').authRefresh()`. If that throws, clears the store and redirects. Renders `null` while deciding to prevent content flash.
- `src/pages/admin/index.tsx`: Displays "Bienvenido, {email}" using `record?.email` from `usePocketBase()`. "Cerrar sesión" button calls `pb.authStore.clear()` then navigates to `/admin/login` with `replace: true`.

### Task 3: Routing + Titles

- `src/main.tsx`: Added `PocketBaseProvider` wrapping the routing tree (inside `BrowserRouter`). Added `/admin/login` → `<AdminLoginPage />` and `/admin` → `<AdminGuard><AdminPage /></AdminGuard>`. Public routes and `path="*"` catch-all unchanged. Leave sibling route slots open for Plan 02-02's `/certificados` and `/certificados/:certificateCode` routes.
- `src/components/TitleManager.tsx`: Added two entries to `routeTitles`: `/admin/login` → "Iniciar sesión · AndesCode Admin" and `/admin` → "Panel de administración · AndesCode".

## Requirements Addressed

- **AUTH-01:** Admin logs in at `/admin/login` with email + password via `_superusers.authWithPassword`
- **AUTH-02:** Session persists across reload via `LocalAuthStore` (localStorage)
- **AUTH-03:** `AdminGuard` calls `authRefresh()` on mount; expired/revoked token → redirect
- **AUTH-04:** Logout calls `pb.authStore.clear()` (removes token + record from store and localStorage)
- **AUTH-05:** `/admin` route is wrapped with `AdminGuard`; guests are redirected to `/admin/login`
- **VIS-03:** Login UI uses `#191919` text, white card, `#4342FF` focus rings and primary button — consistent with AndesCode identity

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Prevented double authRefresh in AdminGuard by removing isValid from useEffect dependency array**
- **Found during:** Task 3 post-commit review
- **Issue:** AdminGuard's useEffect had `isValid` (from `usePocketBase`) as a dependency. Because `pb.authStore.onChange` updates `isValid` after `authRefresh` resolves, the effect re-ran — triggering a second redundant `authRefresh` network call on every mount
- **Fix:** Removed `isValid` from the useEffect dependency array; the effect intentionally runs only on mount (empty deps) since it is a one-shot revalidation, not a reactive subscription
- **Files modified:** src/components/AdminGuard.tsx
- **Verification:** Confirmed single authRefresh call per mount in browser DevTools Network tab
- **Committed in:** f80fcf1 (separate fix commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Fix was necessary for correctness — double authRefresh caused redundant network calls and potential race conditions. No scope creep.

## Build Verification

`npm run build` (tsc strict + vite build) exits 0. Output size: 358.36 kB JS (109.13 kB gzip), 42.35 kB CSS.

## Human Verification — APPROVED

Task 4 was a `checkpoint:human-verify` gate. All 7 steps passed:

1. ✓ Navigate to `/admin` — redirected to `/admin/login`; back button blocked
2. ✓ Wrong credentials — inline error "Credenciales incorrectas. Revisá tu correo y contraseña." shown; clears on input edit
3. ✓ Correct superuser credentials — landed on `/admin` showing "Bienvenido, {email}"
4. ✓ Reload — stayed on `/admin` (LocalAuthStore + authRefresh)
5. ✓ DevTools Application → Local Storage — `pocketbase_auth` entry confirmed
6. ✓ "Cerrar sesión" — redirected to `/admin/login`, localStorage entry cleared
7. ✓ Navigate to `/admin` after logout — redirected to login

## Known Stubs

None. The admin dashboard is intentionally minimal in Phase 2 scope — it shows the email and a logout button. Phase 3 will add the full admin chrome and CRUD operations.

## Threat Flags

No new security-relevant surface beyond the plan's threat model. All threats documented in T-02-01 through T-02-SC.

## Self-Check: PASSED

- [x] src/services/pb.ts exists and exports `pb`
- [x] src/contexts/PocketBaseContext.tsx exists and exports `PocketBaseProvider` + `usePocketBase`
- [x] src/components/AdminGuard.tsx exists with authRefresh + replace:true
- [x] src/pages/admin/login.tsx exists — no Header/Footer import, _superusers auth, exact error copy
- [x] src/pages/admin/index.tsx exists with authStore.clear() logout
- [x] src/main.tsx has /admin/login and /admin routes with AdminGuard + PocketBaseProvider
- [x] src/components/TitleManager.tsx has both admin titles
- [x] Commits fa946f4, fde0df2, 532fb23, f80fcf1 exist in git log
- [x] npm run build exits 0
- [x] Human verification Task 4 approved (all 7 steps passed)
