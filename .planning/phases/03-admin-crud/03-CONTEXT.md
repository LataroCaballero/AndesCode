# Phase 3: Admin CRUD - Context

**Gathered:** 2026-06-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Entregar el panel de administración completo para el ciclo de vida de los certificados. El admin puede ver una lista paginada y buscable de todos los certificados, crear nuevos con ID auto-generado, editar todos los campos de un certificado existente (vía drawer lateral), revocar/reactivar certificados (con confirmación modal), y descargar el QR de cualquier certificado como SVG directamente desde la lista. El panel reemplaza el stub actual en `src/pages/admin/index.tsx` y agrega el chrome de top bar sticky. No hay sub-rutas nuevas — todo ocurre en `/admin` con estado local (lista + drawer).

</domain>

<decisions>
## Implementation Decisions

### Panel Chrome
- **D-01:** Top bar mínima sticky — fija al hacer scroll. Contiene logo "ANDESCODE" (Fira Code Bold), nombre/email del admin logueado, y botón de logout. Sin sidebar — solo existe una sección en v1.
- **D-02:** Fondo del panel: `grid-bg` (mismo que login) — mantiene coherencia visual con el resto del admin. Sin cambio de fondo al pasar de la página de bienvenida al panel.

### UX de Crear/Editar
- **D-03:** El formulario de crear/editar (14 campos del modelo `Certificate`) aparece en un **drawer lateral** que desliza desde la derecha. La lista de certificados permanece visible a la izquierda. No se crean sub-rutas — todo en `/admin` con estado local.
- **D-04:** El campo `technologies` (array de strings) se edita con un **input de tags**: el admin escribe una tecnología, presiona Enter para agregarla como tag, y puede eliminarlas con ×. Mismo patrón aplica al campo `competencies` si es editable.
- **D-05:** El `certificateCode` se auto-genera al abrir el formulario de crear: el frontend hace un `getList` filtrado por año actual para contar los existentes y calcular `NNN+1`. El campo aparece pre-poblado en formato `AC-YYYY-NNN` y el admin puede editarlo antes de guardar.
- **D-06:** El formulario valida todos los campos requeridos client-side antes de enviar (ADMIN-06). Los campos requeridos se determinan por el schema en REQUIREMENTS.md.

### Revocar / Reactivar
- **D-07:** Los botones de revocar/reactivar están en la **fila de la lista** — el admin no necesita abrir el drawer para cambiar el estado. El botón refleja el estado actual: "Revocar" si está activo, "Reactivar" si está revocado.
- **D-08:** Tanto revocar como reactivar muestran un **modal de confirmación** antes de ejecutar. El modal incluye el nombre del estudiante y el ID del certificado para que el admin confirme que es el correcto. Botón primario rojo para revocar; botón verde para reactivar; botón "Cancelar" siempre visible.

### QR Download
- **D-09:** El QR se descarga como SVG desde un **botón por fila** en la lista (columna de acciones). La lista tiene 3 acciones por fila con **iconos siempre visibles**: editar (lápiz), revocar/reactivar (toggle), y descargar QR (ícono de QR). No requiere abrir el drawer.
- **D-10:** La generación del SVG es client-side (la librería `qrcode.react` ya está instalada — se usará en Phase 4 también para la página pública). Para el download, se serializa el SVG del componente y se dispara un `<a download>`.

### Claude's Discretion
- Número de registros por página en la lista (ej: 20 es estándar con PocketBase)
- Ordenamiento por defecto de la lista (por fecha de creación DESC es lo más útil)
- Diseño exacto de la top bar (altura, padding, separadores)
- Transición/animación del drawer (slide-in desde derecha, duración ~200ms)
- Diseño exacto del modal de confirmación (texto, layout de botones)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements and Roadmap
- `.planning/REQUIREMENTS.md` — Requirements ADMIN-01 a ADMIN-10 con las columnas de la lista, campos del formulario, y criterios de aceptación de cada acción
- `.planning/ROADMAP.md` — Phase 3 success criteria (5 criterios verificables)

### Existing Admin Code (read before writing anything)
- `src/pages/admin/index.tsx` — Placeholder a reemplazar; contiene el patrón actual (grid-bg, card blanca, usePocketBase)
- `src/pages/admin/login.tsx` — Referencia visual del admin: grid-bg, Fira Code Bold "ANDESCODE", inputs con focus ring `--color-primary`, btn-primary/btn-secondary
- `src/components/AdminGuard.tsx` — Auth guard que envuelve todas las rutas admin; ya implementado
- `src/contexts/PocketBaseContext.tsx` — usePocketBase() hook para acceder a pb y auth state reactivo
- `src/services/pb.ts` — Singleton de PocketBase; todos los API calls pasan por aquí

### Data Model
- `src/types/certificate.ts` — Certificate interface con los 14 campos + system fields; también exporta `normalizeCertificateCode` y el union type `status: "active" | "revoked"`

### Design Reference
- `.planning/phases/02-auth-public-verification/02-UI-SPEC.md` — Design contract del admin establecido en Phase 2: standalone (sin Header/Footer público), spacing scale, tipografía, colores

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/services/pb.ts` — Singleton PocketBase; usar `pb.collection('certificates')` para todas las operaciones CRUD
- `src/contexts/PocketBaseContext.tsx` / `usePocketBase()` — Para acceder al record del admin logueado (nombre/email en la top bar)
- `src/components/AdminGuard.tsx` — Ya envuelve `/admin` en `main.tsx`; no necesita cambios
- `src/types/certificate.ts` — `Certificate` interface lista para usar en el formulario y la tabla; `status` union type para el botón de revocar/reactivar
- `src/pages/admin/login.tsx` — Patron de inputs, botones, y error states del admin (replicar clases CSS)
- `react-icons` (fi family) — Ya instalada; usar `FiEdit2`, `FiToggleLeft/Right`, `FiDownload` para los iconos de acción de la tabla

### Established Patterns
- Admin standalone: sin `<Header />` ni `<Footer />` — el panel admin tiene su propio chrome
- Fondo `grid-bg`: clase CSS definida en `src/style.css`; mantener en todos los admin pages
- Animaciones: `fade-in` y `slide-up` definidas en `src/style.css` — usarlas para el drawer
- `btn-primary` / `btn-secondary`: clases CSS globales en `src/style.css`; mantener consistencia
- `min-h-[44px]` en todos los elementos interactivos (toque mínimo)
- Focus ring: `focus:outline focus:outline-2 focus:outline-[var(--color-primary)]`
- Error state: `bg-red-50 border border-red-200 text-red-700` con `FiAlertCircle` (patrón del login)

### Integration Points
- `src/main.tsx` — La ruta `/admin` ya existe; Phase 3 puede agregar sub-estado interno (drawer open/closed) sin necesidad de nuevas rutas
- `src/components/TitleManager.tsx` — Puede necesitar un entry para el panel admin si el title debe cambiar
- `qrcode.react` — Ya en package.json (instalado en Phase 4 prep); disponible para serializar SVG en el download de QR

</code_context>

<specifics>
## Specific Ideas

- La estética del admin es "Linear/Stripe": minimalista, mucho espacio en blanco, tipografía Inter, acentos en `#4342FF`. Ver `login.tsx` como referencia de tono.
- El drawer debe renderizar el formulario de los mismos 14 campos en dos columnas en desktop (para aprovechar el espacio del drawer ancho), o una columna en mobile.
- El botón "Descargar QR" en la fila serializa el SVG del componente QR a un blob y lo descarga como `QR-{certificateCode}.svg`.

</specifics>

<deferred>
## Deferred Ideas

- Sidebar con múltiples secciones — diferido a v2 cuando existan más secciones admin (estadísticas, configuración). La top bar mínima es suficiente para v1.
- Acciones en hover (hover-reveal) — no implementar; el panel admin es desktop-first pero la accesibilidad requiere iconos siempre visibles.
- QR download también desde el drawer — diferido; el botón por fila es suficiente para v1.

</deferred>

---

*Phase: 3-Admin CRUD*
*Context gathered: 2026-06-08*
