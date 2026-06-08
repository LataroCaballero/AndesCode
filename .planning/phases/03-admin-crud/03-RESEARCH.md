# Phase 3: Admin CRUD - Research

**Researched:** 2026-06-08
**Domain:** React admin panel — PocketBase CRUD, drawer pattern, tags input, QR SVG download
**Confidence:** HIGH

## Summary

Phase 3 replaces the placeholder `src/pages/admin/index.tsx` with a full admin panel. The panel is a single-route (`/admin`) SPA component tree: a sticky top bar, a searchable/filterable/paginated certificate list, a right-side drawer for create/edit, a confirmation modal for revoke/reactivate, and a per-row QR SVG download. No new routes are added.

The entire UI is built from existing project dependencies. The key gaps to address before implementation: (1) `qrcode.react` is NOT in `package.json` and must be installed — it is a legitimate, widely-used package (~1.8M weekly downloads); (2) the `framer-motion` package is installed as `framer-motion` (not the `motion` package), so the correct import is `from 'framer-motion'`, not `from 'motion/react'`; (3) the `QRCodeSVG` component forwards its ref directly to the `<svg>` element as `RefAttributes<SVGSVGElement>`.

PocketBase SDK patterns for search, pagination, and status updates are straightforward and well-documented. The `pb.filter()` helper prevents injection when constructing dynamic filter strings. Auto-generating `certificateCode` requires one extra `getList` call filtered by year before the create form opens.

**Primary recommendation:** Structure the admin panel as `AdminPage` (orchestrator with state) + three sub-components (`AdminTopBar`, `AdminCertificateList`, `AdminCertificateDrawer`) + one shared utility (`ConfirmModal`). Keep all state in `AdminPage` and pass down via props — no separate context needed for a single-route panel.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Top bar mínima sticky — fija al hacer scroll. Contiene logo "ANDESCODE" (Fira Code Bold), nombre/email del admin logueado, y botón de logout. Sin sidebar — solo existe una sección en v1.
- **D-02:** Fondo del panel: `grid-bg` (mismo que login) — mantiene coherencia visual con el resto del admin. Sin cambio de fondo al pasar de la página de bienvenida al panel.
- **D-03:** El formulario de crear/editar (14 campos del modelo `Certificate`) aparece en un **drawer lateral** que desliza desde la derecha. La lista de certificados permanece visible a la izquierda. No se crean sub-rutas — todo en `/admin` con estado local.
- **D-04:** El campo `technologies` (array de strings) se edita con un **input de tags**: el admin escribe una tecnología, presiona Enter para agregarla como tag, y puede eliminarlas con ×. Mismo patrón aplica al campo `competencies` si es editable.
- **D-05:** El `certificateCode` se auto-genera al abrir el formulario de crear: el frontend hace un `getList` filtrado por año actual para contar los existentes y calcular `NNN+1`. El campo aparece pre-poblado en formato `AC-YYYY-NNN` y el admin puede editarlo antes de guardar.
- **D-06:** El formulario valida todos los campos requeridos client-side antes de enviar (ADMIN-06). Los campos requeridos se determinan por el schema en REQUIREMENTS.md.
- **D-07:** Los botones de revocar/reactivar están en la **fila de la lista** — el admin no necesita abrir el drawer para cambiar el estado. El botón refleja el estado actual: "Revocar" si está activo, "Reactivar" si está revocado.
- **D-08:** Tanto revocar como reactivar muestran un **modal de confirmación** antes de ejecutar. El modal incluye el nombre del estudiante y el ID del certificado para que el admin confirme que es el correcto. Botón primario rojo para revocar; botón verde para reactivar; botón "Cancelar" siempre visible.
- **D-09:** El QR se descarga como SVG desde un **botón por fila** en la lista (columna de acciones). La lista tiene 3 acciones por fila con **iconos siempre visibles**: editar (lápiz), revocar/reactivar (toggle), y descargar QR (ícono de QR). No requiere abrir el drawer.
- **D-10:** La generación del SVG es client-side (`qrcode.react` ya está instalada — se usará en Phase 4 también para la página pública). Para el download, se serializa el SVG del componente y se dispara un `<a download>`.

### Claude's Discretion

- Número de registros por página en la lista (ej: 20 es estándar con PocketBase)
- Ordenamiento por defecto de la lista (por fecha de creación DESC es lo más útil)
- Diseño exacto de la top bar (altura, padding, separadores)
- Transición/animación del drawer (slide-in desde derecha, duración ~200ms)
- Diseño exacto del modal de confirmación (texto, layout de botones)

### Deferred Ideas (OUT OF SCOPE)

- Sidebar con múltiples secciones — diferido a v2 cuando existan más secciones admin (estadísticas, configuración). La top bar mínima es suficiente para v1.
- Acciones en hover (hover-reveal) — no implementar; el panel admin es desktop-first pero la accesibilidad requiere iconos siempre visibles.
- QR download también desde el drawer — diferido; el botón por fila es suficiente para v1.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADMIN-01 | Admin ve lista de todos los certificados con columnas: ID, nombre del estudiante, fecha de emisión, estado | PocketBase `getList()` with sort `-created`, pagination support — see Standard Stack and patterns |
| ADMIN-02 | Lista tiene búsqueda por nombre, ID de certificado y filtro por estado (activo/revocado) | PocketBase filter `~` operator for text search, `=` for status filter, `pb.filter()` for safe param binding |
| ADMIN-03 | Lista está paginada | `getList(page, perPage, options)` returns `{ totalItems, totalPages, items }` — see PocketBase patterns |
| ADMIN-04 | Admin puede crear nuevo certificado con todos los campos del modelo de datos | `pb.collection('certificates').create(data)` — 14-field form in drawer |
| ADMIN-05 | Al crear, `certificateCode` se auto-genera en formato `AC-YYYY-NNN` (editable antes de guardar) | Query `getList` filtered to current year to count `NNN+1` — see Code Examples |
| ADMIN-06 | Formulario valida todos los campos requeridos antes de enviar | Client-side required field check, TypeScript types from `src/types/certificate.ts` |
| ADMIN-07 | Admin puede editar todos los campos de un certificado existente | `pb.collection('certificates').update(id, data)` — same drawer form pre-populated |
| ADMIN-08 | Admin puede revocar certificado con confirmación; action requires confirm modal | `pb.collection('certificates').update(id, { status: 'revoked' })` after modal confirm |
| ADMIN-09 | Admin puede descargar QR de certificado como SVG desde lista | `qrcode.react` `QRCodeSVG` with `SVGSVGElement` ref + `XMLSerializer` + blob download |
| ADMIN-10 | La acción de revocar es reversible (admin puede reactivar) | Same pattern as revoke: `update(id, { status: 'active' })` — same modal, green button |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Certificate list display + pagination | Browser/Client | — | Thin render of PocketBase response; no SSR needed for admin panel |
| Search + filter state | Browser/Client | — | Local React state drives filter params passed to PocketBase query |
| Create/edit form (drawer) | Browser/Client | — | Local form state; submit calls PocketBase API |
| Revoke/reactivate | Browser/Client | PocketBase API | Client triggers status update; PocketBase enforces auth via listRule/updateRule |
| QR SVG generation + download | Browser/Client | — | `qrcode.react` renders SVG in DOM; `XMLSerializer` + blob download, no server involvement |
| Auth guard | Browser/Client | PocketBase API | `AdminGuard` already implemented in Phase 2; tokens validated server-side |
| Auto-generate certificateCode | Browser/Client | PocketBase API | Client counts existing codes for year; PocketBase UNIQUE index prevents collisions |
| Data persistence | PocketBase API | — | All state changes persist via REST API calls through the JS SDK |

---

## Standard Stack

### Core (all already installed — except qrcode.react)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| pocketbase | 0.27.0 | SDK for all certificate CRUD operations | Already integrated in `src/services/pb.ts`; single source of truth |
| react | 19.1.0 | Component framework | Locked by project |
| framer-motion | 12.34.3 | Drawer slide-in/out animation | Already installed; existing pattern in `BackgroundGradientAnimation.tsx` |
| react-icons (fi) | 5.5.0 | Action icons: `FiEdit2`, `FiToggleLeft`, `FiToggleRight`, `FiDownload`, `FiX`, `FiPlus` | Already installed; fi family used in Header and Footer |
| tailwindcss | 4.1.11 | All styling | Locked by project |

### New Dependency Required

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| qrcode.react | 4.2.0 | Render QR codes as SVG for download (ADMIN-09) and Phase 4 public page | 1.8M weekly downloads, 10+ years old, ISC license, maintained by zpao — single React QR library |

**Installation:**
```bash
npm install qrcode.react
```

**Version verification (confirmed):**
```
npm view qrcode.react version  → 4.2.0
Published: 2024-12-11
First published: 2014-03-16 (10+ years old)
```

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| framer-motion (drawer) | CSS `slide-up`/`fade-in` from `style.css` | CSS animations lack `AnimatePresence` exit animations; framer-motion gives proper slide-out on close |
| qrcode.react | react-qr-code | Both are legitimate; qrcode.react is older, more downloads, already referenced in context |
| XMLSerializer (SVG download) | Canvas `toDataURL()` then PNG | SVG is vector, smaller, and renders crisply at any print size — matches decision D-10 |

---

## Package Legitimacy Audit

slopcheck was not installable in this environment. All packages below are tagged `[ASSUMED]` for the new dependency (slopcheck unavailable), but verified via npm registry and authoritative sources.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| qrcode.react | npm | 10+ yrs (2014) | ~1.8M/wk | [github.com/zpao/qrcode.react](https://github.com/zpao/qrcode.react) | not run | Approved [ASSUMED] |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

Manual legitimacy signals for `qrcode.react`:
- First published 2014-03-16 (10+ years of history)
- 1,821,947 weekly downloads [CITED: npmtrends.com/qrcode.react]
- Maintained by zpao (Paul O'Shannessy, former React core team member) — well-known maintainer
- No `postinstall` script (confirmed via `npm view qrcode.react scripts.postinstall`)
- ISC license (permissive)
- 4,100+ GitHub stars

*All other dependencies (pocketbase, framer-motion, react-icons, tailwindcss) are already installed and in use in the project.*

---

## Architecture Patterns

### System Architecture Diagram

```
Browser (/admin route)
│
├── AdminPage (orchestrator — all state lives here)
│   ├── [state] page, perPage, search, statusFilter
│   ├── [state] drawerOpen, drawerMode (create|edit), drawerRecord
│   ├── [state] confirmModal { open, record, action }
│   │
│   ├── AdminTopBar ──────────────────────────────── sticky, always visible
│   │   ├── "ANDESCODE" wordmark (Fira Code Bold)
│   │   ├── admin name/email (from usePocketBase().record)
│   │   └── Logout button → pb.authStore.clear() + navigate('/admin/login')
│   │
│   ├── AdminCertificateList ─────────────────────── main content area
│   │   ├── Search input + status filter dropdown
│   │   ├── <table> or card grid with certificate rows
│   │   │   └── Each row: ID | Name | Issue Date | Status badge | Actions
│   │   │       Actions: [FiEdit2 → openDrawer(edit)] [FiToggleLeft/Right → openConfirm] [FiDownload → downloadQR]
│   │   ├── Pagination controls (prev/next, page info)
│   │   └── "Nuevo certificado" button → openDrawer(create)
│   │
│   ├── AdminCertificateDrawer ───────────────────── slides from right (framer-motion)
│   │   ├── Backdrop overlay (click to close)
│   │   ├── 14-field form (2 cols desktop, 1 col mobile)
│   │   │   ├── Text/date/number inputs for simple fields
│   │   │   ├── TagsInput for technologies[] and competencies[]
│   │   │   └── certificateCode (pre-populated, editable)
│   │   ├── Validation: check required fields on submit
│   │   └── Save → pb.create() or pb.update() → close drawer, refresh list
│   │
│   └── ConfirmModal ─────────────────────────────── portal-style overlay
│       ├── Student name + certificate ID displayed
│       ├── Action-specific messaging (revoke=red CTA, reactivate=green CTA)
│       └── Confirm → pb.update(id, {status}) → close modal, refresh list
│
└── [Hidden] QR rendering div ───────────────────── off-screen container
    └── <QRCodeSVG ref={qrRef} value={verificationUrl} level="H" />
        └── On download click: XMLSerializer → blob → <a download>
```

### Recommended Project Structure

New files to create in Phase 3:

```
src/
├── pages/admin/
│   └── index.tsx          # REPLACE existing stub with full AdminPage orchestrator
├── sections/admin/        # NEW directory
│   ├── AdminTopBar.tsx    # Sticky top bar component
│   ├── AdminCertificateList.tsx  # Table + pagination + search/filter
│   ├── AdminCertificateDrawer.tsx  # Slide-in form drawer
│   ├── AdminCertificateForm.tsx    # Form fields (used inside drawer)
│   └── ConfirmModal.tsx   # Reusable confirm modal
└── components/
    └── TagsInput.tsx      # NEW: reusable tags input for technologies/competencies
```

No new routes in `main.tsx`. No new contexts. All state lives in `AdminPage`.

### Pattern 1: PocketBase Paginated List with Search + Filter

**What:** Fetch paginated certificate list with combined text search and status filter.
**When to use:** Every render of `AdminCertificateList` when search, filter, or page changes.

```typescript
// Source: https://pocketbase.io/docs/api-rules-and-filters/ + https://github.com/pocketbase/js-sdk/blob/master/README.md
import { pb } from '../services/pb';
import type { ListResult } from 'pocketbase';
import type { Certificate } from '../types/certificate';

async function fetchCertificates(
  page: number,
  perPage: number,
  search: string,
  statusFilter: 'all' | 'active' | 'revoked'
): Promise<ListResult<Certificate>> {
  const filterParts: string[] = [];

  // Text search across studentName and certificateCode
  if (search.trim()) {
    // pb.filter() escapes special characters — prevents injection
    filterParts.push(
      pb.filter('(studentName ~ {:q} || certificateCode ~ {:q})', { q: search.trim() })
    );
  }

  // Status filter
  if (statusFilter !== 'all') {
    filterParts.push(`status = "${statusFilter}"`);
  }

  return pb.collection('certificates').getList<Certificate>(page, perPage, {
    filter: filterParts.join(' && ') || undefined,
    sort: '-created',
  });
}
```

### Pattern 2: Auto-generate certificateCode

**What:** Count certificates issued in the current year, compute `NNN+1`, return `AC-YYYY-NNN`.
**When to use:** When admin opens the create drawer (before form renders).

```typescript
// Source: [ASSUMED] — based on PocketBase getList() + JS date APIs
async function generateNextCertificateCode(): Promise<string> {
  const year = new Date().getFullYear();
  const yearStart = `${year}-01-01 00:00:00`;
  const yearEnd   = `${year}-12-31 23:59:59`;

  const result = await pb.collection('certificates').getList(1, 1, {
    filter: `created >= "${yearStart}" && created <= "${yearEnd}"`,
    sort: '-certificateCode',
    fields: 'certificateCode',
  });

  // totalItems gives the count of certificates this year
  const count = result.totalItems;
  const next  = String(count + 1).padStart(3, '0');
  return `AC-${year}-${next}`;
}
```

**Pitfall:** `totalItems` counts all matching records, not just the current page. This is the correct field to use for sequence generation. However, `totalItems` is not guaranteed to be race-condition-safe (two concurrent creates could get the same count). For v1 single-admin use, this is acceptable. The PocketBase UNIQUE index on `certificateCode` (INFRA-05) is the collision guard — a duplicate code will return a 400 error, not silently overwrite.

### Pattern 3: Drawer with framer-motion

**What:** Slide-in drawer from right with backdrop. Animates on enter and exit.
**When to use:** Create/edit certificate form container.

```typescript
// Source: https://motion.dev/motion/animation/ + existing framer-motion usage in BackgroundGradientAnimation.tsx
import { motion, AnimatePresence } from 'framer-motion';

// Correct import for this project: 'framer-motion' (NOT 'motion/react')
// framer-motion v12.34.3 exports from 'framer-motion' — verified in node_modules/framer-motion/package.json

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function AdminCertificateDrawer({ open, onClose, children }: DrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/30 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          {/* Drawer panel */}
          <motion.div
            key="drawer"
            className="fixed right-0 top-0 h-full w-full max-w-[600px] bg-white shadow-2xl z-50 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### Pattern 4: Tags Input for technologies[] and competencies[]

**What:** Text input where Enter adds a tag to an array, × removes a tag.
**When to use:** `technologies` and `competencies` fields in the create/edit form.

```typescript
// Source: [ASSUMED] — standard React controlled input pattern
import { useState, type KeyboardEvent } from 'react';

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

function TagsInput({ value, onChange, placeholder }: TagsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = inputValue.trim();
      if (tag && !value.includes(tag)) {
        onChange([...value, tag]);
      }
      setInputValue('');
    }
    if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="border border-gray-300 rounded-lg px-3 py-2 flex flex-wrap gap-1.5 focus-within:outline focus-within:outline-2 focus-within:outline-[var(--color-primary)] min-h-[44px]">
      {value.map((tag, i) => (
        <span key={i} className="bg-[#4342FF]/10 text-[#4342FF] text-sm fira-code-regular px-2 py-0.5 rounded-full flex items-center gap-1">
          {tag}
          <button type="button" onClick={() => removeTag(i)} className="text-[#4342FF] hover:text-[#4342FF]/70 leading-none" aria-label={`Eliminar ${tag}`}>×</button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
      />
    </div>
  );
}
```

### Pattern 5: QR SVG Download

**What:** Render `QRCodeSVG` off-screen, serialize to blob, trigger download.
**When to use:** "Descargar QR" action button per table row.

```typescript
// Source: qrcode.react README (https://github.com/zpao/qrcode.react) + Web APIs XMLSerializer
// IMPORTANT: qrcode.react must be installed first: npm install qrcode.react
import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

// Option A: Hidden QR container rendered in the table, one per row
// (preferred for single-row download, no state management needed)
function CertificateRowQRDownload({ certificateCode }: { certificateCode: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const verificationUrl = `${window.location.origin}/certificados/${certificateCode}`;

  const handleDownload = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgRef.current);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR-${certificateCode}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Hidden off-screen QR — rendered but invisible */}
      <span style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} aria-hidden>
        <QRCodeSVG
          ref={svgRef}
          value={verificationUrl}
          size={256}
          level="H"
          marginSize={4}
        />
      </span>
      <button type="button" onClick={handleDownload} className="min-h-[44px] p-2" title="Descargar QR" aria-label={`Descargar QR de ${certificateCode}`}>
        <FiDownload size={16} />
      </button>
    </>
  );
}
```

**Note on `QRCodeSVG` ref:** The component is typed as `React.ForwardRefExoticComponent<...RefAttributes<SVGSVGElement>>` — the ref resolves to the `<svg>` element directly, no `querySelector` needed. [ASSUMED — TypeScript type verified via npm search results, not official docs]

### Pattern 6: Revoke/Reactivate with Confirmation

**What:** Update certificate status after modal confirmation.
**When to use:** Action buttons in each table row.

```typescript
// Source: https://github.com/pocketbase/js-sdk/blob/master/README.md
async function updateCertificateStatus(
  id: string,
  newStatus: 'active' | 'revoked'
): Promise<void> {
  await pb.collection('certificates').update(id, { status: newStatus });
}
```

### Anti-Patterns to Avoid

- **Putting state in context:** All admin state (list data, drawer, modal) lives in `AdminPage`. Creating a dedicated AdminContext adds indirection with no benefit for a single-route panel.
- **Fetching on every keystroke:** Debounce the search input (300ms) before triggering `getList()`. Calling PocketBase on every character change causes excessive API calls.
- **Rendering a QRCodeSVG per row unconditionally:** 50 rows = 50 QR components always in DOM. Instead, render QR lazily — only mount the hidden QR component when the user clicks download (then immediately download and unmount).
- **Building manual filter strings with user input concatenation:** Use `pb.filter(expr, params)` for user-supplied values (D-05 search). Direct string concat (`filter: \`studentName ~ "${search}"\``) is an injection risk.
- **Using `motion/react` import:** The installed package is `framer-motion`, not `motion`. The correct import is `from 'framer-motion'` — the existing codebase (`BackgroundGradientAnimation.tsx`) already uses this.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| QR code generation | Custom QR algorithm | `qrcode.react` `QRCodeSVG` | QR encoding has 7 modes and 40 version levels; error correction matrix calculation is non-trivial |
| Drawer animation | CSS-only transform + visibility toggle | `framer-motion` `AnimatePresence` | CSS-only cannot animate exit (the element is removed before the animation plays). `AnimatePresence` keeps the element mounted until the exit animation completes |
| SVG serialization for download | Custom SVG string builder | `XMLSerializer` (browser built-in) | Browser native, handles namespaces, attributes, and nested elements correctly |
| Search parameter escaping | Manual string escaping | `pb.filter(expr, params)` | The SDK helper handles special characters in filter values — prevents accidental filter injection |
| Pagination arithmetic | Custom offset/limit math | PocketBase `getList(page, perPage)` | PocketBase returns `totalItems` and `totalPages` ready to use; no offset calculation needed |

**Key insight:** The admin panel's complexity lies in state orchestration (list ↔ drawer ↔ modal), not in any individual primitive. Each primitive (QR, animation, API) has a well-supported library covering edge cases.

---

## Common Pitfalls

### Pitfall 1: `qrcode.react` Not in package.json

**What goes wrong:** The existing `package.json` does NOT include `qrcode.react`. The CONTEXT.md says it is "already installed" but that is incorrect — confirmed by reading `package.json` and checking `node_modules`. Implementing Pattern 5 without first running `npm install qrcode.react` will fail at build time.

**Why it happens:** The package was mentioned as "installed in Phase 4 prep" in CONTEXT.md, but Phase 4 prep has not happened yet.

**How to avoid:** Wave 0 of the plan must include `npm install qrcode.react` as the first task.

**Warning signs:** `Cannot find module 'qrcode.react'` TypeScript error at build or dev time.

### Pitfall 2: `motion/react` Import Path

**What goes wrong:** Motion documentation recommends `import { motion } from 'motion/react'` as the new canonical path. But this project installs `framer-motion` (not the `motion` package). Using `motion/react` will throw a module-not-found error.

**Why it happens:** The `motion` package and the `framer-motion` package are separate npm packages. The `framer-motion` package exports from `'framer-motion'` only.

**How to avoid:** Always use `import { motion, AnimatePresence } from 'framer-motion'` — consistent with `BackgroundGradientAnimation.tsx`.

**Warning signs:** `Cannot find module 'motion/react'` at build time.

### Pitfall 3: certificateCode Race Condition

**What goes wrong:** Two admins (or two rapid form opens) query the same year count simultaneously, both get `count = N`, both generate `AC-YYYY-00N`, and one create fails with a 400 "unique constraint" error from PocketBase.

**Why it happens:** The frontend counts existing certificates for the year to determine `NNN`. This is not atomic.

**How to avoid:** This is acceptable for v1 (single-admin system). The UNIQUE index (INFRA-05) prevents silent data corruption. Handle the 400 error from `pb.create()` by checking if the error message mentions `certificateCode` uniqueness, and show an error asking the admin to modify the code.

**Warning signs:** PocketBase returns a 400 with `data.certificateCode.code = "validation_not_unique"` in the error body.

### Pitfall 4: Drawer Scroll Lock

**What goes wrong:** When the drawer is open and the admin scrolls, both the background list and the drawer scroll simultaneously, creating a disorienting experience.

**Why it happens:** The body scroll is not locked when the drawer opens.

**How to avoid:** Add `document.body.style.overflow = 'hidden'` when drawer opens, restore on close. Use a `useEffect` cleanup:
```typescript
useEffect(() => {
  if (drawerOpen) {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }
}, [drawerOpen]);
```

### Pitfall 5: Stale List After Create/Edit/Revoke

**What goes wrong:** After a successful create, edit, or status update, the list still shows the old data.

**Why it happens:** The list state is not refreshed after mutations.

**How to avoid:** After every successful `pb.create()`, `pb.update()`, or `pb.update(status)`, call the same `fetchCertificates()` function with the current page/filter/search state to re-fetch. Keep a `refreshKey` counter in `AdminPage` state and increment it after each mutation — `useEffect([refreshKey, page, search, statusFilter])` will retrigger the fetch.

### Pitfall 6: QR Download Renders Stale Data

**What goes wrong:** The off-screen `QRCodeSVG` is rendered with the wrong URL (e.g., `localhost` in production, or missing `https://`).

**Why it happens:** `window.location.origin` returns `http://localhost:5173` in dev. If the SVG is generated in dev and the admin somehow downloads it there, the QR will point to localhost.

**How to avoid:** This is only a concern in production use. For the admin panel (which requires authentication and runs on the actual domain), `window.location.origin` is correct. Document this in a comment in the code.

---

## Code Examples

### Complete Fetch + Pagination Example

```typescript
// Source: https://github.com/pocketbase/js-sdk/blob/master/README.md
// ListResult<T> shape: { page, perPage, totalItems, totalPages, items: T[] }
import type { ListResult } from 'pocketbase';
import type { Certificate } from '../types/certificate';
import { pb } from '../services/pb';

const ITEMS_PER_PAGE = 20; // Claude's discretion — standard for PocketBase

const result: ListResult<Certificate> = await pb.collection('certificates').getList<Certificate>(
  1,           // page
  ITEMS_PER_PAGE,
  {
    filter: pb.filter('studentName ~ {:q} || certificateCode ~ {:q}', { q: 'búsqueda' }),
    sort: '-created',  // DESC by creation date — most recent first
  }
);

// Pagination state from response:
// result.page          → current page
// result.perPage       → items per page
// result.totalItems    → total records matching filter
// result.totalPages    → Math.ceil(totalItems / perPage)
// result.items         → Certificate[] for this page
```

### Update (Edit + Revoke/Reactivate)

```typescript
// Source: https://github.com/pocketbase/js-sdk/blob/master/README.md
// For editing all fields:
const updated = await pb.collection('certificates').update<Certificate>(
  record.id,
  {
    studentName: formData.studentName,
    // ... all 14 fields
  }
);

// For status-only update (revoke or reactivate):
await pb.collection('certificates').update(record.id, {
  status: 'revoked',   // or 'active'
});
```

### PocketBase Error Handling Pattern (matching login.tsx)

```typescript
// Source: src/pages/admin/login.tsx — established pattern in codebase
const [saving, setSaving] = useState(false);
const [saveError, setSaveError] = useState<string | null>(null);

const handleSave = async () => {
  setSaving(true);
  setSaveError(null);
  try {
    await pb.collection('certificates').create(formData);
    onSuccess(); // close drawer, refresh list
  } catch (err) {
    // Check for unique constraint on certificateCode
    const pbErr = err as { data?: { certificateCode?: { code?: string } } };
    if (pbErr?.data?.certificateCode?.code === 'validation_not_unique') {
      setSaveError('El código de certificado ya existe. Modificá el código e intentá de nuevo.');
    } else {
      setSaveError('Error al guardar. Intentá de nuevo.');
    }
  } finally {
    setSaving(false);
  }
};
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` npm package | `motion` npm package (import from `motion/react`) | 2024/2025 | Does NOT affect this project — installed package is `framer-motion`, import stays `from 'framer-motion'` |
| Manual QR generation (canvas-based) | `qrcode.react` with `QRCodeSVG` component | 2014–present | SVG output is vector, scalable, accessible — preferred over Canvas for download use case |
| PocketBase string filter concatenation | `pb.filter(expr, params)` helper | SDK v0.19.0+ | Safe parameter binding; current installed version is 0.27.0 so this helper is available |

**Deprecated/outdated:**
- Passing raw user input into filter strings: `filter: \`name ~ "${userInput}"\`` — use `pb.filter()` instead.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `QRCodeSVG` forwards its ref directly to the `<svg>` element as `RefAttributes<SVGSVGElement>` | Pattern 5, Code Examples | If ref is not forwarded, must use `containerRef.current.querySelector('svg')` instead — minor adjustment |
| A2 | `generateNextCertificateCode()` using `totalItems` is accurate for NNN sequence | Pattern 2 | If totalItems includes deleted records or has off-by-one behavior, codes could skip numbers or collide — the UNIQUE index is the safety net |
| A3 | Tags input pattern (Enter to add, × to remove) requires no external library | Pattern 4 | If accessibility requirements expand, a dedicated combobox library might be needed — acceptable for v1 |

**If this table is empty:** Not applicable — 3 assumptions found.

---

## Open Questions

1. **QR Download: Off-screen render strategy**
   - What we know: Rendering a hidden `QRCodeSVG` per table row adds N components to the DOM for N certificates.
   - What's unclear: Whether this is a performance concern at 20 items per page.
   - Recommendation: Use the "lazy mount on click" pattern (render QR only when download is triggered, then unmount). This is slightly more complex but avoids mounting 20 invisible SVG elements. The planner should choose based on complexity preference.

2. **Form layout: 14 fields in 2 columns**
   - What we know: D-03 specifies 2-column desktop layout inside the drawer.
   - What's unclear: Which specific fields are in which column, and how to handle `description` (textarea) and `status` (likely not editable in the form — status is changed via the revoke/reactivate button, not the form).
   - Recommendation: The planner should define the column assignment. Suggested split: left column = personal info (studentName, dni, university, degree, supervisorName, score), right column = dates + code (certificateCode, startDate, endDate, issueDate), full-width = description, technologies[], competencies[].

3. **`status` field in edit form**
   - What we know: Admin edits all 14 fields via the drawer. `status` is a `"active" | "revoked"` union.
   - What's unclear: Whether `status` should be editable in the form (a `<select>`) or only via the revoke/reactivate button (D-07 already covers status changes from the list row).
   - Recommendation: Exclude `status` from the edit form. The revoke/reactivate buttons in the list are the canonical way to change status (D-07). Editing status via the form would bypass the confirmation modal (D-08).

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js / npm | Installing `qrcode.react` | ✓ | system default | — |
| PocketBase API | All CRUD operations | ✓ | SDK 0.27.0 | — |
| qrcode.react | ADMIN-09 (QR download) | ✗ (not in package.json) | 4.2.0 on npm | None — must install |
| framer-motion | Drawer animation | ✓ | 12.34.3 | CSS `slide-up` (exit animation loss) |
| react-icons (fi) | Action icons | ✓ | 5.5.0 | Unicode symbols (worse UX) |
| XMLSerializer | SVG download | ✓ | Browser built-in | None needed |
| URL.createObjectURL | SVG blob download | ✓ | Browser built-in | None needed |

**Missing dependencies with no fallback:**
- `qrcode.react` — must be installed before any QR-related code is written. Wave 0 task required.

**Missing dependencies with fallback:**
- None (framer-motion fallback to CSS is acceptable but results in loss of exit animation).

---

## Security Domain

Security enforcement is enabled (`security_enforcement: true`, `security_asvs_level: 1`).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes (admin panel) | PocketBase `_superusers` auth — already implemented in Phase 2 (`AdminGuard`, `authRefresh`) |
| V3 Session Management | yes | PocketBase `LocalAuthStore` (localStorage) — already implemented; `pb.authStore.clear()` on logout |
| V4 Access Control | yes | PocketBase collection rules: `listRule = @request.auth.id != ""`, `updateRule` restricted — server-side enforcement |
| V5 Input Validation | yes | Client-side required-field validation (D-06); PocketBase enforces schema constraints server-side |
| V6 Cryptography | no | No cryptographic operations in Phase 3 |

### Known Threat Patterns for this Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Filter injection via search input | Tampering | `pb.filter(expr, params)` — SDK escapes special characters; never concatenate user input into filter strings |
| Unauthorized CRUD access | Elevation of Privilege | PocketBase collection rules are the real enforcement layer (INFRA-06); `AdminGuard` is defense-in-depth for UX only |
| XSS via certificate field data rendered in admin table | Tampering/Information Disclosure | React's default JSX escaping prevents XSS when using `{value}` syntax; never use `dangerouslySetInnerHTML` for certificate data |
| certificateCode unique collision | Tampering | PocketBase UNIQUE index on `certificateCode` (INFRA-05) — server rejects duplicate; handle 400 error gracefully |
| Token expiry during long form fill | Authentication bypass | `AdminGuard` calls `authRefresh()` on mount; if token expires mid-session and the user saves, PocketBase returns 401 — handle with redirect to login |

**Admin panel security note (ASVS Level 1):** The admin panel is a single-user internal tool behind PocketBase auth. The security surface is: (1) authentication (already implemented), (2) all mutations going through authenticated API calls (already enforced by PocketBase rules), and (3) input filtering (use `pb.filter()`). No additional ASVS Level 1 controls are needed beyond what Phase 2 already established.

---

## Sources

### Primary (HIGH confidence)
- [PocketBase JS SDK README](https://github.com/pocketbase/js-sdk/blob/master/README.md) — `getList()`, `update()`, `create()`, `pb.filter()` patterns, `ListResult` structure
- [PocketBase API Rules and Filters](https://pocketbase.io/docs/api-rules-and-filters/) — Filter operator reference (`~`, `=`, `||`, `&&`, `strftime`)
- `src/pages/admin/login.tsx` — Canonical admin UI patterns for this project (inputs, error states, loading, `btn-primary`)
- `src/types/certificate.ts` — Certificate interface with all 14 fields + system fields
- `src/style.css` — Confirmed CSS classes: `grid-bg`, `fade-in`, `slide-up`, `btn-primary`, `btn-secondary`, Fira Code utility classes
- `src/contexts/PocketBaseContext.tsx` — Confirmed `usePocketBase()` hook API: `{ pb, isValid, record }`
- `package.json` — Confirmed installed packages and versions; confirmed `qrcode.react` is NOT installed
- `node_modules/framer-motion/package.json` — Confirmed package name is `framer-motion`, exports are from `framer-motion` (not `motion/react`)

### Secondary (MEDIUM confidence)
- [qrcode.react README (trunk)](https://github.com/zpao/qrcode.react/blob/trunk/README.md) — `QRCodeSVG` props, `level="H"`, custom styling
- [Motion docs (motion.dev)](https://motion.dev/motion/animation/) — AnimatePresence + slide-from-right animation patterns (cross-referenced with existing framer-motion usage in codebase)
- [npmtrends: qrcode.react](https://npmtrends.com/qrcode.react) — Download count verification (~1.8M/wk)

### Tertiary (LOW confidence)
- WebSearch results on PocketBase multi-field search (|| OR patterns) — consistent with official filter docs above, elevated to MEDIUM

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified in node_modules or npm registry; qrcode.react confirmed legitimate
- Architecture: HIGH — derived entirely from existing codebase patterns (login.tsx, AdminGuard.tsx, certificate.ts)
- PocketBase patterns: HIGH — verified against official SDK README and filter docs
- QR SVG download: MEDIUM — `QRCodeSVG` ref type confirmed via npm search results; XMLSerializer is browser built-in standard
- Drawer/animation patterns: HIGH — framer-motion AnimatePresence is the standard approach; import path confirmed via node_modules inspection
- Tags input: MEDIUM — standard React controlled input pattern, no external docs needed

**Research date:** 2026-06-08
**Valid until:** 2026-07-08 (stable dependencies; PocketBase SDK minor releases won't break patterns)
