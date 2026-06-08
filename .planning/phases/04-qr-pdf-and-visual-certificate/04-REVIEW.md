---
phase: 04-qr-pdf-and-visual-certificate
reviewed: 2026-06-08T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - src/components/CertificadoVisual.tsx
  - src/sections/CertificadoVerificacion.tsx
  - src/hooks/usePdfGenerator.ts
  - src/vite-env.d.ts
findings:
  critical: 3
  warning: 4
  info: 3
  total: 10
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-06-08T00:00:00Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Four files reviewed spanning the QR/PDF/visual-certificate feature: the HTML certificate component (`CertificadoVisual.tsx`), the verification section (`CertificadoVerificacion.tsx`), the PDF generation hook (`usePdfGenerator.ts`), and the Vite type declaration file (`vite-env.d.ts`). The `vite-env.d.ts` is clean. The other three files contain a mix of blockers and warnings. The most serious issues are: a `fetch()` call that silently treats HTTP error responses as success (corrupts the PDF asset pipeline), a `window.location.href` used inside a component render (breaks server-side-rendering and snapshot tests, and is wrong in any non-navigation context), and a `console.error` left in production code. Several quality issues also require attention: unhandled clipboard rejection, a race condition on rapid navigation, and a layout calculation defect in the PDF that renders the QR label outside the declared footer area.

---

## Critical Issues

### CR-01: `fetchToBase64` ignores HTTP error status — silently produces garbage PDF

**File:** `src/hooks/usePdfGenerator.ts:45-49`
**Issue:** `fetch(url)` is called and `res.arrayBuffer()` is called unconditionally, regardless of `res.ok`. If any asset request returns a 4xx or 5xx (e.g., a font file is missing after a Vite build misconfiguration, or a logo returns 404), the error HTML body is silently base64-encoded and passed to `jsPDF.addFileToVFS` / `addImage`. jsPDF will either render garbage or throw an internal error. The outer `catch` in `generate()` will catch the throw, but the user gets only "No se pudo generar el PDF" with no distinction between "asset missing" and "generation error". More critically, a partially-failed `Promise.all` means all five parallel fetches ran anyway — one bad asset aborts the whole set, yet the failed fetch is still consumed.

The real correctness bug is that `res.ok === false` is never checked, so a corrupted response is treated as a valid font/image binary.

**Fix:**
```typescript
async function fetchToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Asset fetch failed: ${res.status} ${res.statusText} — ${url}`);
  }
  const buf = await res.arrayBuffer();
  return arrayBufferToBase64(buf);
}
```

---

### CR-02: `window.location.href` used directly inside component render — not a prop

**File:** `src/components/CertificadoVisual.tsx:218`
**Issue:** `QRCodeSVG` receives `value={window.location.href}` as a hardcoded call to the global `window` object at render time. This creates two concrete bugs:

1. **Wrong URL on re-use:** `CertificadoVisual` accepts a `cert` prop but does not accept a `verificationUrl` prop. If this component is ever rendered outside of the verification route (e.g., in an admin panel preview, a print layout, or a unit test), the QR code will encode whatever page happens to be currently loaded — not the canonical certificate URL.

2. **SSR/snapshot incompatibility:** `window` does not exist in Node.js; any attempt to server-render or snapshot-test this component will throw `ReferenceError: window is not defined`.

The PDF generator correctly receives `verificationUrl` as an explicit argument (line 71). The HTML component must follow the same pattern.

**Fix:**
```typescript
// In CertificadoVisual.tsx — add verificationUrl to props
type CertificadoVisualProps = {
  cert: Certificate;
  verificationUrl: string;
};

export default function CertificadoVisual({ cert, verificationUrl }: CertificadoVisualProps) {
  // ...
  <QRCodeSVG
    value={verificationUrl}
    size={100}
    level="H"
    bgColor="#FFFFFF"
    fgColor="#191919"
    marginSize={2}
  />
}

// In CertificadoVerificacion.tsx — pass the URL explicitly
<CertificadoVisual cert={cert} verificationUrl={window.location.href} />
```

---

### CR-03: `console.error` left in production code — violates project logging conventions

**File:** `src/hooks/usePdfGenerator.ts:314`
**Issue:** The `catch` block calls `console.error(err)` unconditionally. The project CLAUDE.md explicitly states "No logging detected in production code" and that TypeScript strict mode is in place specifically to "prevent accidental `console` statements from being left in code." This statement will fire in every production PDF generation failure, leaking internal jsPDF stack traces and asset URLs to the browser console, which can expose deployment infrastructure paths (Vite-hashed asset URLs, PocketBase endpoints embedded in error messages).

Additionally, this call bypasses the `noUnusedLocals` / `noUnusedParameters` TypeScript flags — it will compile fine, but it is an explicit violation of stated conventions.

**Fix:**
```typescript
} catch (err) {
  setError("No se pudo generar el PDF. Intentá de nuevo.");
  // Remove console.error — the user-facing error state is sufficient.
  // If observability is needed, send to a structured error reporter instead.
}
```

---

## Warnings

### WR-01: PDF layout defect — QR label renders past the footer line (1mm overlap)

**File:** `src/hooks/usePdfGenerator.ts:240-288`
**Issue:** The PDF coordinate math places the QR caption text outside the footer separator:

- `bottomRowY = pageH - margin - 30 = 210 - 15 - 30 = 165 mm`
- QR block: `y=165`, height=30, ends at `195 mm`
- QR label: `y = bottomRowY + 33 = 198 mm`
- `footerY = pageH - margin + 2 = 197 mm`

The label (`VERIFICÁ LA AUTENTICIDAD`) at `198 mm` is drawn **after** the footer divider line at `197 mm`, so the text bleeds into or below the footer area. In practice, jsPDF clips near the page edge (210 mm margin), so the label may be partially or fully invisible on the printed PDF.

**Fix:**
```typescript
// Reduce QR block height or shift the label above the footer line.
// Option A: move the QR block up by 5mm
const bottomRowY = pageH - margin - 35; // was -30

// Option B: tighten the label offset
doc.text("VERIFICÁ LA AUTENTICIDAD", qrX + 15, qrY + 28, { align: "center" });
// (28 instead of 33 keeps the label at 193mm, safely above footerY=197mm)
```

---

### WR-02: `handleCopyUrl` — unhandled Promise rejection (clipboard API can fail silently)

**File:** `src/sections/CertificadoVerificacion.tsx:87-91`
**Issue:** `navigator.clipboard.writeText(...)` returns a Promise. The `.then()` handler is attached, but there is no `.catch()`. The Clipboard API throws/rejects in several real-world conditions: the page is not focused, the document is in an iframe without `clipboard-write` permission, or the user denies clipboard access (especially on Firefox and Safari). An unhandled rejection in this context will silently fail — the user clicks "Copiar enlace", nothing happens, no error feedback is shown, and the `copySuccess` state never flips to `true`.

**Fix:**
```typescript
const handleCopyUrl = () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }).catch(() => {
    // Fallback: show error or use execCommand for older contexts
    // At minimum, do not silently swallow the failure
    // Optionally: setCopyError(true) and show feedback
  });
};
```

---

### WR-03: Race condition — stale response can overwrite state on rapid navigation

**File:** `src/sections/CertificadoVerificacion.tsx:33-83`
**Issue:** The `useEffect` dispatches a PocketBase request but does not cancel it on cleanup. If `certificateCode` changes (user navigates from one certificate URL to another) while the first request is still in-flight, the first response's `.then()` will fire after the second request has already started. The sequence:

1. User loads `/certificados/AC-2025-001` → request A starts
2. User immediately navigates to `/certificados/AC-2025-002` → `setState("loading")`, request B starts
3. Request A resolves first → `setCert(recordA); setState("found")` — stale data shown for cert B's URL

The cleanup function only restores `document.title`. There is no `AbortController` or stale-closure guard.

**Fix:**
```typescript
useEffect(() => {
  if (!certificateCode) { setState("notFound"); return; }

  let cancelled = false;
  setState("loading");
  setCert(null);

  pb.collection("certificates")
    .getFirstListItem<Certificate>(
      pb.filter("certificateCode = {:code}", { code: certificateCode })
    )
    .then((record) => {
      if (cancelled) return;  // guard against stale response
      setCert(record);
      setState("found");
      document.title = record.studentName
        ? `${record.studentName} · Certificado AndesCode`
        : "Certificado · AndesCode";
    })
    .catch((err: unknown) => {
      if (cancelled) return;
      // ... existing error handling
    });

  return () => {
    cancelled = true;
    document.title = "AndesCode";
  };
}, [certificateCode]);
```

---

### WR-04: `"error"` state in `FetchState` is dead code — never assigned

**File:** `src/sections/CertificadoVerificacion.tsx:16, 61-76`
**Issue:** `FetchState` is declared with four members: `"loading" | "found" | "notFound" | "error"`. The `"error"` variant is handled in the render guard at line 116 (`if (state === "notFound" || state === "error")`), but there is no code path that ever calls `setState("error")`. Both branches of the catch block at lines 72 and 75 call `setState("notFound")`. This means:

- The `"error"` member is dead type-level code.
- The conditional at line 116 for `state === "error"` is unreachable.
- A reviewer or future developer cannot tell if error-vs-notFound distinction was intentional or forgotten.

**Fix:** Either remove `"error"` from `FetchState` and simplify the render guard, or add a real `setState("error")` branch for genuine network/server errors (5xx) to distinguish them from "not found" (404):

```typescript
// Option A — remove dead state
type FetchState = "loading" | "found" | "notFound";

// Option B — use it meaningfully in the catch
} else {
  // 403, 500, network failure → genuine error, not "not found"
  setState("error");
}
```

---

## Info

### IN-01: Redundant Tailwind `p-6` class overridden by `p-4` on the same element

**File:** `src/components/CertificadoVisual.tsx:40`
**Issue:** The outer `div` has `className="... p-6 sm:p-6 p-4 ..."`. The bare `p-6` (no breakpoint prefix) appears before `sm:p-6` and `p-4`. Since `p-4` (no prefix) comes later in the class list, on mobile it overrides `p-6`. The `sm:p-6` then overrides both on `sm+` screens. The net result is: mobile=`p-4`, sm+=`p-6`. The initial `p-6` is completely overridden and has no visual effect. This is confusing to read and suggests the class string was edited incrementally.

**Fix:**
```typescript
// Remove the bare p-6 — it is fully dead
className="relative overflow-hidden bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.08)] fade-in"
```

---

### IN-02: PDF seal uses wordmark PNG instead of icon PNG — visual inconsistency with HTML cert

**File:** `src/hooks/usePdfGenerator.ts:261-263`
**Issue:** The HTML certificate (`CertificadoVisual.tsx:209`) renders the AndesCode icon (`logo.png`) as the center "sello." The PDF generation hook (line 263) renders `base64Wordmark` (the `andescode-wordmark.png` text image) in that same center position. The `logo.png` icon is never fetched or embedded in the PDF. The result is that the HTML preview and the downloaded PDF show different graphics in the seal position, reducing trust in document authenticity.

**Fix:** Add the icon logo to the parallel asset fetch and use it as the seal:
```typescript
// In Promise.all fetch block:
fetchToBase64(andescodeLogoUrl),  // add alongside andescodeWordmarkUrl

// In the seal section (line 263):
doc.addImage(base64Logo, "PNG", sealX, bottomRowY, sealSize, sealSize);
// adjust dimensions to match the square icon aspect ratio
```

---

### IN-03: `setTimeout` in `handleCopyUrl` leaks timer reference on unmount

**File:** `src/sections/CertificadoVerificacion.tsx:90`
**Issue:** `setTimeout(() => setCopySuccess(false), 2000)` is called without storing the timer ID, so it cannot be cancelled in a cleanup function. If the user copies the link and then navigates away within 2 seconds, the timer fires and calls `setCopySuccess(false)` on the unmounted component. React 18+ no longer warns about this, but the state update after unmount is wasted work. If the component is remounted quickly (e.g., same route re-visited), the timer from the previous mount may interfere.

**Fix:**
```typescript
const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleCopyUrl = () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    setCopySuccess(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopySuccess(false), 2000);
  }).catch(() => { /* handle */ });
};

// Add to useEffect cleanup or a dedicated useEffect:
useEffect(() => {
  return () => {
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
  };
}, []);
```

---

_Reviewed: 2026-06-08T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
