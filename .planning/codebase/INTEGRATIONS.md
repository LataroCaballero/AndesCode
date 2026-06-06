# External Integrations

**Analysis Date:** 2026-06-06

## APIs & External Services

**Form Submission:**
- Formspree - Form submission service for contact form
  - SDK/Client: Fetch API (browser native)
  - Endpoint: `https://formspree.io/f/xldnyqdq`
  - Implementation: Direct fetch POST in `src/sections/ContactForm.tsx` (lines 27-33)
  - Data collected: name, email, projectName, budget, urgency, message
  - No authentication required (form token in URL)

**Communication:**
- WhatsApp Business API - Referenced in privacy policy as a communication channel
  - Status: Mentioned in `src/sections/PoliticaPrivacidad.tsx` as a service the company uses
  - Direct link: `https://wa.me/5492644432919` in `src/components/Footer.tsx` and `src/sections/ContactForm.tsx`
  - Not directly integrated in code (external link only)

**Portfolio References:**
- Service descriptions mention these technologies (portfolio/capability indicators, not integrated):
  - OpenAI API - Listed as capability in `src/sections/TrabajosHero.tsx`
  - WhatsApp Business API - Listed as capability

## Data Storage

**Databases:**
- None configured
- No ORM or database client in dependencies
- Data comes only from Formspree for contact form submissions

**File Storage:**
- Static assets only (local filesystem)
- Images in `src/assets/` directory:
  - Projects: `src/assets/projects/` (logos, previews, videos)
  - Services: `src/assets/servicios/` (service cards)
  - General: `src/assets/` (SVG illustrations from Undraw)
- Public assets in `public/` directory (logo.png)

**Caching:**
- Browser localStorage - Theme preference persistence
  - Key: `theme`
  - Usage: Dark/light mode toggle in `index.html` (lines 12-16)
  - No API caching layer

## Authentication & Identity

**Auth Provider:**
- None configured
- No authentication required for site functionality
- Public marketing website

## Monitoring & Observability

**Error Tracking:**
- None detected
- No error reporting service integrated

**Logs:**
- Browser console only
- No server-side logging

**Analytics:**
- None detected
- No Google Analytics, Mixpanel, or similar tracking

## CI/CD & Deployment

**Hosting:**
- Not configured in codebase (deployment target unknown)
- Build output to `dist/` folder for static deployment

**CI Pipeline:**
- None configured in repository
- No `.github/workflows/`, `.gitlab-ci.yml`, or similar

## Environment Configuration

**Required env vars:**
- None - This is a static SPA with no backend configuration needed

**Secrets location:**
- No secrets storage configured
- Formspree form ID is public (safe - form tokens are public in Formspree)
- WhatsApp number is public (company phone)

## Webhooks & Callbacks

**Incoming:**
- None configured

**Outgoing:**
- Formspree handles form submission server-side (not visible to this codebase)
- No webhook callbacks implemented

## Theme Management

**System Preference Detection:**
- `window.matchMedia('(prefers-color-scheme: dark)')` in `index.html` and `src/components/ParticlesBackground.tsx`
- Adaptive theme colors for particle effects based on OS dark/light mode

## External Resources (Non-API)

**Google Fonts:**
- Inter - Loaded in `src/style.css` line 1
- Fira Code - Loaded in `src/style.css` line 2
- Both via `https://fonts.googleapis.com/css2` (CDN)

**SVG Assets (Undraw):**
- Business deal illustration: `src/assets/undraw_business-deal_nx2n.svg`
- Engineering team illustration: `src/assets/undraw_engineering-team_13ax.svg`
- Ideas illustration: `src/assets/undraw_ideas_vn7a.svg`
- Source: Undraw.co (open source, no integration needed)

## Social Media

**Links (no integration, external links only):**
- Instagram: `https://www.instagram.com/andescodesj/` in Footer
- WhatsApp: `https://wa.me/5492644432919` in Footer and ContactForm
- Google Maps: `https://maps.app.goo.gl/wMh49AFx2GGWnWvD6` in Footer (San Juan, Argentina location)

---

*Integration audit: 2026-06-06*
