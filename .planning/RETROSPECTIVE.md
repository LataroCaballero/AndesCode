# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Certificados Verificables

**Shipped:** 2026-06-09
**Phases:** 4 | **Plans:** 10 | **Tasks:** 17

### What Was Built
- PocketBase backend on a self-hosted VPS (PM2 + nginx reverse proxy + SSL + ufw + daily native backups), with a `certificates` collection (UNIQUE `certificateCode`, public `viewRule`, auth-only `listRule`).
- Admin auth (email + password) with `LocalAuthStore` session persistence and server-side token revalidation, plus a fully protected `/admin/*` surface.
- Public, no-account certificate verification: normalized ID search and a `/certificados/:certificateCode` page with prominent VÁLIDO/REVOCADO status above the fold.
- Admin CRUD lifecycle: paginated/filterable/searchable list, 14-field create/edit drawer with auto-generated `AC-YYYY-NNN` codes, revoke/reactivate behind confirmation, per-row QR SVG download.
- Visual certificate reproduction (HTML/CSS) with embedded level-H QR, and a client-side jsPDF download with self-hosted Inter fonts and a REVOCADO watermark.

### What Worked
- **Walking-skeleton first.** Phase 1 stood up the full backend path (VPS → nginx → PocketBase → SSL → backups) before any feature code, so every later phase had a real endpoint to build against.
- **Vertical slices per phase.** Public verification, admin CRUD, and PDF each shipped as end-to-end slices rather than horizontal layers — kept each phase independently demoable.
- **Server-behavior-driven decisions.** Several choices (`sort: '-issueDate'`, `$autoCancel: false`, `listRule != ""`) were pinned to *observed* PocketBase/React-19 behavior rather than assumptions, and were logged in Key Decisions.

### What Was Inefficient
- **Requirement checkboxes drifted from the traceability table.** INFRA-01..08 stayed `[ ]` in REQUIREMENTS.md even though Phase 1 completed and traceability said Complete — had to be reconciled at milestone close.
- **PDF visual fidelity required several follow-up fixes** (dynamic page height, CERTIFICADO spacing, score 0–100, bottom-row flow) after the initial Phase 4 implementation — visual/layout work is hard to get right in one pass without a human in the loop.
- **An informal "Open Graph" wish lived in PROJECT.md Active** but was never formalized as a REQ-ID and never built — surfaced only at close. Informal scope items should be promoted to requirements or explicitly deferred when noted.

### Patterns Established
- PocketBase access via a singleton client + reactive React Context; `pb.filter()` for all user-supplied search input (injection-safe).
- Client-side-only artifact generation (QR via XMLSerializer+Blob, PDF via jsPDF with same-origin self-hosted fonts) — no render server, no CORS surface.
- Confirmation modals gate destructive/state-changing admin actions (revoke/reactivate).

### Key Lessons
1. Reconcile REQUIREMENTS.md checkboxes at each phase transition, not just at milestone close — the traceability table and the checklist must not diverge.
2. Treat visual/PDF fidelity as inherently human-verified; budget a real-device/browser confirmation pass instead of expecting automated verification to close it.
3. `listRule = null` vs `""` in PocketBase is a security cliff (empty string = public enumeration of DNI data) — security pitfalls should be audited before deploy, as they were here.

### Cost Observations
- Model mix: not tracked this milestone.
- Notable: brownfield project — certificate system layered onto an existing React marketing site without changing the frontend stack.

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 4 | 10 | First GSD milestone — walking-skeleton + vertical-slice cadence established |

### Cumulative Quality

| Milestone | Requirements | Coverage | Deferred at Close |
|-----------|--------------|----------|-------------------|
| v1.0 | 42/42 | 100% | 4 (human-verification) |

### Top Lessons (Verified Across Milestones)

1. Keep REQUIREMENTS.md checkboxes in sync with the traceability table at every transition.
2. Visual/PDF output needs an explicit human-verification pass — automation can confirm the code but not the rendering.
