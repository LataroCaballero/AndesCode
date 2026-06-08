# AndesCode — Sistema de Certificados Verificables

## What This Is

AndesCode es el sitio de marketing y portfolio de una empresa de desarrollo de software. El proyecto agrega un sistema completo de certificados verificables e insignias digitales para los estudiantes que realizan Prácticas Profesionales Situadas (PPS) dentro de la empresa. Cualquier persona puede verificar la autenticidad de un certificado escaneando un QR o ingresando su ID. El administrador puede emitir, editar y revocar certificados desde un panel interno protegido.

## Core Value

Cualquier persona debe poder verificar la autenticidad de un certificado AndesCode en segundos, sin crear cuenta, sin fricciones.

## Requirements

### Validated

- ✓ Sitio de marketing con múltiples rutas (Home, Servicios, Nosotros, Trabajos, Contacto) — existente
- ✓ Header y Footer reutilizables, sistema de navegación — existente
- ✓ Formulario de contacto vía Formspree — existente
- ✓ Portfolio de proyectos en /trabajos — existente
- ✓ Diseño visual responsivo con Tailwind CSS v4 y design tokens — existente
- ✓ Modo claro/oscuro via ThemeContext — existente
- ✓ Panel admin `/admin` protegido con email + contraseña — Phase 02/03
- ✓ CRUD completo de certificados (crear, editar, revocar, reactivar, buscar, paginar) — Phase 03
- ✓ Backend PocketBase auto-hospedado con colección `certificates` — Phase 02/03
- ✓ Formato de ID: `AC-YYYY-NNN` auto-generado — Phase 03
- ✓ QR generado client-side por certificado para descarga SVG — Phase 03

### Active

- [ ] Página pública de verificación `/certificados/[id]` con estado válido/revocado
- [ ] Página de búsqueda `/certificados` para ingresar un ID manualmente
- [ ] Descarga del certificado en PDF (diseño visual consistente con el certificado de referencia)
- [ ] Open Graph metadata para compartir el enlace de un certificado

### Out of Scope

- Sistema de insignias digitales (Badges) — diferido a v2
- Página pública con todas las insignias disponibles — diferido a v2
- Estadísticas de certificados emitidos — diferido a v2
- OAuth / Google login — v1 usa email + contraseña
- Múltiples universidades / logos variables — v1 solo UNSJ (FCEFN), logo hardcodeado
- Internacionalización (i18n) — el sitio es exclusivamente en español

## Context

**Codebase existente:** React 19 + TypeScript + Vite 7 + Tailwind CSS v4 + react-router-dom v7. No tiene backend; el único servicio externo es Formspree para el formulario de contacto.

**PocketBase:** Backend self-hosted (VPS propio). Provee REST API + WebSocket + auth integrada + admin UI en `/_/`. La React app se conecta vía SDK o fetch directo al endpoint configurado en variable de entorno.

**Certificado de referencia:** El diseño del certificado en papel ya existe (ref/assets/certificado.png). Incluye logo AndesCode + logo FCEFN, nombre del estudiante, DNI, descripción de la práctica, período, área de desempeño, herramientas usadas, calificación, firma del gerente, y QR de verificación.

**ID de certificado:** Formato `AC-YYYY-NNN`. El ID es la clave primaria pública; el QR linkea a `https://andescode.com.ar/certificados/AC-2025-014`.

**Estética objetivo:** Minimalista tecnológico. Paleta #191919 / #FFFFFF, acentos en #4342FF. Inspiración en Linear, Stripe, Vercel. Mucho espacio en blanco, tipografía Inter.

## Constraints

- **Tech stack:** React + TypeScript + Vite + Tailwind CSS v4 — no cambiar el stack del frontend
- **Backend:** PocketBase en VPS propio — no usar Supabase, Firebase ni servicios externos de BD
- **Universidades:** Solo UNSJ / FCEFN en v1 — logo hardcodeado, no sistema de logos dinámicos
- **Badges:** Fuera del alcance de v1 — no implementar
- **Sin backend propio de Node:** PocketBase es el único servidor; no Express, no API separada
- **PDF:** jsPDF o similar client-side — sin servidor de renderizado

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PocketBase como backend | Self-hosted, single binary, incluye auth + admin UI. Cero vendor lock-in | Funcionando en producción — Phase 02/03 |
| Auth: email + contraseña | Simplest viable, PocketBase lo soporta nativamente | AdminGuard + PocketBaseContext implementados — Phase 02 |
| QR generado client-side | No requiere backend; la librería `qrcode.react` genera SVG en el navegador | Implementado vía XMLSerializer + Blob download — Phase 03 |
| `sort: '-issueDate'` en lugar de `'-created'` | PocketBase server no indexa el campo sistema `created` para sort | Forzado por comportamiento real del servidor — Phase 03 |
| `$autoCancel: false` en PocketBase SDK | React 19 Strict Mode doble-invoca effects; el SDK cancela la primera llamada | Aplicado a todos los getList del admin — Phase 03 |
| PDF generado client-side | jsPDF/react-pdf evita servidor de renderizado; suficiente para v1 | — Pending (Phase 04) |
| FCEFN hardcodeado en v1 | Todos los PPS actuales son de la UNSJ; soporte multi-universidad es v2 | — Pending |
| Badges diferidos a v2 | El sistema de verificación es el core value; las insignias son una mejora posterior | Confirmado fuera de v1 |

## Evolution

Este documento evoluciona en cada transición de fase.

**Después de cada fase (`/gsd-transition`):**
1. ¿Requisitos invalidados? → Mover a Out of Scope con razón
2. ¿Requisitos validados? → Mover a Validated con referencia de fase
3. ¿Nuevos requisitos emergieron? → Agregar a Active
4. ¿Decisiones a registrar? → Agregar a Key Decisions
5. ¿"What This Is" sigue siendo preciso? → Actualizar si cambió

**Después de cada milestone (`/gsd-complete-milestone`):**
1. Revisión completa de todas las secciones
2. Verificar Core Value — ¿sigue siendo la prioridad correcta?
3. Auditar Out of Scope — ¿las razones siguen siendo válidas?
4. Actualizar Context con el estado actual

---
*Last updated: 2026-06-08 after Phase 03 (admin-crud)*
