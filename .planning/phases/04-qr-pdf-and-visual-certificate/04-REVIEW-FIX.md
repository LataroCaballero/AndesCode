---
phase: 04-qr-pdf-and-visual-certificate
fixed_at: 2026-06-08T00:00:00Z
review_path: .planning/phases/04-qr-pdf-and-visual-certificate/04-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 7
skipped: 0
status: all_fixed
---

# Phase 04: Code Review Fix Report

**Fixed at:** 2026-06-08T00:00:00Z
**Source review:** .planning/phases/04-qr-pdf-and-visual-certificate/04-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 7 (3 Critical + 4 Warning)
- Fixed: 7
- Skipped: 0

## Fixed Issues

### CR-01: `fetchToBase64` ignores HTTP error status

**Files modified:** `src/hooks/usePdfGenerator.ts`
**Commit:** f69a1b0
**Applied fix:** Added `if (!res.ok)` check before calling `res.arrayBuffer()`. The function now throws a descriptive error including the HTTP status code and URL, preventing garbage binary data from silently being passed to jsPDF when an asset fetch returns 4xx/5xx.

---

### CR-02: `window.location.href` used directly inside component render

**Files modified:** `src/components/CertificadoVisual.tsx`, `src/sections/CertificadoVerificacion.tsx`
**Commit:** 40acd16
**Applied fix:** Added `verificationUrl: string` to `CertificadoVisualProps` and updated the component signature to accept and use `verificationUrl` in `QRCodeSVG`. The call site in `CertificadoVerificacion.tsx` now passes `window.location.href` explicitly as a prop, keeping the window access in the navigation section where it belongs.

---

### CR-03: `console.error` left in production code

**Files modified:** `src/hooks/usePdfGenerator.ts`
**Commit:** 80cdf46
**Applied fix:** Removed `console.error(err)` from the catch block. Renamed the catch parameter from `err` to `_err` to satisfy TypeScript `noUnusedLocals`. The user-facing `setError(...)` call is the only error feedback now, consistent with project logging conventions.

---

### WR-01: PDF layout defect — QR label renders past the footer line

**Files modified:** `src/hooks/usePdfGenerator.ts`
**Commit:** 0324555
**Applied fix:** Changed the QR label Y offset from `qrY + 33` to `qrY + 28`. With `bottomRowY = 165mm` and `qrY = 165mm`, the label now sits at `193mm`, safely above the footer divider at `197mm`.

---

### WR-02: `handleCopyUrl` — unhandled Promise rejection

**Files modified:** `src/sections/CertificadoVerificacion.tsx`
**Commit:** 5e7f76b
**Applied fix:** Added a `.catch(() => { ... })` handler to `navigator.clipboard.writeText(...)`. The catch block is currently a no-op with a comment explaining the failure conditions (page not focused, denied permissions on Firefox/Safari, iframes without `clipboard-write`). This prevents unhandled promise rejection in those scenarios.

---

### WR-03: Race condition — stale response can overwrite state on rapid navigation

**Files modified:** `src/sections/CertificadoVerificacion.tsx`
**Commit:** a27a047
**Applied fix:** Added a `let cancelled = false` flag at the top of the `useEffect` body. Both `.then()` and `.catch()` handlers check `if (cancelled) return` before updating state. The cleanup function sets `cancelled = true` (in addition to the existing `document.title` restore), preventing stale responses from overwriting state when `certificateCode` changes during an in-flight request.

---

### WR-04: `"error"` state in `FetchState` is dead code

**Files modified:** `src/sections/CertificadoVerificacion.tsx`
**Commit:** 855b430
**Applied fix:** Removed `"error"` from the `FetchState` union type (now `"loading" | "found" | "notFound"`). Simplified the render guard from `state === "notFound" || state === "error"` to `state === "notFound"`. Both catch branches already mapped to `"notFound"`, so no behavior change — only the dead type member and unreachable branch are removed.

---

_Fixed: 2026-06-08T00:00:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
