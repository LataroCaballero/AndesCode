# Feature Landscape: Verifiable Certificate System

**Domain:** Digital credential verification — internship/professional practice certificates
**Researched:** 2026-06-06
**Scope:** AndesCode PPS certificate system — public verification + admin panel, v1

---

## Context

The system has two distinct audiences with different needs:

- **Verifiers / employers** — land on a certificate URL (via QR scan or shared link) and need to confirm authenticity in seconds without creating an account.
- **Admins (AndesCode staff)** — issue, edit, and revoke certificates from a protected panel.

The certificate physical design already exists (ref/assets/certificado.png). The digital system is a verification layer on top of that physical artifact.

---

## Table Stakes

Features verifiers expect. Missing any of these and the system feels unofficial or untrustworthy.

### Public Verification Page (`/certificados/[id]`)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Clear VALID / REVOKED status — large, immediately visible | Verifiers need a yes/no answer in under 3 seconds; ambiguity = distrust | Low | Green banner + checkmark for valid; red banner + X for revoked. No intermediate states in v1. |
| Recipient full name | Core fact being verified — who earned this | Low | Display name exactly as issued |
| Certificate ID (`AC-YYYY-NNN`) | Unique identifier; what the verifier may have been given to check | Low | Show prominently; allows cross-reference with physical certificate |
| Issuing organization name + logo | Confirms this is official; forged certificates never link to issuer's own domain | Low | AndesCode logo hardcoded in v1 |
| Institution logo (FCEFN / UNSJ) | PPS context: the credential has academic grounding | Low | Hardcoded in v1 |
| Issue date | Essential for temporal validity; employers verify when internship occurred | Low | Format: DD/MM/YYYY |
| Practice period (start → end dates) | Specific to PPS: verifier needs to confirm when the internship ran | Low | Shown as date range |
| Practice description / area | What the student actually did — verifier confirms role matches CV claim | Low | Mirrors physical certificate field |
| HTTPS + hosted on issuer's own domain | Trust signal; QR linking to `andescode.com.ar` proves the issuer controls the page | Low | Already handled by site infra |
| Mobile-first layout | QR codes are scanned on phones; page must be usable at 375px width | Low | Tailwind responsive classes |
| No account required to verify | Requiring login drops trust and adds friction; 75% drop-off reported by Accredible | Low | Public route, no auth middleware |

### Certificate Lookup Page (`/certificados`)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Single ID input field | Verifiers who receive a certificate ID (not a URL) need a way to look it up | Low | Input + submit button; redirect to `/certificados/[id]` on success |
| Format hint / example | `AC-YYYY-NNN` format is non-obvious; without guidance verifiers enter invalid IDs | Low | Placeholder or helper text |
| "Certificate not found" error state | Clear feedback when ID doesn't exist; prevents confusion with revoked vs. missing | Low | Distinguish: not found vs. found-but-revoked |
| Case-insensitive / normalized input | Users may type `ac-2025-014` or `AC2025014`; normalize before querying | Low | Client-side normalization before fetch |

### QR → Verification Flow

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| QR encodes full URL (`https://andescode.com.ar/certificados/AC-YYYY-NNN`) | URL QR codes require no app; native camera handles them on iOS and Android | Low | Static URL per certificate; client-side generation via `qrcode.react` |
| Immediate redirect to verification page | Scanning should land directly on the certificate, not a search page | Low | URL-based routing handles this automatically |
| QR downloadable as SVG / PNG by admin | Admin needs to embed QR in the physical certificate document | Low | `qrcode.react` supports SVG export |
| Verification page loads fast on mobile | Slow pages on cellular = verifier bounces; trust collapses | Low | React + Vite bundle is already lean |

### Open Graph / Social Sharing

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| `og:title` with recipient name + certificate type | LinkedIn/WhatsApp previews show a recognizable card when students share their certificate | Low | Dynamic per certificate route |
| `og:description` with issuer + date | Context in the preview card | Low | Static template populated with data |
| `og:image` | Rich preview on social platforms; certificate image or branded graphic | Medium | Can use a static branded fallback image in v1 (no server-side rendering needed) |
| Canonical URL | Prevents duplicate content issues | Low | `<link rel="canonical">` |

### PDF Download

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| "Download certificate" button on verification page | Recipients need to submit the certificate to employers, academic institutions | Medium | Client-side generation via jsPDF or html2canvas |
| PDF design matches physical certificate reference | Certificate must look official; generic layout breaks trust | Medium | Reproduce layout from `ref/assets/certificado.png` |
| PDF includes the QR code | Printed PDF can be re-verified; closes the loop | Low | jsPDF can embed the generated QR SVG |
| Correct filename (`AC-2025-014-certificado.pdf`) | Professional delivery; recipient should not get `download.pdf` | Low | Set via `a` tag download attribute |

### Admin Panel (`/admin`)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Email + password login | Protects issuance from unauthorized access | Low | PocketBase built-in auth |
| Certificate list with search + filter | Admin needs to find any certificate quickly; Credly/Accredible all have this | Low | Search by name, ID, or status |
| Create certificate form | Core operation — issuing a new PPS certificate | Low | Fields mirror physical certificate fields |
| Edit certificate | Typos happen; admin must be able to fix name, dates, description | Low | PocketBase update endpoint |
| Revoke certificate | Critical for fraud prevention; revoked must show prominently on public page | Low | Status field: `active` / `revoked`; soft delete, not hard delete |
| Certificate status indicator in list | Admin needs to see at a glance which are active vs. revoked | Low | Color-coded badge |
| Auto-generate next ID | `AC-YYYY-NNN` auto-increments; prevents gaps and duplicates | Low | Query max NNN for current year + increment |
| QR download from admin panel | Admin workflow: issue certificate → download QR → embed in PDF/document | Low | Same `qrcode.react` component |

---

## Differentiators

Features that make AndesCode's system stand out. Not expected, but valued by students and verifiers.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Visual certificate preview on verification page | Verifier sees the actual certificate design, not just a data table — dramatically increases perceived legitimacy | Medium | Render certificate template in-page using same data; not a PDF, just HTML/CSS layout |
| "Verified by AndesCode" branded header on verification page | Clear, above-the-fold trust badge specific to AndesCode identity — Stripe/Linear minimal aesthetic | Low | Styled hero section at top of verification page |
| Tools / technologies listed on certificate | Specific to AndesCode PPS context; employers see exactly what the student used (React, Node, etc.) | Low | Display as tag list; data already on physical certificate |
| Supervisor / manager name + signature reference | Adds human accountability; verifier can follow up if needed | Low | Text field; no actual digital signature required in v1 |
| Grade / qualification displayed | If institution issues a grade for the PPS, showing it adds academic weight | Low | Optional field; omit if blank |
| Copy certificate URL button | Reduces friction for students sharing their certificate link | Low | `navigator.clipboard.writeText()` |
| Print-optimized stylesheet | Some verifiers print the verification page; a clean print view adds polish | Low | `@media print` CSS |

---

## Anti-Features

Features to explicitly NOT build in v1. Each has a reason and an alternative.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Blockchain / cryptographic signing | Zero marginal trust benefit for an institutional issuer on their own domain; massive complexity; users don't understand or check it | Server-controlled verification page is sufficient — AndesCode controls the domain, so the URL itself is the trust anchor |
| Email verification flow for verifiers | Verifiers won't create accounts; 75% drop-off per Accredible data | Public page, no auth, URL is the credential |
| Certificate expiry / renewal workflow | PPS certificates are permanent records of a past internship; they don't expire | Omit expiry date entirely from v1 data model |
| Batch certificate import (CSV/Excel) | Adds form complexity; AndesCode issues certificates infrequently (dozens/year, not thousands) | Issue one at a time via admin form |
| Email delivery to students | Requires email service setup (SMTP, transactional email); out of scope for v1 infra | Admin manually sends the URL/QR to students |
| Analytics / verification tracking | How many times was certificate X viewed? Useful but a distraction from core value | Defer to v2; PocketBase can add view count later |
| Badge system (Open Badges standard) | Already deferred to v2 per PROJECT.md | Build certificate verification first |
| Multi-organization / multi-logo support | Only UNSJ/FCEFN in v1 per PROJECT.md | Hardcode logos |
| Certificate search by recipient name (public) | Privacy concern — anyone could enumerate all certificates issued to a person | ID-only lookup on public page; name search only in admin panel |
| Revocation reason shown to public | Can expose internal administrative decisions; legal ambiguity | Show "This certificate has been revoked" without reason on public page; reason stored internally for admin view only |
| Two-factor authentication for admin | Over-engineering for a single-admin system; PocketBase email+password is sufficient for v1 | Strong password + HTTPS is the security model |
| Real-time websocket updates in admin | PocketBase supports it but overkill for certificate management (not a live dashboard) | Standard fetch on page load / form submit |
| Server-side PDF rendering | Requires additional infrastructure (Puppeteer, wkhtmltopdf, Lambda); jsPDF client-side is sufficient for v1 | jsPDF + html2canvas client-side |
| i18n / English translation | Per PROJECT.md, site is exclusively in Spanish | Spanish only |
| Audit log UI | Useful but complex; PocketBase logs exist natively in `/_/` admin | Use PocketBase's built-in admin logs if audit is needed |

---

## Feature Dependencies

```
Admin: Create Certificate
  └─ Auto-generate ID (AC-YYYY-NNN)
  └─ QR generation (depends on ID existing)
  └─ QR download (depends on QR generation)

Public: Verification page (/certificados/[id])
  └─ Certificate data fetch from PocketBase
  └─ VALID/REVOKED status display
  └─ PDF download (depends on certificate data loaded)
  └─ Open Graph metadata (depends on certificate data — use SSR or dynamic <head>)

Public: Search page (/certificados)
  └─ ID normalization (client-side)
  └─ Redirect to /certificados/[id]

QR → Verification Flow
  └─ Depends on URL routing working correctly
  └─ Depends on verification page loading without auth
```

**Critical dependency note:** Open Graph metadata (`og:title`, `og:description`) requires the certificate data to be in the HTML `<head>` at request time. React's client-side rendering does NOT satisfy social crawlers (LinkedIn, WhatsApp bots don't execute JavaScript). Options for v1:
- Use a static fallback OG image + generic description (low complexity, acceptable for v1)
- Add SSR/edge function just for OG tags (medium complexity, proper solution)
- Use `react-helmet-async` with a crawler-friendly pre-render (medium complexity)

Recommendation: Use static branded fallback OG image + generic AndesCode description for v1. Proper per-certificate OG is a differentiator to tackle in v2 or a dedicated phase.

---

## MVP Recommendation

Build in this priority order within the milestone:

**Must ship (table stakes, blocking trust):**
1. `/certificados/[id]` — verification page with VALID/REVOKED status and all certificate fields
2. `/certificados` — ID lookup/search page
3. `/admin` — login + certificate list + create + edit + revoke
4. QR generation + download in admin
5. PDF download on verification page

**Should ship (differentiators with low complexity):**
6. Visual certificate preview on verification page (HTML/CSS layout matching physical design)
7. "Copy link" button
8. Tools/technologies tag list

**Defer:**
- Per-certificate Open Graph images (use static fallback)
- Print stylesheet
- Analytics
- Badge system (v2 per PROJECT.md)

---

## Sources

- Accredible: [Digital Certificate Design Best Practices](https://www.accredible.com/blog/what-should-be-included-on-a-digital-certificate), [Verification](https://www.accredible.com/verification)
- Credly: [Verification FAQ](https://support.credly.com/hc/en-us/articles/5079101828891-Credly-FAQ-s), [How Credly Helps Verify Credentials](https://learn.credly.com/blog/heres-how-credly-helps-to-verify-your-credentials-on-the-job)
- Certifier: [QR Code Certificate Guide](https://certifier.io/blog/how-to-create-a-certificate-with-a-qr-code)
- QRMark: [QR Code Certificate Verification](https://qrmark.com/blog/how-qr-code-certificate-verifiaction-works/)
- Sertifier: [Certificate of Completion Verification](https://sertifier.com/blog/certificate-of-completion-template-verifiable/)
- VerifyEd: [Shareable Certificate Guide](https://www.verifyed.io/blog/what-is-shareable-certificate)
- Internshala: [Certificate Verification](https://internshala.com/verify_certificate) — ID + name + date lookup pattern
- OnChainCert: [QR Code Best Practices](https://onchaincert.org/blog/certificate-qr-code-best-practices/)
- jsPDF: [Client-side PDF generation](https://github.com/parallax/jsPDF)
