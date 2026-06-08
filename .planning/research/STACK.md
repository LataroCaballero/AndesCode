# Technology Stack

**Project:** AndesCode — Sistema de Certificados Verificables
**Researched:** 2026-06-06
**Milestone:** Adding certificate verification + QR + PDF + PocketBase to existing React 19 + Vite 7 site

---

## Recommended Stack (additions only)

The existing stack (React 19.1 / TypeScript 5.8 / Vite 7 / Tailwind CSS v4 / react-router-dom v7) is locked and must not change. All additions below integrate into it.

---

### Backend Client

| Technology | Version (verified) | Purpose | Why |
|------------|-------------------|---------|-----|
| `pocketbase` | **0.27.0** | PocketBase JS SDK — auth, CRUD, realtime | Official SDK, ships its own TypeScript types, `LocalAuthStore` persists token in localStorage and auto-syncs across browser tabs. Single import covers all API needs. No wrapper library needed. |

**Usage pattern for React SPA (no SSR):**

Create a singleton module `src/lib/pb.ts`:

```typescript
import PocketBase from 'pocketbase';

export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
```

Import `pb` directly wherever needed — no React Context required for the client itself. For reactive auth state, subscribe to `pb.authStore.onChange()` inside a Context provider that wraps `/admin` routes only. The default `LocalAuthStore` handles persistence automatically.

**TypeScript types:** Define a typed PocketBase instance using generics:

```typescript
interface Certificate {
  id: string;
  cert_id: string; // AC-YYYY-NNN
  student_name: string;
  dni: string;
  period: string;
  status: 'valid' | 'revoked';
  // ...
}

interface TypedPB extends PocketBase {
  collection(idOrName: 'certificates'): RecordService<Certificate>;
}

export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL) as TypedPB;
```

**Why not a wrapper like `pocketbase-react`:** Unmaintained community wrapper. The official SDK's `onChange` callback is sufficient for a simple admin panel with a single authenticated user.

---

### QR Code Generation

| Technology | Version (verified) | Purpose | Why |
|------------|-------------------|---------|-----|
| `qrcode.react` | **4.2.0** | SVG QR code component | Ships `QRCodeSVG` component — pure SVG output, no raster. React 19 peer dependency added in v4.2.0 (released Dec 2024). Zero dependencies. Works in the browser with no Node.js shims. |

**Usage:**

```typescript
import { QRCodeSVG } from 'qrcode.react';

<QRCodeSVG
  value={`https://andescode.com.ar/certificados/${cert.cert_id}`}
  size={128}
  level="H"          // High error correction — robust when printed small
  fgColor="#191919"
  bgColor="#FFFFFF"
  marginSize={2}
/>
```

**Why not `qr-code-styling`:** Heavier, imperative API (not JSX), requires manual DOM node refs, styling features (gradients, rounded corners) are unnecessary for a certificate QR. The only requirement here is SVG output — `qrcode.react` satisfies it with less code.

**Why not `react-qr-code`:** Functionally equivalent alternative. `qrcode.react` has higher weekly downloads (~2M vs ~600K), broader browser test coverage, and explicit React 19 support as of v4.2.0.

**Extracting SVG string for PDF embedding:** Use `QRCodeSVG` rendered into a hidden `<div>` and call `innerHTML` on it, or use the `qrcode` headless package (which `qrcode.react` wraps internally) to generate the path data directly. Preferred approach: render the QR as a PNG `<img>` inside `@react-pdf/renderer` using a canvas-to-dataURL conversion (see PDF section).

---

### PDF Generation

| Technology | Version (verified) | Purpose | Why |
|------------|-------------------|---------|-----|
| `@react-pdf/renderer` | **4.5.1** | Client-side certificate PDF rendering | Declarative JSX-based API. Ships `PDFDownloadLink`, `usePDF` hook, and `BlobProvider` — all client-side, no server needed. Matches the existing React mental model. Supports images (logos), custom fonts, and precise layout control needed for a formal certificate design. v3+ has native Vite/Rollup compatibility; v4.5.1 is current. |

**Why not `jsPDF`:** jsPDF is an imperative, canvas-based API. It measures and positions every text string manually. Maintaining a visually consistent certificate layout with logos, multiple text blocks, and QR image positioning is error-prone and brittle. `@react-pdf/renderer` uses a declarative component tree — much easier to keep aligned with the reference design.

**Why not server-side rendering:** PROJECT.md constraint: no Node backend. PocketBase is the only server.

**Vite 7 compatibility:** v3+ removed the Node.js shim requirement that caused Vite 4/5 issues (GitHub issue #2454, resolved). v4.5.1 ships as an ES module without Node-specific internals. No `vite-plugin-shim-react-pdf` or polyfill plugin needed for Vite 7.

**Key APIs to use:**

```typescript
import { PDFDownloadLink, Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts once (at module level, outside components)
Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Inter-Bold.ttf', fontWeight: 700 },
  ],
});

// Certificate document component
const CertificateDocument = ({ cert }: { cert: Certificate }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      {/* logo, text blocks, QR image */}
    </Page>
  </Document>
);

// In the UI
<PDFDownloadLink document={<CertificateDocument cert={cert} />} fileName={`${cert.cert_id}.pdf`}>
  {({ loading }) => loading ? 'Generando…' : 'Descargar PDF'}
</PDFDownloadLink>
```

**Font note:** Self-host Inter TTF files in `public/fonts/`. Google Fonts CDN in PDF font registration works, but self-hosted avoids CORS and network dependency during PDF generation.

**QR in PDF:** Render `QRCodeSVG` onto an offscreen `<canvas>` via a temporary DOM node, call `canvas.toDataURL('image/png')`, and pass the data URL to `<Image>` in the PDF document. This avoids SVG-in-PDF complexity.

---

### Environment Variables (Vite)

No library needed — this is a Vite built-in.

**Pattern:**

1. `.env` file at repo root:
   ```
   VITE_POCKETBASE_URL=https://pb.andescode.com.ar
   ```

2. `.env.development` for local dev:
   ```
   VITE_POCKETBASE_URL=http://127.0.0.1:8090
   ```

3. TypeScript types — augment `src/vite-env.d.ts` (file already exists from Vite scaffold):
   ```typescript
   /// <reference types="vite/client" />

   interface ImportMetaEnv {
     readonly VITE_POCKETBASE_URL: string;
   }

   interface ImportMeta {
     readonly env: ImportMetaEnv;
   }
   ```

4. Usage: `import.meta.env.VITE_POCKETBASE_URL`

**Rules:**
- Never prefix secrets with `VITE_` — they are bundled into client JS
- `VITE_POCKETBASE_URL` is a public URL; this is safe
- Add `.env.development` to `.gitignore` only if it contains local-only values; `.env` with the production URL can be committed if the URL is not secret

---

### Admin Panel — Forms

| Technology | Version (verified) | Purpose | Why |
|------------|-------------------|---------|-----|
| `react-hook-form` | **7.77.0** | Admin form state and validation | Uncontrolled inputs — zero re-renders on keystroke. No install-time dependency on a UI library. Works by spreading `register()` props directly onto Tailwind-styled native inputs. v7 is stable, long-running major. |
| `zod` | **4.4.3** | Schema validation + TypeScript inference | v4 (released 2025) is 14x faster than v3, smaller bundle. `z.infer<typeof schema>` gives compile-time types that mirror the PocketBase collection schema. |
| `@hookform/resolvers` | **5.4.0** | Bridge between react-hook-form and Zod | Resolves zod schemas at submit time. v5.4.0 supports Zod v4 auto-detection. |

**Why not `@tanstack/form`:** Overkill for a single-admin panel with 4-5 form fields. react-hook-form + zod is the most widespread, well-documented pattern in the React + TypeScript ecosystem.

**Why not Formik:** Controlled inputs, higher re-render count, slower than react-hook-form. Ecosystem momentum has shifted.

**Typical admin form pattern:**

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  cert_id: z.string().regex(/^AC-\d{4}-\d{3}$/),
  student_name: z.string().min(2),
  status: z.enum(['valid', 'revoked']),
});

type CertForm = z.infer<typeof schema>;

function CertForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<CertForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: CertForm) => {
    await pb.collection('certificates').create(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('cert_id')} className="border rounded px-3 py-2 w-full" />
      {errors.cert_id && <p className="text-red-500 text-sm">{errors.cert_id.message}</p>}
      {/* ... */}
    </form>
  );
}
```

---

### Admin Panel — Tables

| Technology | Version (verified) | Purpose | Why |
|------------|-------------------|---------|-----|
| `@tanstack/react-table` | **8.21.3** | Headless table for certificate list | Headless — renders zero DOM. You write the `<table>` markup with Tailwind classes. Provides sorting, pagination, and filtering logic without coupling to a component library. Works with React 19. Tiny (14KB). |

**Why not a full component library (MUI, Ant Design):** This is a minimal internal admin panel. Importing a full design system conflicts with Tailwind v4 and adds hundreds of KB. TanStack Table gives data management behavior while the markup stays Tailwind-native.

**Why not a plain `<table>`:** Certificate list needs sortable columns (date, status), search filtering, and pagination. TanStack Table handles all three with clean state management.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| QR generation | `qrcode.react` `QRCodeSVG` | `qr-code-styling` | Heavier, imperative API, unnecessary styling features |
| QR generation | `qrcode.react` | `react-qr-code` | Equivalent but lower downloads, no explicit React 19 verification |
| PDF generation | `@react-pdf/renderer` | `jsPDF` | Imperative canvas API, brittle layout for complex cert design |
| PDF generation | `@react-pdf/renderer` | `html2canvas + jsPDF` | DOM-to-image approach breaks with particles background, unreliable fonts |
| Forms | `react-hook-form + zod` | `@tanstack/form` | Newer, less documentation for this use case, same outcome |
| Forms | `react-hook-form + zod` | `Formik` | Higher re-renders, declining community momentum |
| Validation | `zod` v4 | `yup` | Zod v4 faster, TypeScript inference is tighter, same ecosystem |
| Tables | `@tanstack/react-table` | Full component lib (MUI, shadcn/ui) | Conflicts with existing Tailwind v4 setup, overkill |
| Auth state | `pb.authStore.onChange` | `pocketbase-react` wrapper | Unmaintained, unnecessary abstraction |

---

## Installation

```bash
# Backend client
npm install pocketbase

# QR code — SVG output
npm install qrcode.react

# PDF generation (client-side)
npm install @react-pdf/renderer

# Admin forms
npm install react-hook-form zod @hookform/resolvers

# Admin table (headless)
npm install @tanstack/react-table
```

---

## Sources

- PocketBase JS SDK README (Context7 / github.com/pocketbase/js-sdk) — HIGH confidence
- PocketBase JS SDK npm version (npm show): 0.27.0 — HIGH confidence
- qrcode.react GitHub (github.com/zpao/qrcode.react) — HIGH confidence; v4.2.0 released Dec 2024, adds React 19 peer dep
- qrcode.react npm version: 4.2.0 — HIGH confidence
- @react-pdf/renderer npm version (npm show): 4.5.1 — HIGH confidence
- @react-pdf/renderer docs (Context7 / diegomura/react-pdf) — HIGH confidence
- @react-pdf/renderer Vite compatibility — MEDIUM confidence (v3+ resolved shim requirement per GitHub issue #2454; Vite 7 specific testing not found, but no regressions reported in 4.x)
- react-hook-form docs (Context7 / react-hook-form/react-hook-form) — HIGH confidence; v7.77.0
- @hookform/resolvers npm version: 5.4.0; Zod v4 compatibility noted in community issues — MEDIUM confidence
- zod npm version (npm show): 4.4.3 — HIGH confidence
- @tanstack/react-table npm version (npm show): 8.21.3 — HIGH confidence
- Vite env variables: vite.dev/guide/env-and-mode — HIGH confidence
- WebSearch comparisons (qrcode.react vs alternatives, jsPDF vs react-pdf): npm-compare.com, npmtrends.com — MEDIUM confidence (corroborated by official docs)
