---
phase: 04-qr-pdf-and-visual-certificate
plan: 01
subsystem: ui
tags: [react, typescript, qrcode, certificate, tailwind, vite]

requires:
  - phase: 02-auth-public-verification
    provides: CertificadoVerificacion section, Certificate type, PocketBase service, public verification route
  - phase: 03-admin-crud
    provides: certificate management system, admin dashboard

provides:
  - CertificadoVisual component — HTML/CSS reproduction of physical certificate with embedded QR level H
  - Refactored CertificadoVerificacion FOUND state — actions above + certificate visual below
  - Logo assets — andescode-wordmark.png and fcefn.png in src/assets/logo/
  - FCEFN logo alpha-channel finding — solid dark/black circular background (Plan 02 PDF note)

affects:
  - 04-02 (PDF generation plan — consumes FCEFN logo background finding and CertificadoVisual layout)

tech-stack:
  added: []
  patterns:
    - "CertificadoVisual: presentational component with relative+overflow-hidden card for absolute watermark positioning"
    - "QRCodeSVG level=H encodes window.location.href for scannable verification URL"
    - "Revoked watermark: absolute inset-0 pointer-events-none with opacity 0.25 rotate(-30deg)"
    - "Loading skeleton: badge + button row + single large rounded-xl block (not reproducing internal layout)"

key-files:
  created:
    - src/components/CertificadoVisual.tsx
    - src/assets/logo/andescode-wordmark.png
    - src/assets/logo/fcefn.png
  modified:
    - src/sections/CertificadoVerificacion.tsx

key-decisions:
  - "FCEFN logo has solid dark/black circular background — not transparent; renders as dark circle on white card (acceptable v1 fidelity)"
  - "formatDate removed from CertificadoVerificacion.tsx (noUnusedLocals); CertificadoVisual.tsx has its own copy"
  - "FiDownload and usePdfGenerator deferred to Plan 02 to avoid noUnusedLocals build error"
  - "Worktree branch merged main to get phase 1-3 source files (types, services) missing from worktree base commit"

patterns-established:
  - "CertificadoVisual pattern: white card (relative overflow-hidden bg-white border border-[#E5E7EB] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] fade-in)"
  - "4-column field row collapses to grid-cols-2 on mobile"
  - "Bottom row (supervisor + seal + QR) stacks flex-col on mobile, flex-row on sm+"

requirements-completed: [VIS-01, QRPDF-01, QRPDF-02]

duration: 35min
completed: 2026-06-08
---

# Phase 4 Plan 01: QR + Visual Certificate Summary

**HTML/CSS certificate reproduction with embedded QRCodeSVG level H, replacing the Phase 2 metadata grid — renders logos, student name, fields, supervisor block, and scannable QR bottom-right; revoked certs show diagonal REVOCADO watermark.**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-06-08T14:05:00Z
- **Completed:** 2026-06-08T14:40:00Z
- **Tasks:** 3
- **Files modified:** 4 (2 new assets, 1 new component, 1 refactored section)

## Accomplishments

- New `CertificadoVisual` component (247 lines) faithfully reproducing `ref/assets/certificado.png` layout with AndesCode + FCEFN logos, title block, student name (all-caps 32px), description, 4-column field row, supervisor signature, AndesCode seal, and QR bottom-right
- QR embedded with `QRCodeSVG level="H"` (30% error correction) encoding `window.location.href` — QRPDF-01 and QRPDF-02 requirements completed
- Revoked state renders full certificate plus diagonal red REVOCADO watermark (opacity 0.25, rotate -30deg, pointer-events-none)
- `CertificadoVerificacion` FOUND state refactored: `max-w-2xl → max-w-3xl`, actions section (status badge + Copiar enlace) above fold per D-04, `CertificadoVisual` below; old metadata grid fully removed
- Build passes TypeScript strict mode (`tsc && vite build`)

## FCEFN Logo Alpha-Channel Finding

**Finding:** `ref/assets/logo fcefn.png` has a **solid dark/black circular background** — NOT transparent.

- The logo renders as a dark circle with the FCEFN/UNSJ text in very dark tones on the black circular background
- In the reference certificate (`ref/assets/certificado.png`), the FCEFN logo appears in a colored version (navy blue background) which may be a different asset version
- **v1 decision:** The dark circle renders on the white card — acceptable for v1 fidelity
- **Plan 02 PDF implication:** When embedding this logo in jsPDF via `addImage`, the dark background will be visible. Consider using `FAST` compression or placing on a light background, OR sourcing a higher-contrast/inverted version of the logo. Document as known limitation.

## Task Commits

1. **Task 1: Copy logo assets** — `4b67902` (feat)
2. **Merge main into worktree** — `8593eb2` (chore — infrastructure deviation)
3. **Task 2: Create CertificadoVisual component** — `506f6f7` (feat)
4. **Task 3: Refactor CertificadoVerificacion FOUND state** — `8fede3b` (feat)

## Files Created/Modified

- `src/assets/logo/andescode-wordmark.png` — AndesCode wordmark (black text on white, from ref/assets/Logotipo.png)
- `src/assets/logo/fcefn.png` — FCEFN/UNSJ logo (solid dark circular background, from ref/assets/logo fcefn.png)
- `src/components/CertificadoVisual.tsx` — NEW: HTML/CSS certificate reproduction component with QR, watermark, responsive layout
- `src/sections/CertificadoVerificacion.tsx` — MODIFIED: FOUND state refactored; old metadata grid removed; CertificadoVisual integrated

## Decisions Made

- `formatDate` was removed from `CertificadoVerificacion.tsx` (now resides only in `CertificadoVisual.tsx`) to satisfy `noUnusedLocals` TypeScript strict mode — plan said "preserve unchanged" but after the refactor it was unused
- `FiDownload` and `usePdfGenerator` deferred to Plan 02 to avoid unused import build errors (plan explicitly allows this)
- Loading skeleton updated to the new layout shape: badge skeleton + button row skeleton + single large `animate-pulse` rounded-xl block (~420px)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Merged main into worktree branch to get phase 1-3 source files**
- **Found during:** Task 2 (creating CertificadoVisual.tsx)
- **Issue:** Worktree branch `worktree-agent-aac2f7dacd1da3f28` was created from commit `ff3f89e` (pre-phase andesCode source). Files from phases 1-3 (`src/types/certificate.ts`, `src/services/pb.ts`, etc.) were missing from the worktree, causing TypeScript to fail with "Cannot find module '../types/certificate.ts'"
- **Fix:** `git merge main --no-commit --no-ff` brought in all phase 1-3 source files
- **Files affected:** All phase 1-3 source files (src/types/, src/services/, src/sections/admin/, etc.)
- **Verification:** `npx tsc --noEmit` exits 0 after merge
- **Committed in:** `8593eb2` (chore merge commit)

**2. [Rule 1 - Bug] Removed unused formatDate from CertificadoVerificacion.tsx**
- **Found during:** Task 3 (refactoring CertificadoVerificacion)
- **Issue:** After removing the metadata grid, `formatDate` was no longer called in the file. TypeScript `noUnusedLocals` would have caused a build error
- **Fix:** Removed `formatDate` from `CertificadoVerificacion.tsx`; the function has its own copy in `CertificadoVisual.tsx`
- **Files modified:** `src/sections/CertificadoVerificacion.tsx`
- **Verification:** `npm run build` exits 0
- **Committed in:** `8fede3b` (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both auto-fixes necessary for build correctness. No scope creep.

## Issues Encountered

None beyond the worktree merge and unused-variable cleanup documented above.

## Known Stubs

None — all rendered fields are wired to `cert` props from PocketBase. The "Descargar certificado PDF" button is intentionally absent (deferred to Plan 02, not a stub — the plan explicitly designates Plan 02 for that feature).

## Threat Surface Scan

No new network endpoints, auth paths, or trust boundary changes. `CertificadoVisual` is a purely presentational component — it receives already-fetched `cert` data (typed as `Certificate`) and renders it. `cert.dni` is confirmed absent from the component.

## Next Phase Readiness

- Plan 02 (PDF generation + usePdfGenerator hook) can proceed: `CertificadoVisual` is wired in `CertificadoVerificacion`, the button row slot is ready for the download button, and the FCEFN logo alpha-channel finding is documented
- Manual verification checkpoint: QR should be tested scanning on a real phone to confirm it resolves to the verification URL; revoked watermark should be confirmed diagonal on a real revoked certificate

---
*Phase: 04-qr-pdf-and-visual-certificate*
*Completed: 2026-06-08*
