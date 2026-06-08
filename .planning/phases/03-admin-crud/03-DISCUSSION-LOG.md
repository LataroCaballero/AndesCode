# Phase 3: Admin CRUD - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-08
**Phase:** 3-Admin CRUD
**Areas discussed:** Chrome del panel, UX de crear/editar, Revocar/reactivar, QR download location

---

## Chrome del panel

| Option | Description | Selected |
|--------|-------------|----------|
| Top bar mínima | Barra superior con logo, admin name, y logout. Sin sidebar — solo hay una sección en v1. | ✓ |
| Sidebar colapsable | Panel lateral con nav links; más código pero extensible a v2. | |
| Sin chrome extra | Mantener la card blanca centrada actual, solo agregar CRUD adentro. | |

**User's choice:** Top bar mínima

| Option | Description | Selected |
|--------|-------------|----------|
| Sticky | Fija al hacer scroll; el logout siempre visible. Estándar en dashboards. | ✓ |
| Estática | Se va al scrollear; el admin sube para hacer logout. | |

**User's choice:** Sticky

| Option | Description | Selected |
|--------|-------------|----------|
| Gris claro (#F5F5F7, bg-gray-50) | Estándar en dashboards; el contenido se distingue del fondo. | |
| Grid-bg (consistente con login) | Misma base que el login; mantiene la estética unificada. | ✓ |

**User's choice:** Grid-bg (consistente con login)

---

## UX de crear/editar

| Option | Description | Selected |
|--------|-------------|----------|
| Drawer lateral | Panel que desliza desde la derecha; la lista queda visible. Estándar en dashboards modernos. | ✓ |
| Página propia | Ruta separada /admin/certificados/nuevo y /admin/certificados/:id/editar. | |
| Modal centrado | Overlay centrado; puede quedar apretado con 14 campos. | |

**User's choice:** Drawer lateral

| Option | Description | Selected |
|--------|-------------|----------|
| Input de texto con tags | Escribe → Enter → tag. Puede eliminar con ×. | ✓ |
| Textarea separada por comas | 'React, TypeScript, Node.js' — más simple, menos UX. | |
| Lista con agregar/eliminar filas | Cada tecnología en su input; más verboso. | |

**User's choice:** Input de texto con tags

| Option | Description | Selected |
|--------|-------------|----------|
| Query al conteo actual | getList filtrado por año para calcular NNN+1; campo editable antes de guardar. | ✓ |
| El admin ingresa el número | Campo empieza en 'AC-2026-' y el admin completa. | |
| El admin elige el código completo | Campo libre con placeholder; solo valida formato. | |

**User's choice:** Query al conteo actual

---

## Revocar/reactivar

| Option | Description | Selected |
|--------|-------------|----------|
| En la lista, por fila | Botón o ícono de acción rápida por fila. Más eficiente. | ✓ |
| Solo desde el drawer de edición | La acción destructiva está un paso más lejos. | |
| En ambos lados | Fila + drawer; más código. | |

**User's choice:** En la lista, por fila

| Option | Description | Selected |
|--------|-------------|----------|
| Modal de confirmación | Dialog con nombre del estudiante e ID del certificado. Botón rojo/verde + Cancelar. | ✓ |
| Inline confirm/cancel | Botón se expande a dos botones inline. Sin modal. | |
| window.confirm nativo | Browser dialog. Rompe el diseño visual. | |

**User's choice:** Modal de confirmación

| Option | Description | Selected |
|--------|-------------|----------|
| No, reactivar es instantáneo | Solo el paso destructivo (revocar) pide confirmación. | |
| Sí, mismo modal para ambos | Consistencia: cualquier cambio de estado pide confirmación. | ✓ |

**User's choice:** Sí, mismo modal para ambos — consistencia sobre fricción mínima

---

## QR download location

| Option | Description | Selected |
|--------|-------------|----------|
| Botón por fila en la lista | Ícono de descarga QR en cada fila. Flujo rápido, sin abrir drawer. | ✓ |
| Solo desde el drawer de edición | La descarga está en el detalle. | |
| Ambos (fila + drawer) | Máxima accesibilidad; más código. | |

**User's choice:** Botón por fila en la lista

| Option | Description | Selected |
|--------|-------------|----------|
| Iconos siempre visibles | 3 iconos en columna de acciones: lápiz, toggle estado, QR. Simple y directo. | ✓ |
| Menú contextual (...) | Dropdown con las opciones. Un paso extra. | |
| Acciones en hover | Aparecen al hover. No apto para touch. | |

**User's choice:** Iconos siempre visibles

---

## Claude's Discretion

- Número de registros por página (20 es estándar)
- Ordenamiento por defecto (fecha de creación DESC)
- Diseño exacto de la top bar (altura, padding)
- Transición/animación del drawer (~200ms slide-in desde derecha)
- Texto exacto del modal de confirmación

## Deferred Ideas

- Sidebar con múltiples secciones — v2, cuando haya más secciones admin
- Acciones en hover en la tabla — descartadas por accesibilidad
- QR download también desde el drawer — v1 solo necesita botón por fila
