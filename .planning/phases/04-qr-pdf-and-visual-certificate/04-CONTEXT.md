# Phase 4: QR, PDF, and Visual Certificate - Context

**Gathered:** 2026-06-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Completar la experiencia pública de verificación con tres adiciones a la página `/certificados/:certificateCode`:

1. **QR embebido** dentro del certificado visual (QRPDF-01, QRPDF-02) — generado con `qrcode.react`, error correction level H, encoda la URL completa de verificación.
2. **PDF descargable** (QRPDF-03, QRPDF-04, QRPDF-05) — generado client-side con jsPDF, reproduce el diseño del certificado de referencia con logos, todos los campos, QR embebido, y fuentes Inter self-hosted para evitar CORS.
3. **Certificado visual HTML/CSS** (VIS-01) — reemplaza el grid de metadatos actual por una reproducción fiel al diseño físico (`ref/assets/certificado.png`): dos logos arriba, nombre centrado, campos del certificado, firma del supervisor, QR abajo a la derecha.

El layout de la página queda: `[Status badge + botones de acción (Descargar PDF, Copiar enlace)] → [Certificado visual HTML/CSS]`. Open Graph metadata queda diferido a v2.

</domain>

<decisions>
## Implementation Decisions

### Certificado Visual HTML/CSS (VIS-01)
- **D-01:** El certificado visual **reemplaza** el grid de metadatos actual (`CertificadoVerificacion.tsx`). Un solo layout cohesivo en lugar de datos + reproducción separada.
- **D-02:** Fidelidad al original — misma estructura del `ref/assets/certificado.png`: logo AndesCode + logo FCEFN/UNSJ arriba, "CERTIFICADO DE PRÁCTICA" / nombre del estudiante centrado y grande, campos en dos columnas, firma del supervisor, QR en la esquina inferior derecha.
- **D-03:** Revocación: el certificado se renderiza igual con la reproducción completa, más una **marca de agua diagonal "REVOCADO"** en rojo semitransparente encima. El status badge (❌) permanece en la sección de acciones arriba, visible sin scroll.
- **D-04:** Layout de la página: **sección de acciones arriba** (status badge + `Descargar certificado PDF` + `Copiar enlace`) → **certificado visual abajo**. Acciones siempre visibles sin hacer scroll.

### Librería de PDF (QRPDF-03, QRPDF-04, QRPDF-05)
- **D-05:** Librería: **jsPDF** (programática). Implementación separada del HTML/CSS para VIS-01 (dos implementaciones independientes: HTML/CSS para la vista, jsPDF para el PDF).
- **D-06:** Fuentes: **Inter self-hosted** — descargar `Inter-Regular.ttf` e `Inter-Bold.ttf`, guardarlos en `src/assets/fonts/`, importarlos con Vite `?url` y cargarlos en jsPDF vía `addFileToVFS` + `addFont`. Evita CORS en producción (QRPDF-05).
- **D-07:** QR para el PDF: instalar el package **`qrcode`** (browser/node, separado de `qrcode.react`), que genera el QR como dataURL sin necesidad de DOM. Se llama directamente desde el generador de PDF con `QRCode.toDataURL(url, { errorCorrectionLevel: 'H' })`.

### QR en la Página Pública (QRPDF-01, QRPDF-02)
- **D-08:** El QR visible en la página se renderiza con **`qrcode.react`** (ya instalado). Aparece embebido dentro del certificado visual HTML/CSS, en la posición correspondiente al diseño de referencia. Error correction level H (30% redundancia).

### Open Graph Metadata
- **D-09** `[informational]`: **Diferido a v2.** Client-side OG tags en una SPA no son leídos por la mayoría de crawlers (Twitter, LinkedIn). Ya está previsto en v2 SHARE-02 que requiere SSR/prerender. No implementar en v1.

### Claude's Discretion
- Orientación del PDF (landscape probablemente — ver `ref/assets/certificado.png`)
- Colores exactos del certificado visual (basarse en el diseño de referencia; paleta `#191919` / `#FFFFFF` / `#4342FF`)
- Tipografía exacta dentro del certificado (Inter para campos, Fira Code para el ID del certificado)
- Nombre del archivo PDF descargado (ej: `certificado-AC-2025-014.pdf`)
- Dimensiones del QR en el certificado visual y en el PDF

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Diseño de Referencia
- `ref/assets/certificado.png` — Diseño del certificado físico de referencia. La reproducción HTML/CSS (VIS-01) y el PDF (QRPDF-04) deben ser fieles a este diseño: posición de logos, layout de campos, ubicación del QR.
- `ref/assets/logo fcefn.png` — Logo de la FCEFN/UNSJ para embeber en el certificado visual y en el PDF.
- `ref/assets/logo.png` — Logo de AndesCode para embeber en el certificado visual y en el PDF.

### Requirements y Roadmap
- `.planning/REQUIREMENTS.md` — Requirements QRPDF-01 a QRPDF-05 y VIS-01 con los criterios de aceptación detallados de cada ítem
- `.planning/ROADMAP.md` — Phase 4 success criteria (4 criterios verificables, incluyendo el QR level H y ausencia de CORS en producción)

### Código Existente (leer antes de modificar)
- `src/sections/CertificadoVerificacion.tsx` — Sección a refactorizar; actualmente muestra grid de metadatos. El certificado visual la reemplaza. Contiene el fetch de datos, manejo de estados (loading/found/notFound) y el patrón de copia de URL.
- `src/pages/certificado.tsx` — Página que envuelve CertificadoVerificacion con Header/Footer
- `src/types/certificate.ts` — Interface `Certificate` con los 14 campos; exporta también `normalizeCertificateCode`
- `src/services/pb.ts` — Singleton PocketBase para los API calls

### Design System
- `.planning/phases/02-auth-public-verification/02-UI-SPEC.md` — Design contract de la página pública establecido en Phase 2: escala de spacing, tipografía, colores, mobile-first

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `qrcode.react` — Ya instalado; usar `<QRCodeSVG>` o `<QRCodeCanvas>` para el QR en la página. Para el PDF, instalar `qrcode` (el package hermano sin React) que genera dataURL headless.
- `src/services/pb.ts` — `pb.collection("certificates").getFirstListItem<Certificate>(filter)` — patrón establecido para fetch del certificado.
- `src/types/certificate.ts` — `Certificate` interface lista con todos los campos que necesita el certificado visual y el PDF.
- `FiDownload`, `FiCopy`, `FiCheckCircle`, `FiXCircle` de `react-icons/fi` — ya usados en la verificación; reutilizar para los botones de acción.
- `btn-primary` / `btn-secondary` — clases CSS globales en `src/style.css`; usar para los botones de acción.

### Established Patterns
- **Grid background:** `grid-bg` — mantener como fondo de la sección de verificación (ya aplicado)
- **Animaciones:** `fade-in`, `slide-up` — disponibles en `src/style.css`; usar para el certificado visual al cargar
- **Minimum touch targets:** `min-h-[44px]` en todos los elementos interactivos
- **Focus ring:** `focus:outline focus:outline-2 focus:outline-[var(--color-primary)]`
- **Loading skeleton:** patrón de `animate-pulse` ya implementado en `CertificadoVerificacion.tsx`; mantener durante la carga del certificado visual

### Integration Points
- `CertificadoVerificacion.tsx` — Único archivo a modificar. El estado `cert` ya existe y tiene todos los campos necesarios. El refactor agrega el certificado visual y los botones de descarga, preservando el fetch y los estados de error.
- `src/main.tsx` — No requiere cambios; las rutas `/certificados` y `/certificados/:certificateCode` ya existen.
- `TitleManager.tsx` — No requiere cambios; el título dinámico ya está implementado con `document.title` imperativo en `CertificadoVerificacion.tsx`.

</code_context>

<specifics>
## Specific Ideas

- El layout de la página queda: `[Status badge ✅/❌]` + `[botón Descargar PDF]` + `[botón Copiar enlace]` encima del certificado visual → `[Certificado visual fiel al original]`
- Para certificados revocados: la reproducción se muestra completa con texto diagonal "REVOCADO" semitransparente en rojo encima (CSS `position: absolute`, rotación ~-30°, opacity ~0.25).
- El PDF se genera al click de "Descargar certificado" — no pre-renderizado. El botón puede mostrar un spinner mientras se genera.
- Nombre de archivo del PDF: `certificado-{certificateCode}.pdf` (ej: `certificado-AC-2025-014.pdf`).
- Los archivos TTF de Inter deben descargarse de Google Fonts (Inter v4 — Regular 400 y Bold 700) y guardarse en `src/assets/fonts/`. El import con `?url` en Vite los expone como URLs para fetch y carga en jsPDF.

</specifics>

<deferred>
## Deferred Ideas

- **Open Graph metadata dinámica** — diferido a v2 junto con SHARE-02. Requiere SSR o prerender con nginx para que los crawlers de Twitter/LinkedIn lean los tags. Client-side en SPA es inefectivo para los crawlers principales.

</deferred>

---

*Phase: 4-QR-PDF-and-Visual-Certificate*
*Context gathered: 2026-06-08*
