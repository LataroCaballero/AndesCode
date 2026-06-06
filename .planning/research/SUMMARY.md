# Project Research Summary

**Project:** AndesCode — Sistema de Certificados Verificables
**Domain:** Digital credential verification — internship/PPS certificate system added to an existing React SPA
**Researched:** 2026-06-06
**Confidence:** HIGH

## Executive Summary

AndesCode's certificate system is a two-audience product: employers and institutions need to verify a certificate in seconds without any account (public verification page), while AndesCode staff need to issue, edit, and revoke certificates from a protected admin panel. Research across four domains confirms that trust is the entire product — any friction, any ambiguity in the VALID/REVOKED status, or any dependency on authentication for the verifier destroys the core value proposition. Platforms like Accredible and Credly validate this: verification must be frictionless, URL-based, and hosted on the issuer's own domain. The QR code encodes the full verification URL; the URL's presence on `andescode.com.ar` is itself the authenticity signal.

The recommended approach integrates PocketBase (self-hosted on the existing VPS) as the sole backend into the existing React 19 + Vite 7 + TypeScript + Tailwind CSS v4 stack. No new frameworks, no server-side rendering, no third-party cloud database. Client-side PDF generation via `@react-pdf/renderer` and QR via `qrcode.react` keep infrastructure minimal. The admin panel is a thin internal tool — `react-hook-form` + `zod` for forms, `@tanstack/react-table` for the certificate list — all Tailwind-native with no component library conflicts.

The highest risks are operational and security-related, not architectural. PocketBase collection API rules have a subtle null-vs-empty-string distinction that can silently expose all certificate data (including DNI numbers) publicly. The admin panel port must be firewalled from day one. PDF generation fails silently in production when fonts are loaded from Google Fonts CDN instead of self-hosted files due to CORS.

---

## Key Findings

### Recommended Stack

All additions integrate without changing the existing stack.

| Package | Version | Purpose |
|---------|---------|---------|
| `pocketbase` | 0.27.0 | Backend SDK — auth, CRUD. Module-level singleton `src/lib/pb.ts`. |
| `qrcode.react` | 4.2.0 | SVG QR component (`<QRCodeSVG>`). React 19 peer dep added in v4.2.0. |
| `@react-pdf/renderer` | 4.5.1 | Declarative JSX-based PDF — vector output, embeddable fonts, selectable text. Vite 7 compatible. |
| `react-hook-form` | 7.77.0 | Admin form state — uncontrolled inputs, zero re-renders. |
| `zod` | 4.4.3 | Schema validation — v4 is 14x faster than v3; `z.infer<>` gives compile-time types. |
| `@hookform/resolvers` | 5.4.0 | Bridge between react-hook-form and Zod v4. |
| `@tanstack/react-table` | 8.21.3 | Headless table for admin certificate list — no UI library coupling. |

### Expected Features

**Must have (table stakes):**
- `/certificados/:id` — VALID/REVOKED status large and immediate; recipient name, cert ID, issue date, period, institution logos, practice description
- `/certificados` — ID lookup with format hint, case-insensitive normalization, "not found" vs. "revoked" distinction
- `/admin` — email+password login, certificate list with search + filter, create/edit/revoke CRUD, auto-generate `AC-YYYY-NNN` ID, QR download
- PDF download matching reference certificate design (`ref/assets/certificado.png`)
- QR encodes full URL, downloadable by admin; mobile-first layout; no auth required to verify

**Should have (differentiators):**
- Visual certificate preview on verification page
- "Verified by AndesCode" branded trust badge above the fold
- Technologies/tools tag list; copy certificate URL button

**Defer to v2+:**
- Per-certificate Open Graph images (SPA cannot serve dynamic OG to social crawlers without nginx prerender)
- Analytics/view tracking; badge system; batch CSV import; email delivery

**Anti-features (explicitly do NOT build):**
- Public certificate search by name (privacy violation — ID-only lookup)
- Revocation reason shown publicly (legal ambiguity)
- Blockchain / cryptographic signing (domain ownership is sufficient trust)
- Certificate expiry (PPS certificates are permanent historical records)

### Architecture Approach

Two new route subtrees: `/certificados/*` (public) and `/admin/*` (protected via `ProtectedRoute` with `Outlet`). A single `AuthProvider` wraps the entire route tree. PocketBase runs on the same VPS behind nginx — same-domain strategy eliminates CORS entirely.

**Major new components:**
1. `src/lib/pb.ts` — PocketBase singleton (module-level, NOT Context)
2. `src/contexts/AuthContext.tsx` — auth state via `pb.authStore.onChange`
3. `src/components/ProtectedRoute.tsx` — Outlet-based guard for `/admin/*`
4. `src/hooks/useCertificate.ts` — public single-record fetch by `certificateCode`
5. `src/hooks/useCertificates.ts` — admin paginated list with search/filter
6. `src/services/certificates.ts` — CRUD mutations
7. `src/pages/certificados/` — public verification + search pages
8. `src/pages/admin/` — login, list, create, edit pages

**PocketBase `certificates` collection schema:**
- `certificateCode` — Text, required, UNIQUE index (the `AC-YYYY-NNN` public ID)
- `status` — Select (`active`/`revoked`) — allows future states without migration
- `technologies`, `competencies` — Multi-select (not JSON) — enforces values
- `dni` — Text (not Number) — preserves Argentine DNI format
- List rule: `@request.auth.id != ""` (auth required); View rule: `""` (public)
- Create/Update/Delete: `null` (superuser only)

### Critical Pitfalls

1. **PocketBase `listRule` null vs. `""`** — Empty string exposes all student DNI data to unauthenticated enumeration. Set `listRule` to `@request.auth.id != ""`. Audit before every deploy.

2. **Port 8090 exposed publicly** — Always start with `--http=127.0.0.1:8090`. Add `ufw deny 8090`. Add nginx IP restriction for `/_/`.

3. **PDF font CORS in production** — `@react-pdf/renderer` fetches fonts via `fetch()`. Google Fonts URLs fail CORS. Self-host Inter `.ttf` in `/public/fonts/`, register with `Font.register({ src: '/fonts/Inter-Regular.ttf' })`.

4. **html2canvas for PDF = wrong choice** — Produces 72 DPI blurry raster output unfit for print. Use `@react-pdf/renderer` exclusively.

5. **authStore not rehydrating on refresh** — `pb.authStore.onChange` does not fire on initial load. Call `pb.collection('_superusers').authRefresh()` on mount inside `ProtectedRoute`; handle 401 with `authStore.clear()` + redirect.

---

## Roadmap Implications

**Suggested phases: 6**

| Phase | Name | Key Deliverable | Can Parallel |
|-------|------|-----------------|--------------|
| 1 | Infrastructure Foundation | PocketBase on VPS, nginx, schema, backup | No — everything depends on this |
| 2 | Auth Layer | AuthContext, ProtectedRoute, /admin/login | Yes (parallel with Phase 3) |
| 3 | Public Verification Pages | /certificados/:id + /certificados search | Yes (parallel with Phase 2) |
| 4 | Admin CRUD | Certificate list + create/edit/revoke forms | No — requires Phase 1 + 2 |
| 5 | QR + PDF Generation | qrcode.react + @react-pdf/renderer | No — requires Phase 3 + 4 structure |
| 6 | Visual Polish | Certificate HTML preview, trust badge, copy URL | Yes — deferrable |

---

## Open Questions Before Roadmap

1. **OG tags strategy**: Static branded fallback accepted for v1? If LinkedIn/WhatsApp previews showing student names matter, the nginx-level crawler detection approach (~2h) should be in Phase 3 scope.
2. **VPS current state**: nginx, SSL, firewall already configured? Phase 1 should start with a VPS audit.
3. **Certificate ID auto-generation**: Client-side read-modify-write with UNIQUE constraint + 400 error handling is sufficient for v1 volume. Server-side `pb_hooks` approach is optional.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All package versions npm-verified. Vite 7 + `@react-pdf/renderer` v4 is MEDIUM (v3+ resolved shim; no Vite 7 regressions reported). |
| Features | HIGH | Grounded in Accredible, Credly, Certifier research. Anti-features clearly identified. |
| Architecture | HIGH | All patterns verified against official PocketBase JS SDK, production docs, React Router v7 docs. |
| Pitfalls | HIGH | All critical pitfalls traced to official GitHub issues or official docs. Prevention strategies actionable. |

**Overall confidence: HIGH**

---
*Research completed: 2026-06-06*
*Ready for roadmap: yes*
