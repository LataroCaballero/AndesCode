---
phase: 04-qr-pdf-and-visual-certificate
verified: 2026-06-08T16:00:00Z
status: human_needed
score: 9/9 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Open /certificados/:certificateCode for an active certificate on a real device. Scan the QR code with a phone camera."
    expected: "QR code resolves to the same /certificados/:certificateCode URL in the phone browser."
    why_human: "window.location.href correctness and QR scanner decoding cannot be verified without a running server and a real phone camera."
  - test: "Open /certificados/:certificateCode for a revoked certificate."
    expected: "Full certificate renders visually, REVOCADO watermark appears diagonally across the card, status badge at top shows 'Certificado revocado' in red above the fold on a 390px screen."
    why_human: "Visual rendering, fold position, and diagonal angle can only be confirmed by a human looking at a browser viewport."
  - test: "On an active certificate page, click 'Descargar certificado PDF'. Open the downloaded certificado-{code}.pdf file."
    expected: "File downloads with no console CORS error. PDF contains AndesCode wordmark and FCEFN logo in header, student name all-caps, all fields, QR code bottom-right, footer line with certificate code and date. Layout matches ref/assets/certificado.png."
    why_human: "PDF visual fidelity (layout, logos, text positions, font rendering) requires human inspection of the rendered PDF."
  - test: "On a revoked certificate page, click 'Descargar certificado PDF'."
    expected: "Downloaded PDF contains the diagonal semitransparent REVOCADO watermark over the certificate content."
    why_human: "PDF watermark rendering requires human visual inspection."
  - test: "Click 'Descargar certificado PDF' with network DevTools throttled to offline after page load, then re-enable. Or simulate fetch failure."
    expected: "Button shows animate-spin spinner and 'Generando PDF...' while generating. On failure, inline Spanish error 'No se pudo generar el PDF. Intentá de nuevo.' appears below the button row."
    why_human: "Loading spinner animation and inline error display require human observation in a real browser."
---

# Phase 4: QR, PDF, and Visual Certificate — Verification Report

**Phase Goal:** As a person verifying a certificate, I want to see the AndesCode certificate rendered visually with a scannable QR code and download it as a PDF, so that I can confirm its authenticity at a glance, re-verify it from any phone, and keep a print-ready branded document.

**Verified:** 2026-06-08T16:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | A user visiting /certificados/:certificateCode sees an HTML/CSS reproduction of the physical certificate (logos, name, fields, supervisor block, QR bottom-right) instead of the old metadata grid | VERIFIED | `CertificadoVisual.tsx` (247 lines) renders full layout; `CertificadoVerificacion.tsx` imports and renders `<CertificadoVisual cert={cert} />` at line 233; old `grid grid-cols-2 md:grid-cols-3` metadata grid is absent from file |
| 2 | A QR code (QRCodeSVG) is visible inside the certificate visual and encodes the full verification URL (window.location.href) | VERIFIED | `CertificadoVisual.tsx` line 217–224: `<QRCodeSVG value={window.location.href} size={100} level="H" bgColor="#FFFFFF" fgColor="#191919" marginSize={2} />` |
| 3 | The QR uses error correction level H | VERIFIED | `CertificadoVisual.tsx` line 220: `level="H"` literal present; `usePdfGenerator.ts` line 89: `errorCorrectionLevel: "H"` for the PDF QR |
| 4 | A revoked certificate renders the full visual plus a diagonal red REVOCADO watermark; the status badge stays above the fold | VERIFIED | `CertificadoVisual.tsx` lines 43–55: `isRevoked && <div ... pointer-events-none><span style={{ opacity: 0.25, transform: "rotate(-30deg)" }}>REVOCADO</span></div>`; status badge rendered before `<CertificadoVisual>` at line 153 of `CertificadoVerificacion.tsx` |
| 5 | The actions section (status badge + Copiar enlace button) is visible without scrolling on mobile | VERIFIED | `CertificadoVerificacion.tsx` lines 153–225: status badge + button row rendered before `<CertificadoVisual>` inside `max-w-3xl mx-auto`; loading skeleton also places badge + buttons first |
| 6 | Clicking 'Descargar certificado PDF' downloads a landscape PDF named certificado-{certificateCode}.pdf | VERIFIED | `usePdfGenerator.ts` line 311: `doc.save(\`certificado-${cert.certificateCode}.pdf\`)`; `CertificadoVerificacion.tsx` line 178: `onClick={() => generate(cert, window.location.href)}`; `new jsPDF({ orientation: "l", unit: "mm", format: "a4" })` at line 100 |
| 7 | The PDF reproduces the reference design: AndesCode logo, FCEFN logo, student name, all relevant fields, and an embedded QR | VERIFIED | `usePdfGenerator.ts` lines 119–311: addImage for wordmark and FCEFN logo, student name all-caps 18pt bold, description with splitTextToSize, 4-column field row (PERÍODO/ÁREA/HERRAMIENTAS/CALIFICACIÓN), supervisor block, QR 30×30mm with label |
| 8 | The PDF uses self-hosted Inter fonts (no Google Fonts CDN) — no CORS error in production | VERIFIED | `usePdfGenerator.ts` lines 15–16: `import interRegularUrl from '../assets/fonts/Inter-Regular.ttf?url'` and `import interBoldUrl from '../assets/fonts/Inter-Bold.ttf?url'`; fonts fetched via same-origin Vite assets, not CDN; `vite-env.d.ts` line 18: `declare module '*.ttf?url'` |
| 9 | A revoked certificate's PDF includes a diagonal semitransparent REVOCADO watermark | VERIFIED | `usePdfGenerator.ts` lines 294–307: `saveGraphicsState()` → `new GState({ opacity: 0.25 })` → `setTextColor(185,28,28)` → 60pt "REVOCADO" at `angle: 45` → `restoreGraphicsState()`, gated on `cert.status === "revoked"` |

**Score:** 9/9 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/CertificadoVisual.tsx` | HTML/CSS certificate reproduction with embedded QR and revoked watermark | VERIFIED | 247 lines; default export `CertificadoVisual`; contains `QRCodeSVG level="H"`, REVOCADO watermark, all required copy strings |
| `src/assets/logo/fcefn.png` | FCEFN/UNSJ logo for certificate header | VERIFIED | 1.3 MB file present in `src/assets/logo/` |
| `src/assets/logo/andescode-wordmark.png` | AndesCode wordmark for certificate header | VERIFIED | 28 KB file present in `src/assets/logo/` |
| `src/hooks/usePdfGenerator.ts` | Async PDF assembly + download trigger hook | VERIFIED | 323 lines; named export `usePdfGenerator`; contains jsPDF assembly, chunked base64, QRCode.toDataURL, GState watermark |
| `src/assets/fonts/Inter-Regular.ttf` | Self-hosted Inter 400 for PDF | VERIFIED | 65 KB TrueType font, > 30KB threshold |
| `src/assets/fonts/Inter-Bold.ttf` | Self-hosted Inter 700 for PDF | VERIFIED | 65 KB TrueType font, > 30KB threshold |
| `src/vite-env.d.ts` | TypeScript declaration for *.ttf?url imports | VERIFIED | Line 18: `declare module '*.ttf?url'`; no import statements present |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `CertificadoVerificacion.tsx` | `CertificadoVisual.tsx` | `import + <CertificadoVisual cert={cert} />` | WIRED | Line 12: import; line 233: `<CertificadoVisual cert={cert} />` with real PocketBase-fetched `cert` |
| `CertificadoVisual.tsx` | `qrcode.react` | `QRCodeSVG with level="H"` | WIRED | Line 8: `import { QRCodeSVG } from "qrcode.react"` ; line 220: `level="H"` |
| `CertificadoVerificacion.tsx` | `usePdfGenerator.ts` | `usePdfGenerator() + generate(cert, window.location.href)` | WIRED | Line 9: import; line 29: hook call; line 178: `onClick={() => generate(cert, window.location.href)}` |
| `usePdfGenerator.ts` | `jspdf` | `new jsPDF + addFileToVFS + addFont + doc.save` | WIRED | Line 11: `import { jsPDF, GState } from "jspdf"`; lines 100–311: full jsPDF assembly and `doc.save()` |
| `usePdfGenerator.ts` | `qrcode` | `QRCode.toDataURL with errorCorrectionLevel H` | WIRED | Line 12: `import QRCode from "qrcode"`; lines 88–93: `QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: "H", ... })` |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| `CertificadoVisual.tsx` | `cert` prop | `CertificadoVerificacion.tsx` → `pb.collection("certificates").getFirstListItem` → `setCert(record)` | Yes — PocketBase viewRule="" public endpoint returns full Certificate record | FLOWING |
| `usePdfGenerator.ts` `generate()` | `cert` param | Called with live `cert` from component state; `verificationUrl` from `window.location.href` | Yes — same Certificate record from PocketBase; not hardcoded | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| `npm run build` exits 0 (tsc strict + vite build) | `npm run build 2>&1 \| tail -5` | `✓ built in 2.06s` | PASS |
| `jspdf`, `qrcode`, `@types/qrcode` at exact pinned versions (no caret) | `node -e "..."` | jspdf: 4.2.1, qrcode: 1.5.4, @types/qrcode: 1.5.6 | PASS |
| `level="H"` literal in CertificadoVisual | `grep -n 'level="H"' src/components/CertificadoVisual.tsx` | Line 220 | PASS |
| `errorCorrectionLevel: "H"` in usePdfGenerator | `grep -n 'errorCorrectionLevel' src/hooks/usePdfGenerator.ts` | Line 89 | PASS |
| No forbidden jsPDF methods (CVE-2026-25755/31898) | `grep -Eq "addJS\|createAnnotation" usePdfGenerator.ts` | no forbidden methods | PASS |
| `cert.dni` absent from CertificadoVisual and usePdfGenerator | `grep -n "cert\.dni" ...` | NOT present in either file | PASS |
| `declare module '*.ttf?url'` in vite-env.d.ts | `grep -n "declare module.*ttf"` | Line 18 | PASS |
| Inter TTF fonts > 30KB each | `ls -la src/assets/fonts/` | Inter-Regular.ttf: 65KB, Inter-Bold.ttf: 65KB | PASS |
| Dangerous btoa spread absent from production code | `grep -n '\.\.\.new Uint8Array'` | Not in code (only in comment) | PASS |
| doc.save uses certificado- prefix and cert code | `grep -n "doc\.save"` | Line 311: `doc.save(\`certificado-${cert.certificateCode}.pdf\`)` | PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| QRPDF-01 | 04-01 | QR code visible on /certificados/:certificateCode encoding full verification URL | SATISFIED | `CertificadoVisual.tsx` line 217: `<QRCodeSVG value={window.location.href} .../>` |
| QRPDF-02 | 04-01 | QR uses error correction level H | SATISFIED | `CertificadoVisual.tsx` line 220: `level="H"`; `usePdfGenerator.ts` line 89: `errorCorrectionLevel: "H"` |
| QRPDF-03 | 04-02 | Download button on public page downloads certificado-{code}.pdf | SATISFIED | `CertificadoVerificacion.tsx` line 178 + `usePdfGenerator.ts` line 311 |
| QRPDF-04 | 04-02 | PDF reproduces reference design: logos, student name, all fields, embedded QR | SATISFIED (automated) | `usePdfGenerator.ts` lines 119–270 lay out all required elements; visual fidelity requires human check |
| QRPDF-05 | 04-02 | PDF uses self-hosted fonts, no Google Fonts CDN | SATISFIED | `src/assets/fonts/` contains Inter-Regular.ttf and Inter-Bold.ttf (65KB each); fonts loaded via Vite `?url`, same-origin fetch; `vite-env.d.ts` declares `*.ttf?url` module |
| VIS-01 | 04-01 | Verification page shows HTML/CSS reproduction of the physical certificate | SATISFIED | `CertificadoVisual.tsx` (247 lines) renders logos, title block, student name, 4-column fields, supervisor block, QR, footer; wired in `CertificadoVerificacion.tsx`; old metadata grid removed |

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | — | — | No debt markers (TBD/FIXME/XXX/TODO) found in any phase-modified file |

No anti-patterns found. All four phase-modified files (`CertificadoVisual.tsx`, `CertificadoVerificacion.tsx`, `usePdfGenerator.ts`, `vite-env.d.ts`) are free of debt markers and empty implementations.

---

### Human Verification Required

The automated checks all pass (9/9 truths verified, build passes, all artifacts exist and are wired). The following items require human observation in a real browser/device because they concern visual rendering, physical QR scanning, and PDF output quality.

#### 1. QR Code Scans to Correct URL

**Test:** Open `/certificados/:certificateCode` for a real certificate with the dev server running. Use a phone camera to scan the QR code inside the `CertificadoVisual` card.
**Expected:** The phone opens the same `/certificados/:certificateCode` URL in its browser.
**Why human:** `window.location.href` correctness and QR scanner decoding cannot be verified without a running server and a physical camera.

#### 2. Revoked Certificate Watermark and Above-Fold Status

**Test:** Open `/certificados/:certificateCode` for a revoked certificate on a 390px-wide viewport (or phone). Inspect without scrolling.
**Expected:** Status badge "Certificado revocado" (red) is visible above the fold. The certificate visual card renders fully with the REVOCADO text overlaid diagonally at an angle that is clearly a watermark (not a box or horizontal text).
**Why human:** Visual rendering, fold position on specific screen sizes, and diagonal angle perception require human observation.

#### 3. PDF Downloads with Correct Layout and No CORS Error

**Test:** On an active certificate page in production (or preview build), click "Descargar certificado PDF". Open the downloaded file.
**Expected:** File named `certificado-{code}.pdf` downloads without any CORS error in the browser console. PDF contains: AndesCode wordmark + FCEFN logo in header, student name in all-caps large font, all fields (PERÍODO, ÁREA DE DESEMPEÑO, HERRAMIENTAS, CALIFICACIÓN), supervisor name, QR code bottom-right labeled "VERIFICÁ LA AUTENTICIDAD", footer with certificate code and date. Layout resembles `ref/assets/certificado.png`.
**Why human:** PDF layout fidelity, font rendering, image embedding, and CORS behavior require human inspection of the actual PDF file.

#### 4. Revoked Certificate PDF Watermark

**Test:** On a revoked certificate page, click "Descargar certificado PDF". Open the downloaded PDF.
**Expected:** PDF contains the certificate content AND a diagonal, semitransparent red "REVOCADO" watermark overlaid across the full page.
**Why human:** PDF watermark rendering requires opening the PDF and visually inspecting it.

#### 5. PDF Loading and Error States

**Test:** On a certificate page, observe the "Descargar certificado PDF" button while clicking it. To test the error state, intercept the font fetch in DevTools (Network tab → block `*.ttf` requests) and click the button.
**Expected:** While generating: button shows an animated spinner and text "Generando PDF..." and is disabled. On failure: inline text "No se pudo generar el PDF. Intentá de nuevo." appears below the button row in red.
**Why human:** Animation (animate-spin), disabled state behavior, and inline error positioning require human observation in a live browser.

---

### Gaps Summary

None. All 9 must-have truths are verified with code evidence. No artifacts are missing, stubbed, or orphaned. No forbidden patterns found. The phase goal is structurally achieved in the codebase. Human verification items are required for visual/behavioral confirmation only.

---

_Verified: 2026-06-08T16:00:00Z_
_Verifier: Claude (gsd-verifier)_
