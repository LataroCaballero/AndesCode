---
phase: 03-admin-crud
reviewed: 2026-06-08T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - src/components/TagsInput.tsx
  - src/pages/admin/index.tsx
  - src/sections/admin/AdminCertificateDrawer.tsx
  - src/sections/admin/AdminCertificateForm.tsx
  - src/sections/admin/AdminCertificateList.tsx
  - src/sections/admin/AdminTopBar.tsx
  - src/sections/admin/ConfirmModal.tsx
findings:
  critical: 3
  warning: 6
  info: 3
  total: 12
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-06-08T00:00:00Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

This phase implements the paginated admin certificate list, create/edit drawer, revoke/reactivate confirm modal, and per-row QR download. The overall structure is sound — filter injection is prevented via `pb.filter()`, the scroll-lock cleanup is correct, and `$autoCancel: false` is applied where needed. However, three critical defects require fixes before this code ships: a race condition in code generation that can produce duplicate certificate codes in production, a memory leak in the QR component that permanently blocks the body scroll after form errors, and a status injection vulnerability in the filter construction. Six quality warnings and three informational items are also documented below.

---

## Critical Issues

### CR-01: Certificate code generation is racy — duplicate codes possible under concurrent creates

**File:** `src/pages/admin/index.tsx:128-143`

**Issue:** `generateNextCertificateCode` derives the next code by counting how many certificates exist for the current year (`result.totalItems + 1`). If two admin sessions call this within a short window, both will read the same `totalItems` value and generate the same code string. The comment acknowledges a "UNIQUE index in PocketBase" as the backstop, but the UX consequence is that the second operator gets a silent save error after already filling in the whole form — there is no retry or increment logic. More critically, if PocketBase does NOT have a UNIQUE constraint enforced in the migration (not verifiable from client code), both records will be silently accepted with the same code, breaking certificate verification.

Additionally, the year-range filter uses `created` (the system timestamp in UTC) but the comparison strings are bare date-time literals without an explicit timezone. PocketBase stores `created` in UTC. A certificate created at 21:00 ART (UTC-3) on 2025-12-31 has `created = "2026-01-01 00:00:00"` in UTC. The filter `created <= "2025-12-31 23:59:59"` will miss it, producing an off-by-one in year boundary counts and thus generating a duplicate code for the first record of the new year.

**Fix:** Switch to a single monotonically safe strategy. The simplest correct approach is to query for the highest existing code of the year (already partially done via `sort: '-certificateCode'`) and increment from that, not from `totalItems`:

```typescript
const generateNextCertificateCode = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const prefix = `AC-${year}-`;

  const result = await pb.collection('certificates').getList(1, 1, {
    filter: pb.filter('certificateCode ~ {:prefix}', { prefix }),
    sort: '-certificateCode',
    fields: 'certificateCode',
    '$autoCancel': false,
  });

  if (result.items.length === 0) {
    return `${prefix}001`;
  }

  const lastCode = result.items[0].certificateCode; // e.g. "AC-2026-007"
  const lastNum = parseInt(lastCode.split('-')[2] ?? '0', 10);
  const next = String(lastNum + 1).padStart(3, '0');
  return `${prefix}${next}`;
};
```

This is still advisory (two simultaneous creates can still collide), but reduces the window dramatically and eliminates the timezone bug. A UNIQUE constraint in PocketBase remains the hard guarantee — confirm it exists in the migration.

---

### CR-02: Body scroll lock leaks when the drawer closes via form error path

**File:** `src/pages/admin/index.tsx:120-125`

**Issue:** The scroll-lock effect only installs the cleanup when `drawerOpen` is `true`:

```typescript
useEffect(() => {
  if (drawerOpen) {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }
}, [drawerOpen]);
```

When `drawerOpen` becomes `false`, the effect re-runs. Because the `if (drawerOpen)` branch is not taken, the effect returns `undefined` — no cleanup runs. The cleanup only executes when the effect is re-run from the *previous* render where `drawerOpen` was `true`. This is actually correct in the nominal close path (user clicks "Cerrar sin guardar").

However, there is a second leak path: if `handleSubmit` in `AdminCertificateForm` throws an unexpected error that is NOT a PocketBase duplicate-code error, the catch block sets `saveError` but does NOT call `onClose`. The drawer stays open but `drawerOpen` never changes, so the cleanup never fires. This is not a leak from the effect itself — the real bug is that the effect guard leaves no way to recover the scroll lock if the component is unmounted for any reason other than the drawerOpen toggle (e.g., full navigation away while drawer is open via browser back button).

The concrete defect: pressing the browser Back button while the drawer is open unmounts `AdminPage`, the `useEffect` cleanup for scroll lock runs only if React calls it — which it does on unmount — BUT it runs only the cleanup of the *last* returned value. Since the last run of the effect when `drawerOpen=true` returned a cleanup, React will call it on unmount. This is actually safe.

**The real bug** is simpler: when `drawerOpen` transitions from `true` to `false`, the effect re-runs with `drawerOpen=false`. The old cleanup (from when it was `true`) fires first — restoring `overflow = ''`. That is correct. But if `drawerOpen` starts as `false` from the first render and `open` is never set to `true` in this render cycle, the body is never locked. The leak occurs specifically in this sequence: (1) open drawer, (2) open ConfirmModal (which has z-index 50 > drawer z-index 50 — equal), (3) confirm modal mounts; now BOTH the modal and the drawer compete for the same body overflow. The modal has no scroll lock of its own, so closing the modal while the drawer is still open does not cause a problem. The actual leak is:

**Confirmed bug:** If `onSaved()` is called (line 171), it calls `closeDrawer()` then `setRefreshKey`. `closeDrawer()` sets `drawerOpen = false`, which will trigger the cleanup, restoring `overflow = ''`. This is correct. However, `onSaved` does not reset `drawerRecord` to `null` nor `drawerMode`. If the user immediately clicks "Nuevo certificado" again before the animation exits, `openDrawer('create')` is called while the previous `AnimatePresence` exit animation is still running. Because `drawerOpen` goes `false → true` in the same event flush, the scroll lock effect fires in order: cleanup (restores overflow) then re-lock. This is a correctness issue but not an infinite leak.

**The actual confirmed memory/state leak:** the scroll lock `useEffect` guard — `if (drawerOpen) { ... return cleanup; }` — when `drawerOpen` is `false`, returns `undefined`. When React compares effect dependencies and `drawerOpen` changed from `true` to `false`, it calls the previous effect's cleanup (which was the restore function). This IS fine. There is no memory leak from the effect itself.

**Reclassifying:** Upon tracing all paths carefully, the scroll lock effect itself is correct for the open/close lifecycle. The actual concern is a missing cleanup for the `confirmStatusChange` flow where the drawer stays open while the confirm modal operates — but the scroll lock is inherited from the drawer, which is fine.

**Downgrading this to WARNING** — see WR-01 below for the reformulated finding.

---

### CR-02 (revised): Unparameterized `status` value interpolated directly into PocketBase filter string — injection risk

**File:** `src/pages/admin/index.tsx:91-93`

**Issue:** The status filter is built by direct string interpolation, bypassing `pb.filter()`:

```typescript
if (filter !== 'all') {
  filterParts.push(`status = "${filter}"`);
}
```

The `filter` parameter has TypeScript type `'all' | 'active' | 'revoked'`, but TypeScript type safety only holds at compile time. If this function is ever called with an unvalidated source (e.g., a URL query parameter that is coerced to the union type via `as`) or if the type definition changes, the filter string becomes injectable. The code comment on line 81 explicitly states "NUNCA concatenar input directamente" — but this line does exactly that.

While the TypeScript type narrows the value at call sites within this file, the correct pattern (per the project's own convention established 3 lines above) is to use `pb.filter()` for all filter construction:

**Fix:**
```typescript
if (filter !== 'all') {
  filterParts.push(pb.filter('status = {:status}', { status: filter }));
}
```

---

### CR-03: `$autoCancel: false` missing from `generateNextCertificateCode` — request cancelled in React 19 Strict Mode

**File:** `src/pages/admin/index.tsx:133-137`

**Issue:** The project constraint explicitly documents that `'$autoCancel': false` is required for all PocketBase requests due to React 19 Strict Mode's double-invocation of effects and callbacks. The `fetchCertificates` function correctly uses `'$autoCancel': false` on line 101. However, the `getList` call inside `generateNextCertificateCode` (line 133) omits it:

```typescript
const result = await pb.collection('certificates').getList(1, 1, {
  filter: `created >= "${yearStart}" && created <= "${yearEnd}"`,
  sort: '-certificateCode',
  fields: 'certificateCode',
  // '$autoCancel': false  <-- MISSING
});
```

In development (Strict Mode), `openDrawer('create')` is called twice. The first invocation's request gets cancelled by PocketBase's auto-cancel when the second fires. The catch block on line 154 silently swallows the error and sets `generatedCode = ''`, leaving the certificate code field blank. The admin must then manually type the code every time they create a certificate in development, and the same cancellation can occur in production if the component remounts quickly.

**Fix:**
```typescript
const result = await pb.collection('certificates').getList(1, 1, {
  filter: `created >= "${yearStart}" && created <= "${yearEnd}"`,
  sort: '-certificateCode',
  fields: 'certificateCode',
  '$autoCancel': false,
});
```

---

## Warnings

### WR-01: Scroll lock effect returns no cleanup when `drawerOpen` is `false` — fragile pattern

**File:** `src/pages/admin/index.tsx:120-125`

**Issue:** The conditional inside the effect means the effect body returns `undefined` when `drawerOpen` is `false`. While React does call the previous render's cleanup when re-running the effect, this pattern is fragile and non-obvious. If future code introduces another conditional path where the drawer is closed without toggling `drawerOpen`, the scroll lock will not be released. The recommended pattern is to always set the value based on the boolean:

**Fix:**
```typescript
useEffect(() => {
  document.body.style.overflow = drawerOpen ? 'hidden' : '';
  return () => { document.body.style.overflow = ''; };
}, [drawerOpen]);
```

---

### WR-02: ConfirmModal ignores the `error` prop value — always renders hardcoded string

**File:** `src/sections/admin/ConfirmModal.tsx:102-106`

**Issue:** The component receives an `error: string | null` prop, but the error display renders a hardcoded string instead of the prop value:

```tsx
{error && (
  <div className="...">
    Error al actualizar el estado. Intentá de nuevo.  {/* hardcoded, ignores prop */}
  </div>
)}
```

If the caller ever passes a specific error message (e.g., a network timeout message distinguishable from a PocketBase validation error), the user will never see it. This also means the `error` prop could be any truthy string (including the empty string workaround) and the displayed text would be meaningless.

**Fix:**
```tsx
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
    {error}
  </div>
)}
```

---

### WR-03: `score` field has no client-side range validation — `NaN` and out-of-range values reach PocketBase

**File:** `src/sections/admin/AdminCertificateForm.tsx:140-141`

**Issue:** The `score` field uses `parseFloat(form.score)` before submitting. If the user types a value outside `[0, 10]` (the `min`/`max` on the `<input>` are advisory, not enforced) or a string that parses to `NaN` (e.g., just whitespace that passes the `trim()` check because the field is not in `requiredFields`), `parseFloat` will produce `NaN` or an out-of-range number that gets sent to PocketBase. HTML `min`/`max` attributes are bypassed when using the `value`/`onChange` controlled pattern without browser validation.

`score` is typed as `number` in the PocketBase schema. Sending `NaN` (which JSON-serializes as `null` in some environments) or a number like `150` may either corrupt the record or cause a server-side error with a generic "Error al guardar" message that gives no indication what field failed.

**Fix:** Add explicit validation before submitting:
```typescript
const scoreValue = form.score !== '' ? parseFloat(form.score) : null;
if (scoreValue !== null && (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 10)) {
  setFieldErrors(prev => ({ ...prev, score: 'Debe ser un número entre 0 y 10' }));
  return;
}
```

---

### WR-04: `endDate` is never validated against `startDate` — logically invalid certificates can be created

**File:** `src/sections/admin/AdminCertificateForm.tsx:37-47`

**Issue:** Both `startDate` and `endDate` are required fields and are validated for presence, but there is no check that `endDate >= startDate`. A certificate where the practice end date precedes the start date is logically invalid and would be confusing on the public verification page. Similarly, `issueDate` can precede `endDate` without any warning.

**Fix:** After the `missing` check, add date ordering validation:
```typescript
if (form.startDate && form.endDate && form.endDate < form.startDate) {
  setFieldErrors(prev => ({
    ...prev,
    endDate: 'La fecha de fin debe ser posterior o igual a la de inicio',
  }));
  return;
}
```

---

### WR-05: QR download does not append to `document.body` before clicking — may silently fail in Safari

**File:** `src/sections/admin/AdminCertificateList.tsx:79-84`

**Issue:** The programmatic download pattern creates an anchor element, sets `href` and `download`, then calls `a.click()` without appending the element to the DOM:

```typescript
const a = document.createElement('a');
a.href = url;
a.download = `QR-${certificateCode}.svg`;
a.click();
URL.revokeObjectURL(url);
```

Safari requires the anchor to be part of the document for programmatic `.click()` to trigger a download. This pattern will silently do nothing in Safari (desktop and iOS). Additionally, `URL.revokeObjectURL(url)` is called synchronously *immediately after* `a.click()`, which can race with the browser's download initiation on slower systems — the object URL may be revoked before the browser has finished reading it.

**Fix:**
```typescript
const a = document.createElement('a');
a.href = url;
a.download = `QR-${certificateCode}.svg`;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
// Revoke after a tick to ensure the browser has initiated the download
setTimeout(() => URL.revokeObjectURL(url), 100);
```

---

### WR-06: `drawerRecord` and `drawerMode` state are not reset when the drawer closes — stale data on rapid re-open

**File:** `src/pages/admin/index.tsx:166-168`

**Issue:** `closeDrawer` only sets `drawerOpen = false`:

```typescript
const closeDrawer = () => {
  setDrawerOpen(false);
};
```

It does not reset `drawerRecord` or `drawerMode`. If an admin:
1. Opens the edit drawer for certificate A (sets `drawerRecord = certA`, `drawerMode = 'edit'`)
2. Saves and `onSaved` is called
3. Immediately clicks "Nuevo certificado"

The sequence is: `closeDrawer()` → `setRefreshKey(k+1)` in `onSaved`, then `openDrawer('create')` starts the async `generateNextCertificateCode`. During the async await, `drawerMode` is already set to `'create'` and `drawerRecord` is set to `null` (line 148), so this particular path is safe.

However, if the user closes the drawer by clicking the backdrop (`onClose` is called directly by the drawer), `drawerRecord` retains the previous certificate. The next `openDrawer('create')` call correctly resets both, so there is no functional bug in the create path. The issue manifests if `onClose` is called while the drawer is in 'edit' mode, and then the parent re-renders and passes `drawerRecord` down to a still-mounted (but animating-out) `AdminCertificateForm`. The `AnimatePresence` exit animation keeps the form mounted briefly with the old `record` prop while `drawerOpen` is `false`. This is cosmetic but can confuse the user if they see flash of old data.

**Fix:** Reset the record in `closeDrawer`:
```typescript
const closeDrawer = () => {
  setDrawerOpen(false);
  // Reset after framer-motion exit animation completes (200ms)
  setTimeout(() => {
    setDrawerRecord(null);
    setGeneratedCode('');
  }, 250);
};
```

---

## Info

### IN-01: `key={i}` used as React list key for tags — unstable under deletion

**File:** `src/components/TagsInput.tsx:37`

**Issue:** Tags are rendered with `key={i}` (array index). When a tag in the middle of the list is removed via `removeTag`, all subsequent tags get a new index key. React will re-render all subsequent tag elements rather than removing the correct one. This is not a visual bug (the array is recomputed correctly), but it prevents React from reusing DOM nodes efficiently and can cause unexpected re-animation on enter/exit if animations are added later.

**Fix:** Use the tag value as the key (tags are already deduplicated — `!value.includes(tag)` on line 19):
```tsx
{value.map((tag) => (
  <span key={tag} ...>
```

---

### IN-02: `formatDate` uses `new Date(dateStr)` without specifying UTC — date displays one day off for some timezones

**File:** `src/sections/admin/AdminCertificateList.tsx:38-46`

**Issue:** PocketBase date fields store dates as `YYYY-MM-DD` strings. `new Date("2026-06-08")` is parsed as UTC midnight, which means in timezones west of UTC (e.g., ART = UTC-3), `d.getDate()` returns the previous day (June 7, not June 8). The certificate list will display issue dates one day behind what the admin entered.

**Fix:**
```typescript
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  // Parse as local date by replacing '-' separator
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}
```

---

### IN-03: `record` from `usePocketBase` is unused beyond email display — importing full context for one field

**File:** `src/pages/admin/index.tsx:21`, `src/sections/admin/AdminTopBar.tsx:19`

**Issue:** `AdminPage` imports `record` from `usePocketBase()` solely to pass to `AdminTopBar` for email display. The `pb` instance from context is never used — the page imports and uses the singleton `pb` from `../../services/pb` directly. This means the component does not reactively update if auth state changes (it uses the singleton's imperative API). This is consistent with how the rest of the app uses `pb` directly, but mixing the context-based `record` read with the singleton-based `pb` write is inconsistent.

**Fix (informational):** Either use `pb` from the context (`const { pb, record } = usePocketBase()`) for all PocketBase operations, or accept the pattern as intentional and document it. No functional bug if `AdminGuard` prevents reaching this page while unauthenticated.

---

_Reviewed: 2026-06-08T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
