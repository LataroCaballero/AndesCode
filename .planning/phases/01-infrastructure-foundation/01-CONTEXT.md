# Phase 1: Infrastructure Foundation - Context

**Gathered:** 2026-06-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Establecer el backend y la infraestructura de servidor necesaria para que el sistema de certificados funcione. Esto incluye: PocketBase corriendo en el VPS vía PM2, nginx configurado con reverse proxy para PocketBase, colección `certificates` creada vía PocketBase migrations con el schema completo y las API rules correctas, backups automáticos diarios, y la variable de entorno `VITE_POCKETBASE_URL` configurada en el frontend. No hay feature code en esta fase — todo es infraestructura de base.

</domain>

<decisions>
## Implementation Decisions

### VPS Current State
- **D-01:** Nginx + SSL ya están configurados en el VPS y el SPA de marketing ya está en producción.
- **D-02:** El plan debe comenzar con una auditoría de nginx (`nginx -T`) para descubrir la configuración existente antes de hacer cualquier cambio. El directorio de serving y el usuario del proceso son desconocidos — la auditoría los revela.
- **D-03:** El bloque de reverse proxy para PocketBase se agrega a la configuración nginx existente (no reemplaza, no parte de cero).

### PocketBase Process Management
- **D-04:** PocketBase corre gestionado por **PM2** (PM2 ya está instalado en el VPS).
- **D-05:** El binario de PocketBase y sus datos viven en `/home/[user]/pocketbase/` (directorio home del usuario que corre el proceso).
- **D-06:** PocketBase se inicia con `--http=127.0.0.1:8090` — nunca expuesto en puerto público (firewall bloquea el acceso directo a 8090).
- **D-07:** PM2 se configura con `pm2 startup` para que PocketBase reinicie automáticamente al reboot del servidor.

### Collection Schema Creation
- **D-08:** La colección `certificates` se crea vía **PocketBase migrations** (archivos en `pb_migrations/`), versionados en git. Esto garantiza reproducibilidad aunque actualmente no haya entorno local.
- **D-09:** No hay entorno local de PocketBase — el desarrollo apunta directamente al VPS de producción. `VITE_POCKETBASE_URL` en `.env.local` apunta al VPS.
- **D-10:** Las API rules de la colección deben implementarse exactamente según INFRA-06: `listRule = "@request.auth.id != \"\""`, `viewRule = ""`, `createRule = null`, `updateRule = null`, `deleteRule = null`. **Crítico:** `listRule = ""` (string vacío) significaría acceso público a todos los DNI — DEBE ser la expresión de autenticación.

### Backup Strategy
- **D-11:** Backups diarios guardados en **disco local del VPS** en `/home/[user]/pocketbase/backups/`.
- **D-12:** Retención de **7 días** — el cron elimina automáticamente backups con más de 7 días de antigüedad.
- **D-13:** El cron usa el mecanismo de backup nativo de PocketBase (API o CLI) para generar el archivo comprimido.

### Claude's Discretion
- Horario exacto del cron de backup (nocturno, ej: 2am, es estándar).
- Nombre del usuario del sistema que corre nginx/PM2 en el VPS (se descubre en la auditoría).
- Versión específica de PocketBase a instalar (usar la última estable).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements and Roadmap
- `.planning/REQUIREMENTS.md` — Requirements INFRA-01 through INFRA-08 con todos los campos del schema, las API rules exactas, y los criterios de éxito de la fase
- `.planning/ROADMAP.md` — Phase 1 success criteria (5 criterios verificables, incluyendo los curl tests)

### Reference Design
- `ref/assets/certificado.png` — Diseño del certificado físico de referencia (no relevante para esta fase pero los agentes de fases posteriores lo necesitan)

### No external specs
No hay ADRs ni specs externos adicionales — las decisiones de infraestructura están capturadas en las secciones de decisions arriba y en REQUIREMENTS.md.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/vite-env.d.ts` — Existe y debe ser augmentado con `VITE_POCKETBASE_URL: string` para que TypeScript reconozca la variable de entorno.
- No hay SDK de PocketBase instalado aún — se instalará en esta fase (`pocketbase` npm package).

### Established Patterns
- Variables de entorno: El proyecto actualmente no usa ninguna. El patrón a establecer es `import.meta.env.VITE_POCKETBASE_URL` con type augmentation en `vite-env.d.ts`.
- `.env` + `.env.production`: No existen aún. Esta fase los crea por primera vez.

### Integration Points
- `src/vite-env.d.ts` — Augmentar con el tipo de `VITE_POCKETBASE_URL`.
- `src/main.tsx` — No requiere cambios en esta fase; es puramente infraestructura de servidor.
- No hay rutas nuevas en esta fase — las rutas `/certificados` y `/admin` se agregan en fases posteriores.

</code_context>

<specifics>
## Specific Ideas

- El reverse proxy de nginx debe manejar `/api/*` y `/_/*` hacia PocketBase, y el resto hacia el SPA con `try_files $uri $uri/ /index.html`.
- El backup diario usa `pm2 cron` o un crontab del sistema — el investigador determina cuál es más limpio con PM2 ya gestionando el proceso.

</specifics>

<deferred>
## Deferred Ideas

Ninguna — la discusión se mantuvo dentro del scope de la Fase 1.

</deferred>

---

*Phase: 1-Infrastructure Foundation*
*Context gathered: 2026-06-06*
