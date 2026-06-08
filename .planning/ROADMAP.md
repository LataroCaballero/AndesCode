# Roadmap: AndesCode — Sistema de Certificados Verificables

## Overview

The certificate verification system is built in four phases. Phase 1 establishes the backend infrastructure that every other phase depends on. Phase 2 delivers the core public value: anyone can verify a certificate without an account. Phase 3 gives the admin full control over the certificate lifecycle. Phase 4 completes the product with QR codes, PDF downloads, and the HTML visual certificate preview — making the end-to-end experience polished and print-ready.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Infrastructure Foundation** - PocketBase on VPS, nginx reverse proxy, SSL, certificates collection schema, backups, and env config
- [x] **Phase 2: Auth + Public Verification** - Admin login with session persistence and the complete public certificate verification flow (completed 2026-06-08)
- [ ] **Phase 3: Admin CRUD** - Certificate list, create/edit forms, revoke/reactivate actions, and QR download from admin
- [ ] **Phase 4: QR, PDF, and Visual Certificate** - QR on verification page, PDF download, and HTML/CSS certificate preview

## Phase Details

### Phase 1: Infrastructure Foundation

**Goal**: The backend is running, secured, and ready for the React app to connect — no feature code can start without this.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06, INFRA-07, INFRA-08
**Success Criteria** (what must be TRUE):

  1. `curl https://andescode.com.ar/api/collections/certificates/records/nonexistent` returns a 404 (not a connection error) — PocketBase is reachable via nginx over HTTPS
  2. `curl https://andescode.com.ar/api/collections/certificates/records` without auth returns a 403 — list rule is correctly enforced
  3. A test certificate record can be created in the PocketBase admin UI and retrieved via `viewRule` with no auth token
  4. Port 8090 is not reachable from the public internet (firewall blocks direct access)
  5. `VITE_POCKETBASE_URL` resolves correctly in the browser via `import.meta.env.VITE_POCKETBASE_URL`**Plans**: 3 plans

**Wave 1**

- [x] 01-01-PLAN.md — Repo artifacts: certificates migration, Vite env wiring, versioned PM2 config + deploy runbook

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — VPS deploy: install PocketBase under PM2, nginx reverse proxy, firewall, superuser

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-03-PLAN.md — Native daily backup (7-day retention) + full phase-gate verification

### Phase 2: Auth + Public Verification

**Goal**: Anyone can verify a certificate instantly with no account; the admin can log in and maintain a persistent session.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, VERIF-01, VERIF-02, VERIF-03, VERIF-04, VERIF-05, VERIF-06, VERIF-07, VERIF-08, VERIF-09, VIS-02, VIS-03, VIS-04, VIS-05
**Success Criteria** (what must be TRUE):

  1. Visiting `/certificados/AC-2025-001` loads the certificate with VALID or REVOKED status visible above the fold without scrolling — on mobile
  2. Entering an ID in `/certificados` search (any case, with or without dashes) navigates to the correct certificate page; an unknown ID shows "Certificado no encontrado" (distinct from revoked)
  3. The admin can log in at `/admin/login`, reload the page, and remain logged in without re-entering credentials; logout clears the session completely
  4. Navigating directly to `/admin` or any `/admin/*` route without a session redirects to `/admin/login`
  5. The verification page shows all certificate fields (name, ID, dates, institution, description, score, technologies as tags) and a copy-URL button — with no auth required

**Plans**: TBD
**UI hint**: yes

### Phase 3: Admin CRUD

**Goal**: The admin can manage the full certificate lifecycle — creating, editing, revoking, and reactivating certificates from the panel.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05, ADMIN-06, ADMIN-07, ADMIN-08, ADMIN-09, ADMIN-10
**Success Criteria** (what must be TRUE):

  1. The admin sees a paginated list of all certificates with ID, student name, issue date, and status columns; the list is filterable by status and searchable by name or ID
  2. Creating a certificate auto-generates an `AC-YYYY-NNN` code (editable before save); the form validates all required fields and rejects submission on missing data
  3. The admin can edit any field of an existing certificate and save the change — the public verification page reflects the update immediately
  4. Revoking a certificate requires a confirmation step; after revocation, the public verification page shows REVOKED status; the admin can reactivate the certificate to restore VALID status
  5. The admin can download the QR code for any certificate as an SVG file from the admin panel

**Plans**: 3 plans

**Wave 1**

- [x] 03-01-PLAN.md — Admin shell + read-only list: install qrcode.react, TagsInput, AdminTopBar, paginated/searchable/filterable AdminCertificateList, AdminPage orchestrator

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 03-02-PLAN.md — Create/edit slice: AdminCertificateDrawer + AdminCertificateForm, auto-generated AC-YYYY-NNN code, client validation, create/update wiring

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 03-03-PLAN.md — Revoke/reactivate + QR slice: ConfirmModal, per-row status toggle, per-row QR SVG download, human verification checkpoint

**UI hint**: yes

### Phase 4: QR, PDF, and Visual Certificate

**Goal**: The verification page is complete — QR code visible, PDF downloadable, and the certificate rendered visually as a faithful reproduction of the physical design.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: QRPDF-01, QRPDF-02, QRPDF-03, QRPDF-04, QRPDF-05, VIS-01
**Success Criteria** (what must be TRUE):

  1. A QR code is visible on `/certificados/:certificateCode`; scanning it on a phone opens the same verification URL — the QR uses error correction level H
  2. Clicking "Descargar certificado" from the public verification page downloads a PDF that matches the reference design (`ref/assets/certificado.png`): logos, student name, all fields, embedded QR
  3. The PDF downloads correctly in production (no CORS errors) because fonts are self-hosted, not loaded from Google Fonts CDN
  4. The verification page renders an HTML/CSS reproduction of the physical certificate that is visually coherent with the AndesCode brand identity

**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Infrastructure Foundation | 3/3 | Complete ✓ | 2026-06-07 |
| 2. Auth + Public Verification | 2/2 | Complete    | 2026-06-08 |
| 3. Admin CRUD | 1/3 | In Progress|  |
| 4. QR, PDF, and Visual Certificate | 0/? | Not started | - |
