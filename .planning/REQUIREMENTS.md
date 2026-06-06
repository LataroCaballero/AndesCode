# Requirements: AndesCode — Sistema de Certificados Verificables

**Defined:** 2026-06-06
**Core Value:** Cualquier persona puede verificar la autenticidad de un certificado AndesCode en segundos, sin crear cuenta, sin fricciones.

## v1 Requirements

### Infraestructura

- [ ] **INFRA-01**: PocketBase corre en el VPS con `--http=127.0.0.1:8090` (nunca expuesto en puerto público)
- [ ] **INFRA-02**: nginx hace reverse proxy de `/api/*` y `/_/*` hacia PocketBase; sirve el SPA con `try_files`
- [ ] **INFRA-03**: SSL/HTTPS configurado en nginx para el dominio de producción
- [ ] **INFRA-04**: Colección `certificates` creada con todos los campos: `certificateCode`, `studentName`, `dni`, `university`, `degree`, `startDate`, `endDate`, `issueDate`, `score`, `technologies[]`, `competencies[]`, `description`, `supervisorName`, `status`
- [ ] **INFRA-05**: `certificateCode` tiene índice UNIQUE en la base de datos
- [ ] **INFRA-06**: API rules correctas: `listRule = @request.auth.id != ""`, `viewRule = ""`, `createRule = null`, `updateRule = null`, `deleteRule = null`
- [ ] **INFRA-07**: Backup automático de la base de datos PocketBase configurado (cron diario)
- [ ] **INFRA-08**: `VITE_POCKETBASE_URL` definido en `.env` y en `.env.production`; `src/vite-env.d.ts` aumentado con el tipo

### Autenticación

- [ ] **AUTH-01**: El admin puede iniciar sesión con email + contraseña en `/admin/login`
- [ ] **AUTH-02**: La sesión persiste al recargar la página (PocketBase `LocalAuthStore` en localStorage)
- [ ] **AUTH-03**: Al recargar, el token se revalida contra el servidor; si expiró, se redirige al login
- [ ] **AUTH-04**: El admin puede cerrar sesión; la sesión se limpia completamente (token + record)
- [ ] **AUTH-05**: Todas las rutas bajo `/admin/*` redirigen a `/admin/login` si no hay sesión activa

### Verificación Pública

- [ ] **VERIF-01**: El usuario puede ingresar un ID en `/certificados` y ver el estado del certificado correspondiente
- [ ] **VERIF-02**: El input normaliza el ID (case-insensitive, acepta sin guiones, muestra hint de formato `AC-YYYY-NNN`)
- [ ] **VERIF-03**: Si el ID no existe, se muestra mensaje claro "Certificado no encontrado" (distinto de "revocado")
- [ ] **VERIF-04**: La página `/certificados/:certificateCode` carga directamente el certificado correspondiente
- [ ] **VERIF-05**: Se muestra el estado de validez con visual prominente: ✅ "Certificado válido emitido por AndesCode" o ❌ "Certificado revocado"
- [ ] **VERIF-06**: La página muestra: nombre completo, ID del certificado, fecha de emisión, período de la práctica, universidad/facultad, área de desempeño, descripción de la práctica, calificación, nombre del supervisor
- [ ] **VERIF-07**: Las tecnologías/herramientas usadas se muestran como tags visuales
- [ ] **VERIF-08**: El usuario puede copiar la URL de verificación al portapapeles con un botón
- [ ] **VERIF-09**: La página de verificación no requiere autenticación de ningún tipo

### Generación de QR y PDF

- [ ] **QRPDF-01**: Se muestra un QR code en `/certificados/:certificateCode` que encoda la URL completa de verificación
- [ ] **QRPDF-02**: El QR usa nivel de corrección de errores "H" (30% de redundancia para resistir daño físico)
- [ ] **QRPDF-03**: El usuario puede descargar el certificado como PDF desde la página pública
- [ ] **QRPDF-04**: El PDF reproduce el diseño del certificado de referencia (`ref/assets/certificado.png`): logo AndesCode, logo FCEFN/UNSJ, nombre del estudiante destacado, todos los campos relevantes, QR embebido
- [ ] **QRPDF-05**: El PDF usa fuentes self-hosted (no Google Fonts CDN) para evitar CORS en producción

### Panel Administrativo

- [ ] **ADMIN-01**: El admin ve una lista de todos los certificados con columnas: ID, nombre del estudiante, fecha de emisión, estado
- [ ] **ADMIN-02**: La lista tiene búsqueda por nombre, ID de certificado y filtro por estado (activo/revocado)
- [ ] **ADMIN-03**: La lista está paginada
- [ ] **ADMIN-04**: El admin puede crear un nuevo certificado con todos los campos del modelo de datos
- [ ] **ADMIN-05**: Al crear un certificado, el `certificateCode` se auto-genera en formato `AC-YYYY-NNN` (el admin puede editarlo antes de guardar)
- [ ] **ADMIN-06**: El formulario de creación valida todos los campos requeridos antes de enviar
- [ ] **ADMIN-07**: El admin puede editar todos los campos de un certificado existente
- [ ] **ADMIN-08**: El admin puede revocar un certificado (cambia `status` de `active` a `revoked`); la acción requiere confirmación
- [ ] **ADMIN-09**: El admin puede descargar el QR de un certificado como SVG desde la vista de detalle/lista
- [ ] **ADMIN-10**: La acción de revocar es reversible (el admin puede volver a activar si cometió un error)

### Diseño Visual

- [ ] **VIS-01**: La página de verificación muestra una reproducción HTML/CSS del certificado físico (estilo del diseño de referencia)
- [ ] **VIS-02**: El badge "Verificado por AndesCode" aparece prominente y arriba del fold en la página de certificado válido
- [ ] **VIS-03**: La estética sigue la identidad AndesCode: paleta `#191919` / `#FFFFFF`, acento `#4342FF`, Inter, minimalista
- [ ] **VIS-04**: La página de verificación es mobile-first (los QRs se escanean desde el teléfono)
- [ ] **VIS-05**: El estado VÁLIDO/REVOCADO es visualmente inmediato — no requiere hacer scroll

## v2 Requirements

### Insignias Digitales (Badges)

- **BADGE-01**: Cada certificado puede tener una o varias insignias asociadas
- **BADGE-02**: Las insignias se diseñan con SVG/CSS (no imágenes rasterizadas) — estilo premium 3D con acabado metálico
- **BADGE-03**: Página pública `/badges` con todas las insignias disponibles
- **BADGE-04**: Cada insignia tiene botón compartir en LinkedIn, copiar enlace, descarga PNG y SVG
- **BADGE-05**: Open Graph metadata por insignia para previsualización en redes sociales

### Sharing Avanzado

- **SHARE-01**: Imagen social generada automáticamente para cada certificado (requiere SSR o prerender)
- **SHARE-02**: OG tags dinámicos por certificado (requiere nginx prerender o SSR)

### Estadísticas

- **STATS-01**: Dashboard interno con cantidad de certificados emitidos, por período, por área

## Out of Scope

| Feature | Reason |
|---------|--------|
| Búsqueda pública por nombre | Violación de privacidad — enumera todos los certificados |
| Razón de revocación pública | Ambigüedad legal — solo mostrar "revocado" |
| Blockchain / firma criptográfica | El dominio andescode.com.ar es suficiente señal de confianza |
| Vencimiento de certificados | Los certificados PPS son registros históricos permanentes |
| OAuth / Google login | Email + contraseña es suficiente para admin single-user |
| Múltiples universidades en v1 | Solo UNSJ/FCEFN; logos hardcodeados |
| Importación masiva CSV | AndesCode emite decenas/año, no miles |
| Envío de email a estudiantes | Requiere infraestructura SMTP fuera del alcance actual |
| 2FA para admin | Sistema single-user; overhead innecesario |
| Expiración de sesión configurable | PocketBase gestiona tokens; comportamiento por defecto es suficiente |

## Traceability

Actualizado durante la creación del roadmap (4-phase coarse structure).

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 1 | Pending |
| INFRA-05 | Phase 1 | Pending |
| INFRA-06 | Phase 1 | Pending |
| INFRA-07 | Phase 1 | Pending |
| INFRA-08 | Phase 1 | Pending |
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| AUTH-05 | Phase 2 | Pending |
| VERIF-01 | Phase 2 | Pending |
| VERIF-02 | Phase 2 | Pending |
| VERIF-03 | Phase 2 | Pending |
| VERIF-04 | Phase 2 | Pending |
| VERIF-05 | Phase 2 | Pending |
| VERIF-06 | Phase 2 | Pending |
| VERIF-07 | Phase 2 | Pending |
| VERIF-08 | Phase 2 | Pending |
| VERIF-09 | Phase 2 | Pending |
| VIS-02 | Phase 2 | Pending |
| VIS-03 | Phase 2 | Pending |
| VIS-04 | Phase 2 | Pending |
| VIS-05 | Phase 2 | Pending |
| ADMIN-01 | Phase 3 | Pending |
| ADMIN-02 | Phase 3 | Pending |
| ADMIN-03 | Phase 3 | Pending |
| ADMIN-04 | Phase 3 | Pending |
| ADMIN-05 | Phase 3 | Pending |
| ADMIN-06 | Phase 3 | Pending |
| ADMIN-07 | Phase 3 | Pending |
| ADMIN-08 | Phase 3 | Pending |
| ADMIN-09 | Phase 3 | Pending |
| ADMIN-10 | Phase 3 | Pending |
| QRPDF-01 | Phase 4 | Pending |
| QRPDF-02 | Phase 4 | Pending |
| QRPDF-03 | Phase 4 | Pending |
| QRPDF-04 | Phase 4 | Pending |
| QRPDF-05 | Phase 4 | Pending |
| VIS-01 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 42 total
- Mapped to phases: 42
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-06*
*Last updated: 2026-06-06 — traceability updated for 4-phase coarse roadmap*
