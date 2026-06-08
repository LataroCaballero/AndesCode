---
phase: 04-qr-pdf-and-visual-certificate
plan: 02
subsystem: ui
tags: [react, typescript, jspdf, qrcode, pdf, fonts, tailwind, vite]

requires:
  - phase: 04-01
    provides: CertificadoVisual component, CertificadoVerificacion FOUND state refactored, logo assets (andescode-wordmark.png, fcefn.png)

provides:
  - usePdfGenerator hook — async PDF assembly with jsPDF, self-hosted Inter, embedded QR, REVOCADO watermark
  - Inter-Regular.ttf and Inter-Bold.ttf in src/assets/fonts/ (latin subset, gwfh.mranftl.com)
  - "Descargar certificado PDF" button wired in CertificadoVerificacion actions section
  - TTF module declaration in vite-env.d.ts for Vite ?url imports

affects:
  - public verification page — adds PDF download capability
  - production build — jsPDF and qrcode added to bundle

tech-stack:
  added:
    - jspdf@4.2.1 (exact pin — CVE-2026-25755 and CVE-2026-31898 patched)
    - qrcode@1.5.4 (exact pin — headless QR generation)
    - "@types/qrcode@1.5.6" (exact pin — TypeScript definitions)
  patterns:
    - "Vite ?url + fetch + ArrayBuffer → chunked base64 for self-hosted TTF loading in jsPDF"
    - "Promise.all for parallel font + QR + logo loading before jsPDF assembly (race condition avoidance)"
    - "GState named export from jspdf for opacity watermark (not doc.GState instance property)"
    - "usePdfGenerator: useState isGenerating + error, useCallback generate, try/catch/finally"

key-files:
  created:
    - src/hooks/usePdfGenerator.ts
    - src/assets/fonts/Inter-Regular.ttf
    - src/assets/fonts/Inter-Bold.ttf
  modified:
    - package.json
    - package-lock.json
    - src/vite-env.d.ts
    - src/sections/CertificadoVerificacion.tsx

key-decisions:
  - "GState imported as named export from 'jspdf' instead of doc.GState — new doc.GState({}) caused TS7009 in strict mode"
  - "FCEFN logo (solid dark circular background from Plan 01 finding) embedded as-is in PDF — dark circle visible on white PDF background (acceptable v1 fidelity, documented as known limitation)"
  - "Worktree base mismatch resolved via git merge fast-forward (ea58f1d onto ff3f89e) — same pattern as Plan 01"

requirements-completed: [QRPDF-03, QRPDF-04, QRPDF-05]

duration: 45min
completed: 2026-06-08
---

# Phase 4 Plan 02: PDF Generator Summary

**jsPDF client-side certificate PDF with self-hosted Inter fonts, chunked ArrayBuffer-to-base64, embedded QR (qrcode headless), REVOCADO watermark, and a wired "Descargar certificado PDF" button with loading and inline error states.**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-06-08T14:42:00Z
- **Completed:** 2026-06-08T15:27:00Z
- **Tasks:** 4 (Task 1 pre-approved gate + 3 auto)
- **Files modified:** 6 (2 new TTF assets, 1 new hook, 3 modified files)

## Accomplishments

- Installed `jspdf@4.2.1`, `qrcode@1.5.4`, `@types/qrcode@1.5.6` at exact pinned versions (no caret) following the human-approved package legitimacy gate
- Added `declare module '*.ttf?url'` to `src/vite-env.d.ts` (QRPDF-05 — no import statements, preserving global augmentation)
- Downloaded `Inter-Regular.ttf` and `Inter-Bold.ttf` from gwfh.mranftl.com (latin subset, ~65KB each, valid TrueType format)
- Created `src/hooks/usePdfGenerator.ts` (323 lines) with:
  - Named export `usePdfGenerator()` returning `{ generate, isGenerating, error }`
  - `generate(cert: Certificate, verificationUrl: string): Promise<void>` wrapped in `useCallback`
  - Chunked `arrayBufferToBase64` helper (8192-byte chunks) — avoids call-stack limit on 65KB+ TTF files
  - `Promise.all` parallel loading of both fonts + QR dataURL + logo PNGs before jsPDF assembly
  - Landscape A4 PDF layout: logos, dividers, title block ("CERTIFICADO"), student name all-caps 18pt bold, description with `splitTextToSize`, 4-column field row (PERÍODO / ÁREA / HERRAMIENTAS / CALIFICACIÓN), supervisor block, AndesCode seal, QR 30×30mm, footer line
  - REVOCADO watermark: `saveGraphicsState` → `GState({ opacity: 0.25 })` → `setTextColor(185,28,28)` → 60pt bold "REVOCADO" at angle 45 → `restoreGraphicsState`
  - `doc.save('certificado-{certificateCode}.pdf')` triggers browser download
  - No `addJS` or `createAnnotation` (CVE-2026-25755 / CVE-2026-31898)
  - `cert.dni` never written to PDF
- Wired `usePdfGenerator` in `CertificadoVerificacion.tsx`:
  - `FiDownload` added to react-icons import
  - `usePdfGenerator()` called in component body
  - btn-primary "Descargar certificado PDF" as first action button with `generate(cert, window.location.href)`
  - Loading state: `animate-spin` spinner + "Generando PDF..." + `disabled`
  - Inline `pdfError` message below button row

## Task Commits

1. **Task 1: Package legitimacy gate** — pre-approved by orchestrator (no commit needed)
2. **Task 2: Install packages, TTF declaration, Inter fonts** — `34890f4` (chore)
3. **Task 3: Create usePdfGenerator hook** — `930ea43` (feat)
4. **Task 4: Wire download button in CertificadoVerificacion** — `ce114a7` (feat)

## Files Created/Modified

- `package.json` — jspdf@4.2.1, qrcode@1.5.4 (dependencies); @types/qrcode@1.5.6 (devDependency) — exact pins, no caret
- `package-lock.json` — updated lockfile
- `src/vite-env.d.ts` — added `declare module '*.ttf?url'` block (no import statements)
- `src/assets/fonts/Inter-Regular.ttf` — Inter weight 400, latin subset, 65KB (TrueType)
- `src/assets/fonts/Inter-Bold.ttf` — Inter weight 700, latin subset, 65KB (TrueType)
- `src/hooks/usePdfGenerator.ts` — NEW: async PDF hook
- `src/sections/CertificadoVerificacion.tsx` — MODIFIED: download button + usePdfGenerator wiring

## Decisions Made

- **GState named export:** `new doc.GState({opacity: 0.25})` caused TypeScript error TS7009 ("target lacks a construct signature") in strict mode. Fixed by importing `GState` as a named export from `jspdf` instead: `import { jsPDF, GState } from 'jspdf'`. Both patterns are documented in RESEARCH.md as valid.
- **FCEFN logo in PDF:** Plan 01 SUMMARY documented that `fcefn.png` has a solid dark circular background (not transparent). The logo is embedded as-is via `fetchToBase64` → `addImage`. The dark circle appears on the white PDF background — acceptable for v1 fidelity.
- **Worktree base mismatch:** The worktree was created from commit `ff3f89e` (pre-phase source) while the expected base was `ea58f1d` (post-wave-1 merge). Resolved by `git merge ea58f1d` (fast-forward), same pattern as Plan 01.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] GState import pattern — TS7009 strict mode error**
- **Found during:** Task 3
- **Issue:** `new doc.GState({ opacity: 0.25 })` — TypeScript strict mode threw TS7009 "new expression whose target lacks a construct signature has an implicit 'any' type" because `doc.GState` is typed as `any` in the instance property
- **Fix:** Imported `GState` as a named export: `import { jsPDF, GState } from 'jspdf'`. Then `new GState({ opacity: 0.25 })` compiles cleanly under strict mode.
- **Files modified:** `src/hooks/usePdfGenerator.ts`
- **Verification:** `npm run build` exits 0
- **Commit:** `930ea43`

**2. [Rule 3 - Blocking] Worktree base mismatch — merged wave 1 before execution**
- **Found during:** Pre-execution (base commit check)
- **Issue:** Worktree HEAD was `ff3f89e` (the real repo's main), not `ea58f1d` (expected base with wave 1 changes). Files from phases 1-4/plan-01 (CertificadoVerificacion.tsx, certificate.ts, CertificadoVisual.tsx, logo assets, etc.) were absent.
- **Fix:** `git merge ea58f1d` — fast-forward brought all wave 1 files into the worktree
- **Files affected:** All phase 1-4/plan-01 source files
- **Verification:** HEAD matches `ea58f1d` after merge

## Known Stubs

None — the hook and button are fully wired to real `Certificate` data. The PDF assembles all certificate fields from the `cert` prop.

## Threat Surface Scan

No new network endpoints or auth paths introduced. The `usePdfGenerator` hook runs entirely client-side:
- Fetches font TTFs and logo PNGs from same-origin Vite static assets (no CDN, no cross-origin requests)
- `QRCode.toDataURL` runs headlessly in browser — no network call
- All `doc.text()` calls use typed `Certificate` fields (no raw user-input concatenation)
- `cert.dni` confirmed absent from hook
- `doc.addJS` and `doc.createAnnotation` (CVE-2026-25755 / CVE-2026-31898) confirmed absent

## Self-Check: PASSED

| Check | Status |
|-------|--------|
| `src/hooks/usePdfGenerator.ts` | FOUND |
| `src/assets/fonts/Inter-Regular.ttf` | FOUND |
| `src/assets/fonts/Inter-Bold.ttf` | FOUND |
| `.planning/phases/04-qr-pdf-and-visual-certificate/04-02-SUMMARY.md` | FOUND |
| Commit `34890f4` (chore — packages + fonts) | FOUND |
| Commit `930ea43` (feat — usePdfGenerator hook) | FOUND |
| Commit `ce114a7` (feat — download button wiring) | FOUND |
| `npm run build` exits 0 | PASSED |
