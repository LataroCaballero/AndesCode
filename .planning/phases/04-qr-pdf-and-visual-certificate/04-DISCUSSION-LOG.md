# Phase 4: QR, PDF, and Visual Certificate - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-08
**Phase:** 4-qr-pdf-and-visual-certificate
**Areas discussed:** Visual del certificado en la página, Librería de PDF, Open Graph metadata

---

## Visual del certificado en la página

| Option | Description | Selected |
|--------|-------------|----------|
| Siempre visible | Certificado visual debajo del grid actual, siempre renderizado | |
| Toggle expandible | Botón "Ver certificado" que despliega la vista HTML/CSS | |
| Reemplaza el grid actual | El certificado visual HTML/CSS reemplaza el grid de metadatos. Un solo layout cohesivo | ✓ |

**User's choice:** Reemplaza el grid actual

---

| Option | Description | Selected |
|--------|-------------|----------|
| Fiel al original | Misma estructura del ref/assets/certificado.png: dos logos, nombre centrado, campos en dos columnas, QR abajo a la derecha | ✓ |
| Inspirado, adaptado al web | Mismos campos pero diseño web-first: layout vertical, tipografía Inter grande, acento #4342FF | |

**User's choice:** Fiel al original — misma estructura del certificado físico de referencia

---

| Option | Description | Selected |
|--------|-------------|----------|
| Marca de agua diagonal | Certificado completo con "REVOCADO" diagonal en rojo semitransparente. Status badge ❌ arriba como ancla | ✓ |
| Status badge separado arriba | Badge ❌ separado, el certificado se muestra igual independientemente del estado | |

**User's choice:** Marca de agua diagonal para certificados revocados

---

| Option | Description | Selected |
|--------|-------------|----------|
| Dentro del certificado visual | QR embebido en el cert; botón "Descargar PDF" debajo del certificado | |
| Sección de acciones separada arriba | Status badge + botones (Descargar PDF, Copiar enlace) arriba. QR dentro del certificado | ✓ |

**User's choice:** Sección de acciones separada arriba — acciones siempre visibles sin scroll

---

## Librería de PDF

| Option | Description | Selected |
|--------|-------------|----------|
| jsPDF | Programática: dibuja texto, imágenes, shapes. Control total. Dos implementaciones separadas (HTML para VIS-01, programática para PDF) | ✓ |
| @react-pdf/renderer | React DSL que renderiza a PDF. Bundle más grande (~1.5MB), motor de layout propio | |

**User's choice:** jsPDF

---

| Option | Description | Selected |
|--------|-------------|----------|
| Inter + bundleada | Inter-Regular.ttf e Inter-Bold.ttf en src/assets/fonts/, importados con Vite ?url | ✓ |
| Helvetica (built-in de jsPDF) | Helvetica incluida en jsPDF sin archivos externos. Distinto al branding del sitio | |

**User's choice:** Inter self-hosted — coherente con la tipografía del sitio

---

| Option | Description | Selected |
|--------|-------------|----------|
| qrcode (node/browser lib) | Package `qrcode` genera dataURL sin DOM. Se llama directo desde el generador de PDF | ✓ |
| Capturar del DOM (qrcode.react) | Usar ref + canvas.toDataURL() del QR ya montado en la página | |

**User's choice:** `qrcode` package directo — sin acoplamiento al DOM

---

## Open Graph metadata

Antes de la pregunta, el usuario pidió una explicación de qué es Open Graph metadata. Se explicó que son `<meta>` tags que controlan el preview al compartir links en WhatsApp/Twitter/LinkedIn, y que en una SPA sin SSR los crawlers principales no leen los tags inyectados por React.

| Option | Description | Selected |
|--------|-------------|----------|
| Client-side via react-helmet-async | OG tags dinámicos, funciona para WhatsApp parcialmente. Twitter/LinkedIn probablemente no | |
| Diferir a v2 (SSR) | Moverlo a v2 donde está previsto con SSR. URL sin preview en v1 | ✓ |
| Tags estáticos en index.html | OG genéricos fijos, no específicos por certificado | |

**User's choice:** Diferir a v2 — OG dinámico requiere SSR para funcionar correctamente

---

## Claude's Discretion

- Orientación del PDF (landscape según ref/assets/certificado.png)
- Colores exactos del certificado visual (basarse en el diseño de referencia)
- Tipografía dentro del certificado (Inter para campos, Fira Code para el ID)
- Nombre del archivo PDF descargado
- Dimensiones del QR en el certificado visual y en el PDF

## Deferred Ideas

- **Open Graph metadata dinámica** — diferido a v2 junto con SHARE-02; requiere SSR o prerender con nginx
