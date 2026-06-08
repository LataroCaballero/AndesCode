# Phase 1: Infrastructure Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-06
**Phase:** 1-Infrastructure Foundation
**Areas discussed:** VPS current state, PocketBase process mgmt, Collection schema creation, Backup destination

---

## VPS Current State

| Option | Description | Selected |
|--------|-------------|----------|
| Limpio — nginx no instalado | VPS fresco, sin nginx ni SSL. El plan instala todo desde cero. | |
| Nginx instalado, SSL no | Nginx corre pero sin HTTPS. El plan agrega SSL y configura el reverse proxy. | |
| Nginx + SSL ya configurados | El sitio ya corre con HTTPS. El plan solo agrega el bloque para PocketBase. | ✓ |

**User's choice:** Nginx + SSL ya configurados

---

| Option | Description | Selected |
|--------|-------------|----------|
| Sí, el SPA ya está en producción | andescode.com.ar ya sirve el sitio de marketing. | ✓ |
| No, todavía no está desplegado | nginx + SSL existen pero no sirven el SPA actual. | |

**User's choice:** Sí, el SPA ya está en producción

---

| Option | Description | Selected |
|--------|-------------|----------|
| Lo sé y lo puedo compartir | Puede dar el path exacto y el usuario. | |
| No sé exactamente | El plan debe incluir auditoría (nginx -T) como primer paso. | ✓ |
| Tú decide | El plan incluye auditoría estándar como primer paso. | |

**User's choice:** No sé exactamente — el plan debe comenzar con auditoría

---

## PocketBase Process Management

| Option | Description | Selected |
|--------|-------------|----------|
| systemd service (Recomendado) | Unit file que inicia PocketBase al boot, reinicia ante crashes, logs en journald. | |
| Docker container | Corre PocketBase en un contenedor con imagen oficial. Requiere Docker instalado. | |
| PM2 | Process manager de Node.js que también puede gestionar binarios. | ✓ |

**User's choice:** PM2

---

| Option | Description | Selected |
|--------|-------------|----------|
| Ya está instalado | PM2 corre en el VPS actualmente. | ✓ |
| No está instalado aún | El plan incluye la instalación de PM2. | |
| No lo sé | El plan incluye un check condicional. | |

**User's choice:** Ya está instalado

---

| Option | Description | Selected |
|--------|-------------|----------|
| /home/[user]/pocketbase/ (Recomendado) | Directorio dentro del home del usuario. Simple, sin sudo para actualizar. | ✓ |
| /opt/pocketbase/ | Directorio estándar para software third-party en Linux. | |
| Tú decide | El plan usa /home/[user]/pocketbase/ como convención. | |

**User's choice:** /home/[user]/pocketbase/ (Recomendado)

---

## Collection Schema Creation

| Option | Description | Selected |
|--------|-------------|----------|
| Admin UI — manual, una vez | El plan documenta los campos; el operador los crea desde el panel /_/. | |
| PocketBase migrations — reproducible | Se genera un archivo en pb_migrations/, versionado en git. | ✓ |
| Script de seed vía API REST | Un script bash/JS usa la API para crear la colección programaticamente. | |

**User's choice:** PocketBase migrations — reproducible

---

| Option | Description | Selected |
|--------|-------------|----------|
| Local + producción separados | Cada dev corre PocketBase en su máquina. Las migrations replican el schema. | |
| Solo producción | Se trabaja directamente contra el VPS. VITE_POCKETBASE_URL apunta a producción. | ✓ |

**User's choice:** Solo producción

---

## Backup Destination

| Option | Description | Selected |
|--------|-------------|----------|
| Disco local del VPS | Backup en /home/[user]/pocketbase/backups/. Simple, sin cuentas externas. | ✓ |
| Almacenamiento remoto (S3/B2/Backblaze) | El cron sube el backup a un bucket externo. Resistente a falla del VPS. | |
| Tú decide | El investigador elige la mejor opción. | |

**User's choice:** Disco local del VPS

---

| Option | Description | Selected |
|--------|-------------|----------|
| 7 días (Recomendado) | Una semana de backups, balance entre espacio y ventana de recuperación. | ✓ |
| 30 días | Un mes de retención, mayor ventana pero más espacio en disco. | |
| Tú decide | El plan usa 7 días como convención estándar. | |

**User's choice:** 7 días

---

## Claude's Discretion

- Horario exacto del cron de backup (nocturno, ej: 2am)
- Nombre del usuario del sistema que corre nginx/PM2 (se descubre en la auditoría del VPS)
- Versión específica de PocketBase a instalar (última estable)

## Deferred Ideas

Ninguna — la discusión se mantuvo dentro del scope de la Fase 1.
