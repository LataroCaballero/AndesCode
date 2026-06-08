# Phase 4: QR, PDF, and Visual Certificate — Research

**Researched:** 2026-06-08
**Domain:** Client-side PDF generation, QR rendering, HTML/CSS certificate visual
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** The certificate visual replaces the metadata grid in `CertificadoVerificacion.tsx`. One cohesive layout.
- **D-02:** Fidelity to `ref/assets/certificado.png` — AndesCode logo + FCEFN/UNSJ logo top row, student name centered large, two-column fields, supervisor signature, QR bottom-right.
- **D-03:** Revoked: full certificate rendered with diagonal "REVOCADO" watermark, red semitransparent. Status badge remains in actions section above.
- **D-04:** Page layout: actions section (status badge + Descargar PDF + Copiar enlace) above — certificate visual below. Actions visible without scroll.
- **D-05:** PDF library: jsPDF (programmatic). Separate from the HTML/CSS visual — two independent implementations.
- **D-06:** Fonts: Inter self-hosted — `Inter-Regular.ttf` + `Inter-Bold.ttf` in `src/assets/fonts/`. Vite `?url` import → fetch → ArrayBuffer → base64 → jsPDF `addFileToVFS` + `addFont`.
- **D-07:** QR for PDF: `qrcode` package (headless, not `qrcode.react`) via `QRCode.toDataURL(url, { errorCorrectionLevel: 'H' })`.
- **D-08:** QR on page: `qrcode.react` (already installed), `<QRCodeSVG>`, error correction level H, 100×100px, bottom-right of certificate visual.

### Claude's Discretion

- PDF orientation (landscape — confirmed by reference image analysis)
- Exact colors in certificate visual (use `#191919` / `#FFFFFF` / `#4342FF` palette)
- Typography inside certificate (Inter for fields, Fira Code for certificate ID)
- PDF filename format: `certificado-{certificateCode}.pdf`
- QR dimensions in certificate visual (100px) and PDF (30mm × 30mm)

### Deferred Ideas (OUT OF SCOPE)

- Open Graph metadata dinámica — diferido a v2 (SHARE-02). Requires SSR/prerender.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| QRPDF-01 | QR code visible on `/certificados/:certificateCode` encoding the full verification URL | `qrcode.react` `<QRCodeSVG>` — already installed (v4.2.0). `value={window.location.href}` |
| QRPDF-02 | QR uses error correction level H (30% redundancy) | `<QRCodeSVG level="H">` — prop is typed as `'L' \| 'M' \| 'Q' \| 'H'`, default `'L'`. Must be explicitly set. |
| QRPDF-03 | User can download the certificate as PDF from the public page | `jsPDF` 4.2.1 — `doc.save(filename)` triggers browser download. Hook `usePdfGenerator` with loading state. |
| QRPDF-04 | PDF reproduces reference design: logos, student name, all fields, embedded QR | jsPDF `addImage` for logos + QR dataURL; `addFont` for Inter; text positioning in mm on landscape A4. |
| QRPDF-05 | PDF uses self-hosted fonts (no CDN) to avoid CORS in production | Vite `?url` import of TTF → `fetch(url)` → ArrayBuffer → base64 → `doc.addFileToVFS` + `doc.addFont`. |
| VIS-01 | Verification page shows HTML/CSS reproduction of the physical certificate | `CertificadoVisual` component with `cert: Certificate` prop. White card, logos, dividers, fields, QR, revoked watermark. |
</phase_requirements>

---

## Summary

Phase 4 adds three capabilities to the existing `/certificados/:certificateCode` page: an embedded QR code (QRPDF-01/02), a downloadable PDF certificate (QRPDF-03/04/05), and an HTML/CSS visual reproduction of the physical certificate design (VIS-01). The page currently shows a metadata grid and a copy-link button; this phase replaces the metadata grid with the certificate visual and adds a download-PDF button.

The technical challenge is two independent implementations: the HTML/CSS visual is a React component that renders via the DOM, and the PDF is programmatically assembled using jsPDF without any DOM-to-PDF conversion. Both share the same `Certificate` data model but render it independently. The font self-hosting decision (D-06) is the most CORS-sensitive issue and the approach with Vite `?url` imports is the correct solution for this Vite + React stack.

jsPDF 4.2.1 (the latest version as of 2026-03-17) patches two known injection CVEs (CVE-2026-25755 affecting `addJS`, and CVE-2026-31898 affecting `createAnnotation`). Neither vulnerable method is used in this phase — the plan must pin exactly to `jspdf@4.2.1` or `jspdf@latest`, not a caret range, to lock the known-safe version.

**Primary recommendation:** Install `jspdf@4.2.1` and `qrcode@1.5.4` + `@types/qrcode@1.5.6`. Implement `CertificadoVisual` component and `usePdfGenerator` hook as two independent units. Load Inter TTF files via Vite `?url` + `fetch`. Never use jsPDF's `addJS` or `createAnnotation` methods.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| QR display on page | Browser / Client | — | React component `<QRCodeSVG>` renders SVG in DOM |
| HTML/CSS certificate visual | Browser / Client | — | React component, purely presentational, no server involvement |
| PDF generation | Browser / Client | — | jsPDF runs entirely in browser; `doc.save()` triggers browser download |
| Font loading for PDF | Browser / Client | CDN / Static (Vite build) | TTF files served as static assets by Vite build; fetched via URL at PDF generation time |
| QR dataURL for PDF | Browser / Client | — | `qrcode.toDataURL()` runs in browser without DOM |
| Certificate data fetch | API / Backend | — | Existing PocketBase fetch in `CertificadoVerificacion.tsx` — unchanged |

---

## Standard Stack

### Core (new packages for this phase)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `jspdf` | 4.2.1 | Client-side PDF generation | Locked decision D-05. Most widely used JS PDF library. Ships bundled TypeScript types. Latest version patches all known CVEs (March 2026). [VERIFIED: npm registry] |
| `qrcode` | 1.5.4 | Headless QR dataURL generation for PDF | Locked decision D-07. The canonical headless QR library for Node/browser (soldair/node-qrcode). No DOM required. [VERIFIED: npm registry] |
| `@types/qrcode` | 1.5.6 | TypeScript definitions for `qrcode` | Required for strict TypeScript — `qrcode` does not ship its own types. [VERIFIED: npm registry] |

### Already Installed (used in this phase)

| Library | Version | Purpose | Usage |
|---------|---------|---------|-------|
| `qrcode.react` | 4.2.0 | React QR component for page display | `<QRCodeSVG level="H" size={100}>` in `CertificadoVisual` (D-08) |
| `react-icons` | 5.5.0 | `FiDownload`, `FiCopy`, `FiCheckCircle`, `FiXCircle` | Action section buttons |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `jspdf` | `pdfmake` | pdfmake uses declarative JSON config, easier layout but less control over exact mm positioning required for certificate fidelity |
| `jspdf` | html2canvas + jsPDF | html2canvas captures DOM as image — simpler but larger bundle, worse text quality in PDF, CORS issues with external resources |
| `qrcode` (headless) | canvas + `qrcode.react` | Would require a hidden canvas DOM element; `qrcode` toDataURL is cleaner and works headlessly |
| Vite `?url` + fetch | `vite-plugin-arraybuffer` | The plugin is simpler but adds a dependency; `?url` + fetch is zero-dependency and idiomatic Vite |

**Installation:**

```bash
npm install jspdf@4.2.1 qrcode@1.5.4
npm install --save-dev @types/qrcode@1.5.6
```

**Version verification (confirmed 2026-06-08):**

```
jspdf@4.2.1      latest publish: 2026-03-17
qrcode@1.5.4     registry confirmed
@types/qrcode@1.5.6  registry confirmed
```

---

## Package Legitimacy Audit

> slopcheck was unavailable at research time. All packages below are tagged `[ASSUMED]` for provenance purposes. The planner must gate each install behind a `checkpoint:human-verify` task.

| Package | Registry | Age | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-------------|-----------|-------------|
| `jspdf` | npm | ~10+ yrs | github.com/parallax/jsPDF | [ASSUMED] | Approved — well-known library, 31k+ GitHub stars, official org `parallax`, no postinstall script |
| `qrcode` | npm | ~10+ yrs | github.com/soldair/node-qrcode | [ASSUMED] | Approved — canonical QR library, no postinstall script |
| `@types/qrcode` | npm | ~5+ yrs | DefinitelyTyped | [ASSUMED] | Approved — standard @types package, no postinstall script |

**Packages removed due to slopcheck [SLOP] verdict:** none

**Packages flagged as suspicious [SUS]:** none — all three have authoritative source repos and match known-legitimate package names from official documentation and widely cited usage.

*Since slopcheck was unavailable, the planner must add a `checkpoint:human-verify` step before the install task.*

---

## Architecture Patterns

### System Architecture Diagram

```
User navigates to /certificados/:certificateCode
          │
          ▼
CertificadoVerificacion (section)
  ├── fetch cert from PocketBase (existing)
  ├── state: loading | found | notFound | error
  │
  └── [found state]
        │
        ├── ActionsSection (inline in CertificadoVerificacion)
        │     ├── StatusBadge (active/revoked)
        │     ├── Button: Descargar certificado PDF
        │     │     └── calls usePdfGenerator.generate()
        │     │           ├── fetch(interRegularUrl) → ArrayBuffer → base64
        │     │           ├── fetch(interBoldUrl) → ArrayBuffer → base64
        │     │           ├── QRCode.toDataURL(verificationUrl, {level:'H'}) → pngDataUrl
        │     │           ├── new jsPDF({orientation:'l', unit:'mm', format:'a4'})
        │     │           ├── addFileToVFS + addFont (Inter Regular + Bold)
        │     │           ├── addImage (AndesCode logo, FCEFN logo, QR, seal)
        │     │           ├── text() calls (all fields, titles, footer)
        │     │           ├── [if revoked] saveGraphicsState → setGState(opacity:0.25) → text('REVOCADO', angle:45) → restoreGraphicsState
        │     │           └── doc.save('certificado-{code}.pdf') → browser download
        │     └── Button: Copiar enlace (existing pattern)
        │
        └── CertificadoVisual (new component)
              ├── props: cert: Certificate
              ├── White card (border, rounded-xl, shadow, overflow:hidden relative)
              ├── [revoked] overlay div with "REVOCADO" text rotate(-30deg) opacity-25
              ├── Header row: AndesCode logo+wordmark (left) + FCEFN logo (right)
              ├── Divider
              ├── Title block: "CERTIFICADO" / subtitle / "se certifica que"
              ├── Student name (all-caps, large)
              ├── Description paragraph
              ├── Divider
              ├── Footer data row: PERÍODO | ÁREA | HERRAMIENTAS | CALIFICACIÓN
              ├── Divider
              ├── Bottom row:
              │     ├── Supervisor block (signature line + name + role)
              │     ├── AndesCode seal (logo centered)
              │     └── QR block: <QRCodeSVG level="H" size={100}> + label
              └── Footer line: // CERTIFICADO: {code}  |  San Juan, {date}
```

### Recommended Project Structure

```
src/
├── assets/
│   └── fonts/                    # NEW
│       ├── Inter-Regular.ttf     # Download from Google Fonts
│       └── Inter-Bold.ttf        # Download from Google Fonts
├── components/
│   └── CertificadoVisual.tsx     # NEW — HTML/CSS certificate reproduction
├── hooks/
│   └── usePdfGenerator.ts        # NEW — async PDF assembly + download trigger
└── sections/
    └── CertificadoVerificacion.tsx   # MODIFY — add actions section + CertificadoVisual
```

### Pattern 1: Vite `?url` + fetch for TTF binary loading

**What:** Import TTF as a URL via Vite's `?url` suffix; fetch it at PDF generation time as ArrayBuffer; convert to base64 for jsPDF.

**When to use:** Any time jsPDF needs self-hosted font files in a Vite project.

**Important:** The project already has `/// <reference types="vite/client" />` in `src/vite-env.d.ts`. The `vite/client` types include built-in declarations for `*.png`, `*.svg`, etc. but NOT for `*.ttf?url`. A module declaration must be added to `src/vite-env.d.ts` for TypeScript strict mode to accept the import. [VERIFIED: vite.dev/guide/assets]

```typescript
// src/vite-env.d.ts — ADD these declarations (do not add import statements)
declare module '*.ttf?url' {
  const url: string;
  export default url;
}

// src/hooks/usePdfGenerator.ts
import interRegularUrl from '../assets/fonts/Inter-Regular.ttf?url';
import interBoldUrl from '../assets/fonts/Inter-Bold.ttf?url';

async function loadFontAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  // Convert ArrayBuffer to base64 string — standard jsPDF pattern
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
```

**Warning:** `btoa(String.fromCharCode(...new Uint8Array(buf)))` uses spread — for large font files (Inter Regular ~300KB), this can hit the call stack limit. Safe alternative: [ASSUMED]

```typescript
function arrayBufferToBase64(buf: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buf);
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}
```

### Pattern 2: jsPDF font registration

**What:** Register a self-hosted TTF font in jsPDF for use with `setFont()`.

**Source:** [VERIFIED: github.com/parallax/jsPDF README + types/index.d.ts]

```typescript
import { jsPDF } from 'jspdf';

const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });

// A4 landscape: width = 297mm, height = 210mm
const base64Regular = await loadFontAsBase64(interRegularUrl);
const base64Bold = await loadFontAsBase64(interBoldUrl);

doc.addFileToVFS('Inter-Regular.ttf', base64Regular);
doc.addFont('Inter-Regular.ttf', 'Inter', 'normal');

doc.addFileToVFS('Inter-Bold.ttf', base64Bold);
doc.addFont('Inter-Bold.ttf', 'Inter', 'bold');

doc.setFont('Inter', 'normal');
doc.setFontSize(9);
doc.text('Hello', 15, 30);
```

### Pattern 3: jsPDF image embedding (PNG logos + QR)

**What:** Add a PNG image (from a URL import or base64 dataURL) into the PDF.

**Source:** [VERIFIED: github.com/parallax/jsPDF types/index.d.ts]

```typescript
// For logos — import as URL, fetch, convert to base64
import logoUrl from '../assets/logo/logo.png';     // standard Vite PNG import → URL string
// PNG imports work without ?url suffix — Vite handles them automatically
doc.addImage(logoUrl, 'PNG', 15, 8, 35, 12);   // x, y, width(mm), height(mm)

// For QR — generated as dataURL by qrcode package
import QRCode from 'qrcode';
const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
  errorCorrectionLevel: 'H',
  width: 200,         // pixels — only affects internal resolution
  margin: 2,
});
doc.addImage(qrDataUrl, 'PNG', 252, 175, 30, 30);  // bottom-right, 30mm × 30mm
```

**TypeScript note:** PNG imports (`import logo from './logo.png'`) are typed as `string` by the `vite/client` types already in the project — no additional declaration needed. [VERIFIED: vite-env.d.ts has `/// <reference types="vite/client" />`]

### Pattern 4: jsPDF GState opacity for revoked watermark

**What:** Apply semitransparent diagonal text as a watermark.

**Source:** [VERIFIED: github.com/parallax/jsPDF types/index.d.ts — GState interface]

```typescript
// GState is a class on the jsPDF instance, NOT a named export from 'jspdf'
const pageW = doc.internal.pageSize.getWidth();   // 297mm in landscape
const pageH = doc.internal.pageSize.getHeight();  // 210mm in landscape

doc.saveGraphicsState();
doc.setGState(new doc.GState({ opacity: 0.25 }));
doc.setTextColor(185, 28, 28);   // #b91c1c red-700
doc.setFont('Inter', 'bold');
doc.setFontSize(60);
// text() angle option rotates counterclockwise in degrees
// Use 45 degrees for a diagonal watermark
doc.text('REVOCADO', pageW / 2, pageH / 2, { angle: 45, align: 'center' });
doc.restoreGraphicsState();
```

**TypeScript note on GState:** The type definition has `setGState(gState: any): jsPDF` — the parameter is typed as `any`, so `new doc.GState({opacity: 0.25})` compiles without issue under strict mode. No cast needed. [VERIFIED: github.com/parallax/jsPDF types/index.d.ts]

### Pattern 5: qrcode.react in certificate visual

**What:** `<QRCodeSVG>` inside the HTML/CSS component with error correction level H.

**Source:** [VERIFIED: github.com/zpao/qrcode.react README]

```tsx
import { QRCodeSVG } from 'qrcode.react';

// Already used in Phase 3 admin: src/sections/admin/AdminCertificateList.tsx:16
<QRCodeSVG
  value={window.location.href}
  size={100}
  level="H"
  bgColor="#FFFFFF"
  fgColor="#191919"
  marginSize={2}
/>
```

**TypeScript note:** The `level` prop is typed `'L' | 'M' | 'Q' | 'H'` — string literal union. Passing `"H"` (double quotes) compiles correctly under strict mode.

### Pattern 6: React hook for async PDF generation

**What:** A custom hook that manages loading state and error state for async PDF generation.

```typescript
// src/hooks/usePdfGenerator.ts
import { useState, useCallback } from 'react';
import type { Certificate } from '../types/certificate.ts';

interface UsePdfGeneratorResult {
  generate: (cert: Certificate, verificationUrl: string) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

export function usePdfGenerator(): UsePdfGeneratorResult {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (cert: Certificate, verificationUrl: string) => {
    setIsGenerating(true);
    setError(null);
    try {
      // ... font loading + QR generation + jsPDF assembly
      doc.save(`certificado-${cert.certificateCode}.pdf`);
    } catch (err) {
      setError('No se pudo generar el PDF. Intentá de nuevo.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generate, isGenerating, error };
}
```

**TypeScript note:** `useCallback` with async function requires the return type `Promise<void>` or TypeScript will infer it correctly — no explicit annotation needed if strict mode can infer it. `noUnusedLocals` means the `err` variable in `catch` must either be used or typed as `unknown` and ignored with `void`. Use `console.error(err)` to satisfy this.

### Anti-Patterns to Avoid

- **Using html2canvas to capture the DOM for PDF:** html2canvas is a different package (not installed), causes CORS errors with external images, produces rasterized text (not vector), and creates a heavier PDF. The decision is to use jsPDF programmatically (D-05).
- **Using `addJS` or `createAnnotation` methods of jsPDF:** Both are vulnerable to PDF object injection (CVE-2026-25755 and CVE-2026-31898). This phase does not need either method — never call them.
- **Relying on `btoa(String.fromCharCode(...entireBuffer))` for large ArrayBuffers:** The spread operator hits the call stack limit for arrays > ~65,000 elements. Inter Regular is ~300KB = ~300,000 bytes. Use the chunked loop pattern (see Pattern 1).
- **Importing TTF files without the `?url` suffix:** A bare import (`import font from './Inter-Regular.ttf'`) will be treated as an unknown module by Vite without additional config. The `?url` suffix explicitly requests the asset URL.
- **Pre-generating the PDF on component mount:** PDF generation is expensive (font loading + QR generation + layout). Only generate on click of "Descargar certificado". The button shows a spinner via `isGenerating` state.
- **Using `window.location.href` inside `usePdfGenerator` directly:** This couples the hook to the browser environment and makes it harder to test. Accept `verificationUrl: string` as a parameter from the caller.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| QR encoding | QR matrix calculation | `qrcode.react` + `qrcode` | QR encoding has 40 data versions, 4 error correction levels, masking patterns, Reed-Solomon encoding. Hand-rolling is impractical. |
| PDF binary format | PDF stream construction | `jsPDF` | PDF spec is ~1000 pages. Font subsetting, image compression, cross-reference tables — all handled by jsPDF. |
| ArrayBuffer to base64 for large buffers | `btoa(String.fromCharCode(...buf))` | Chunked loop (see Pattern 1) | Spread operator on large Uint8Array hits call stack limit. Chunk in 8192-byte segments. |
| Font metrics for text wrapping in PDF | Manual character width calculation | `doc.splitTextToSize(text, maxWidth)` | jsPDF provides this utility — use it for the description paragraph. |

**Key insight:** The PDF spec and QR spec are both deeply complex binary formats. The entire value of this phase is wiring up existing expert libraries correctly, not implementing encoding algorithms.

---

## Common Pitfalls

### Pitfall 1: Vite `?url` import — TypeScript strict mode error

**What goes wrong:** TypeScript strict mode rejects `import fontUrl from '../assets/fonts/Inter-Regular.ttf?url'` with "Cannot find module" because no type declaration exists for `.ttf?url` modules.

**Why it happens:** `vite/client` types (already in vite-env.d.ts) declare PNG/SVG/etc. but not TTF with the `?url` suffix. The `?url` query parameter creates a virtual module identifier that TypeScript doesn't recognize.

**How to avoid:** Add to `src/vite-env.d.ts` (the ONLY place — no import statements allowed there):
```typescript
declare module '*.ttf?url' {
  const url: string;
  export default url;
}
```
This does NOT require adding import statements — just the `declare module` block. [VERIFIED: vite.dev/guide/assets]

### Pitfall 2: Logo images in PDF need base64 or fetchable URL — NOT HTML img src

**What goes wrong:** Passing a Vite-processed asset URL (e.g., `/assets/logo-abc123.png`) to `doc.addImage()` causes a CORS error in production when the PDF generator fetches it. Or the URL is a relative path that doesn't resolve correctly from jsPDF's context.

**Why it happens:** In production, Vite hashes asset filenames. The URL from a PNG import (e.g., `import logoUrl from './logo.png'`) is a correct URL at runtime — BUT `jsPDF.addImage()` can accept a base64 dataURL directly. Fetching the URL at PDF generation time is the safer pattern.

**How to avoid:** For logos used in the PDF, either:
- (Option A) Fetch them at PDF generation time: `fetch(logoUrl).then(r => r.arrayBuffer()).then(arrayBufferToBase64)` then pass the base64 string to `doc.addImage`.
- (Option B) Import them as inline base64 with Vite's `?inline` suffix: `import logoB64 from './logo.png?inline'` — returns `data:image/png;base64,...` string directly. Declare `declare module '*.png?inline'` in vite-env.d.ts.

Option A is preferable because it keeps file sizes out of the JS bundle. All logo fetches can be done in parallel with font loading using `Promise.all`.

### Pitfall 3: jsPDF text rotation — angle is counterclockwise in PDF coordinate system

**What goes wrong:** Setting `angle: 45` to get a diagonal bottom-left to top-right watermark rotates text in the unexpected direction.

**Why it happens:** PDF coordinate system has Y axis inverted versus CSS. jsPDF's `text()` `angle` option rotates counterclockwise in degrees. [ASSUMED based on multiple GitHub issue reports — actual behavior should be tested during implementation]

**How to avoid:** For a bottom-left to top-right diagonal (like CSS `rotate(-30deg)` roughly), use a positive angle in jsPDF (counterclockwise = up-right direction). Test with `angle: 45` first; if wrong direction, try `angle: -45` or `angle: 315`. The exact visual is Claude's discretion — verify during implementation.

### Pitfall 4: `doc.GState` is a property on the instance, NOT a named export from `jspdf`

**What goes wrong:** `import { GState } from 'jspdf'` — TypeScript error because GState is NOT a named export from the module. It is accessed as `doc.GState` on a jsPDF instance.

**Why it happens:** jsPDF's API design exposes GState as an instance property/constructor, not a standalone export. [VERIFIED: types/index.d.ts — `export class GState` IS exported but the instance property `doc.GState` is also the common pattern]

**How to avoid:** Either:
- `new doc.GState({opacity: 0.25})` — using the instance property
- Or `import { GState } from 'jspdf'` then `new GState({opacity: 0.25})` — using the named export

Check which compiles under the project's strict TypeScript after installing jsPDF. Both should work — `new doc.GState({...})` is the more commonly seen pattern in the jsPDF issue tracker.

### Pitfall 5: `qrcode` is NOT `qrcode.react` — different packages for different purposes

**What goes wrong:** Trying to use `QRCode.toDataURL()` from the `qrcode.react` package (which only provides React components, no headless API).

**Why it happens:** The two packages share a name prefix. `qrcode.react` is a React component wrapper; `qrcode` (soldair/node-qrcode) is the headless library.

**How to avoid:** Install `qrcode` separately as locked in D-07. Import as:
```typescript
import QRCode from 'qrcode';
// NOT from 'qrcode.react'
const dataUrl = await QRCode.toDataURL(url, { errorCorrectionLevel: 'H', width: 200 });
```

### Pitfall 6: Font loading race condition — awaiting fonts before PDF assembly

**What goes wrong:** Starting `doc.text()` calls before `addFileToVFS`/`addFont` completes causes jsPDF to fall back to the built-in Helvetica font, silently producing a PDF without Inter.

**Why it happens:** Font loading is async (fetch calls); if not properly awaited, PDF assembly starts before fonts are registered.

**How to avoid:** The `usePdfGenerator` hook must await all font and QR loading before calling any `doc.text()` or `doc.addFont()`:
```typescript
const [base64Regular, base64Bold, qrDataUrl] = await Promise.all([
  loadFontAsBase64(interRegularUrl),
  loadFontAsBase64(interBoldUrl),
  QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: 'H', width: 200 }),
]);
// Only then proceed to jsPDF assembly
```

### Pitfall 7: FCEFN logo has a black background — PNG transparency issue in PDF

**What goes wrong:** The `ref/assets/logo fcefn.png` appears to have a dark/black circular background (confirmed by visual inspection). When embedded in a white-background PDF, it will show the dark circle rather than the expected transparent logo.

**Why it happens:** The FCEFN logo PNG uses a dark background rather than true transparency. The same file is used in the reference certificate but on the certificate the logo may have been composited differently.

**How to avoid:** The planner should flag this for the implementer to check. Options:
1. Use the logo as-is (dark background) — may look correct on the reference design since the certificate background is white and the logos are in a top row
2. Use the HTML `<img>` element for the HTML/CSS visual (browser handles transparency correctly)
3. For the PDF, `doc.addImage` supports PNG transparency — the issue is only if the source file itself has a solid dark background rather than alpha transparency

This requires human review of the actual PNG file during implementation.

### Pitfall 8: `noUnusedParameters` TypeScript constraint

**What goes wrong:** The `usePdfGenerator` hook if written as a standalone function with unused parameter names fails TypeScript strict mode.

**Why it happens:** CLAUDE.md specifies `noUnusedParameters: true` in tsconfig.

**How to avoid:** Every parameter in `usePdfGenerator.ts` must be used. The hook signature `(cert: Certificate, verificationUrl: string)` — both are used in PDF assembly. No issue expected if the hook is implemented correctly.

---

## Code Examples

Verified patterns from official sources:

### jsPDF — Landscape A4 setup

```typescript
// Source: github.com/parallax/jsPDF types/index.d.ts [VERIFIED]
import { jsPDF } from 'jspdf';

const doc = new jsPDF({
  orientation: 'l',    // landscape
  unit: 'mm',
  format: 'a4',        // 297mm × 210mm
});
// doc.internal.pageSize.getWidth()  → 297
// doc.internal.pageSize.getHeight() → 210
const margin = 15; // mm
```

### jsPDF — Wrapped text for description paragraph

```typescript
// Source: jsPDF API — splitTextToSize utility [ASSUMED based on jsPDF docs]
const maxWidth = doc.internal.pageSize.getWidth() - margin * 2; // 297 - 30 = 267mm
const lines = doc.splitTextToSize(cert.description ?? '', maxWidth);
doc.text(lines, margin, currentY);
currentY += lines.length * 5; // ~5mm per line at 8pt
```

### qrcode.react — QRCodeSVG with level H

```typescript
// Source: github.com/zpao/qrcode.react README [VERIFIED]
import { QRCodeSVG } from 'qrcode.react';

<QRCodeSVG
  value={window.location.href}
  size={100}
  level="H"
  bgColor="#FFFFFF"
  fgColor="#191919"
  marginSize={2}
/>
```

### qrcode headless — toDataURL for PDF

```typescript
// Source: github.com/soldair/node-qrcode README [VERIFIED]
import QRCode from 'qrcode';
import type { QRCodeToDataURLOptions } from 'qrcode';

const opts: QRCodeToDataURLOptions = {
  errorCorrectionLevel: 'H',
  width: 200,      // internal resolution, does not affect PDF mm size
  margin: 2,
  color: { dark: '#191919', light: '#ffffff' },
};
const dataUrl: string = await QRCode.toDataURL(verificationUrl, opts);
// dataUrl is "data:image/png;base64,..."
doc.addImage(dataUrl, 'PNG', x, y, 30, 30); // 30mm × 30mm in PDF
```

### CSS revoked watermark

```tsx
// HTML/CSS certificate visual — revoked watermark overlay
// Source: 04-UI-SPEC.md D-03 [CITED]
{cert.status === 'revoked' && (
  <div
    className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
    aria-hidden
  >
    <span
      className="text-[#b91c1c] font-bold select-none text-[72px] sm:text-[72px] text-[48px]"
      style={{ opacity: 0.25, transform: 'rotate(-30deg)' }}
    >
      REVOCADO
    </span>
  </div>
)}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| html2canvas → jsPDF | jsPDF programmatic only | — | No rasterization, smaller PDF, no CORS issues |
| `addJS()` for PDF JavaScript | Avoid entirely | CVE-2026-25755 patched in 4.1.0 | Do not use this method |
| `createAnnotation()` | Avoid entirely | CVE-2026-31898 patched in 4.2.1 | Do not use this method |
| QR in jsPDF via hidden canvas | `qrcode.toDataURL()` headless | — | No DOM dependency in hook |

**Deprecated/outdated:**
- `jsPDF` versions < 4.1.0: vulnerable to CVE-2026-25755 (addJS injection). Must use >= 4.1.0.
- `jsPDF` versions < 4.2.1: vulnerable to CVE-2026-31898 (createAnnotation injection). Must use 4.2.1.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `btoa(String.fromCharCode(...))` spread on large buffers hits call stack limit | Pattern 1, Pitfall | If wrong, the simpler spread pattern works fine — use whichever doesn't cause issues |
| A2 | jsPDF `text()` `angle` option rotates counterclockwise | Pitfall 3, Pattern 4 | Watermark rotation direction may be reversed — implementer should test and flip sign if needed |
| A3 | `doc.GState` vs `import { GState }` — both patterns compile under strict TS | Pitfall 4 | Minor — both should work; if one fails, try the other |
| A4 | FCEFN logo PNG has dark solid background (not transparent alpha) | Pitfall 7 | If the PNG is actually transparent, no issue at all |
| A5 | `doc.splitTextToSize()` line height at 8pt is ~5mm | Code Examples | Description paragraph may overflow or have too much space — adjust during implementation |
| A6 | All three packages (jspdf, qrcode, @types/qrcode) are legitimate packages matching known libraries | Package Legitimacy Audit | Risk is low given 10+ year history and authoritative GitHub repos; slopcheck would confirm |

**If this table is empty:** All claims were verified or cited. This table is NOT empty — see above.

---

## Open Questions

1. **FCEFN Logo Background**
   - What we know: The logo file at `ref/assets/logo fcefn.png` (confirmed by visual inspection) appears dark/black on a circular background.
   - What's unclear: Whether the PNG has a transparent alpha channel or a solid black background. If solid black, it renders fine in a white-background context but looks wrong in a PDF.
   - Recommendation: Implementer checks the PNG's alpha channel during Wave 0 setup. If no transparency, use the AndesCode logo (`src/assets/logo/logo.png`) only, or convert the FCEFN logo to white/transparent version.

2. **Logo assets — `ref/assets/` vs `src/assets/`**
   - What we know: `ref/assets/` contains the reference logos; `src/assets/logo/` contains only `logo.png` (the A-shape AndesCode icon, not the wordmark). `ref/assets/Logotipo.png` is the "ANDESCODE" wordmark.
   - What's unclear: Whether to copy the logos from `ref/assets/` to `src/assets/` for use in the HTML/CSS component and PDF.
   - Recommendation: Copy `ref/assets/logo.png` (triangle icon) and `ref/assets/logo fcefn.png` to `src/assets/logo/` as `andescode-icon.png` and `fcefn.png`. Also copy `ref/assets/Logotipo.png` as `andescode-wordmark.png`. Keep `ref/assets/` as the reference-only directory.

3. **Inter TTF file size and chunk size for ArrayBuffer→base64**
   - What we know: Inter Regular 400 is approximately 300KB as a TTF; the chunked base64 conversion pattern is the safe approach.
   - What's unclear: Whether there are presubset / Latin-only TTF variants that are smaller.
   - Recommendation: Use the full Inter TTF from Google Fonts (latin subset). The full weight-400 latin-only TTF is ~100KB — well within safe spread limit but use chunked pattern as defensive default.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js / npm | Package install | ✓ | System default | — |
| `qrcode.react` | QRPDF-01, QRPDF-02 | ✓ (already in package.json) | 4.2.0 | — |
| `jspdf` | QRPDF-03, QRPDF-04, QRPDF-05 | ✗ (not installed) | — | Must install |
| `qrcode` | QRPDF-04 (QR for PDF) | ✗ (not installed) | — | Must install |
| `@types/qrcode` | TypeScript strict | ✗ (not installed) | — | Must install |
| `src/assets/fonts/` directory | D-06 | ✗ (does not exist) | — | Must create + download TTF files |
| Inter-Regular.ttf | QRPDF-05 | ✗ (not downloaded) | — | Download from Google Fonts / gwfh.mranftl.com |
| Inter-Bold.ttf | QRPDF-05 | ✗ (not downloaded) | — | Download from Google Fonts / gwfh.mranftl.com |

**Missing dependencies with no fallback:**
- `jspdf`, `qrcode`, `@types/qrcode` — must be installed before implementation
- `src/assets/fonts/Inter-Regular.ttf` and `Inter-Bold.ttf` — must be downloaded from Google Fonts

**Missing dependencies with fallback:**
- None — all missing items are straightforward installs/downloads.

**Font download URLs (for Wave 0 setup):**
- Google WebFonts Helper: `https://gwfh.mranftl.com/fonts/inter?subsets=latin` — select weights 400 and 700, format TTF, download.
- Official Inter releases: `https://github.com/rsms/inter/releases` — download Inter.zip, extract `Inter-Regular.ttf` and `Inter-Bold.ttf`.

---

## Security Domain

> `security_enforcement: true`, `security_asvs_level: 1` in config.json

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | This phase adds no authentication changes |
| V3 Session Management | no | No session changes |
| V4 Access Control | no | PDF download and QR are public-facing features — no auth required (by design, matches viewRule) |
| V5 Input Validation | yes | Certificate data from PocketBase is already fetched and typed — no new user input in this phase. jsPDF text calls receive typed `Certificate` fields. |
| V6 Cryptography | no | No cryptographic operations |

### Known Threat Patterns for jsPDF + user data

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| PDF Object Injection via `addJS()` | Tampering | **Do not call `addJS()` — not used in this phase** |
| PDF Object Injection via `createAnnotation()` | Tampering | **Do not call `createAnnotation()` — not used in this phase** |
| User-controlled content in PDF text | Information Disclosure | Certificate data comes from PocketBase, typed as `Certificate`. No raw user input is concatenated into PDF streams. jsPDF `text()` method does not evaluate content as code. Low risk. |
| Font loading CORS in production | Denial of Service | Self-hosted fonts (D-06) — no CORS. This is the explicit reason for D-06. |
| XSS via PDF download | XSS | Client-side PDF generation does not touch the DOM. `doc.save()` triggers browser download of a binary file. No script execution vector. |

**Security verdict for this phase:** LOW risk. The phase uses jsPDF exclusively for `addFileToVFS`, `addFont`, `addImage`, `text`, `setFont`, `setFontSize`, `setTextColor`, `setGState`, `saveGraphicsState`, `restoreGraphicsState`, and `save`. None of these methods are the vulnerable methods. Pin to `jspdf@4.2.1` exactly to stay clear of the patched CVEs.

---

## Sources

### Primary (HIGH confidence)
- `github.com/parallax/jsPDF` (types/index.d.ts) — addFileToVFS, addFont, addImage, GState, jsPDFOptions signatures
- `github.com/zpao/qrcode.react` (README) — QRCodeSVG props: value, size, level, bgColor, fgColor, marginSize
- `github.com/soldair/node-qrcode` (README) — QRCode.toDataURL API, options, Promise/async support
- `vite.dev/guide/assets` — `?url` suffix import pattern, TypeScript module declarations
- `src/vite-env.d.ts` — confirmed `/// <reference types="vite/client" />` present (codebase)
- `src/sections/admin/AdminCertificateList.tsx` — confirmed `qrcode.react` usage pattern with `level="H"` (codebase)
- `package.json` — confirmed installed packages and versions (codebase)

### Secondary (MEDIUM confidence)
- npm registry: `jspdf@4.2.1`, `qrcode@1.5.4`, `@types/qrcode@1.5.6` — confirmed version numbers
- sentinelone.com/vulnerability-database/cve-2026-31898 — CVE-2026-31898 fixed in jsPDF 4.2.1
- vpncentral.com CVE-2026-25755 — CVE-2026-25755 fixed in jsPDF 4.1.0+

### Tertiary (LOW confidence)
- jsPDF GState watermark examples — GitHub issue threads, docs pages (implementation details confirmed via types but exact runtime behavior of `angle` rotation direction is [ASSUMED])
- `btoa` call stack limit for large Uint8Array — known general JavaScript constraint

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified on npm registry with confirmed versions
- Architecture: HIGH — based on locked decisions in CONTEXT.md and existing codebase patterns
- jsPDF API: HIGH — verified via official type definitions fetched from GitHub
- qrcode.react API: HIGH — verified via official README
- Pitfalls: MEDIUM — most verified via official docs; angle rotation direction is ASSUMED
- Security CVEs: HIGH — verified via security advisories with specific version numbers

**Research date:** 2026-06-08
**Valid until:** 2026-09-08 (90 days — jsPDF minor versions release infrequently; check for new CVEs before production deploy)
