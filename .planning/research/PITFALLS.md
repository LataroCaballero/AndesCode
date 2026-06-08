# Domain Pitfalls: Certificate Verification System

**Domain:** Certificate verification system — PocketBase + React SPA (Vite + TypeScript + Tailwind CSS v4)
**Researched:** 2026-06-06
**Confidence:** HIGH (all critical pitfalls verified against official docs and GitHub issues)

---

## Critical Pitfalls

Mistakes that cause rewrites, security incidents, or data loss.

---

### Pitfall 1: PocketBase Collection Rules — null vs. empty string confusion

**What goes wrong:** PocketBase has three distinct rule states: `null` (locked — superuser only), `""` (empty string — anyone, including unauthenticated), and a non-empty filter expression. Developers routinely leave rules at their default during development (which differs by context) and ship to production without auditing. The `certificates` collection left with empty-string `listRule` and `viewRule` exposes all certificate data to unauthenticated callers. This is not a subtle bug — the PocketBase admin UI labels empty rules as "Everyone" and locked rules as "Admins only", but many developers miss this during initial setup.

**Why it happens:** The PocketBase admin UI is inviting and fast to use, so collections get created through the GUI without careful rule review. Additionally, setting rules to `null` during dev breaks the frontend during testing, so developers flip to empty string to unblock themselves and forget to restore.

**Consequences:** Any person can enumerate all certificates via `GET /api/collections/certificates/records`, harvest student names, DNI numbers, and personal data. For a certificate authority this is a GDPR-class exposure.

**Prevention:**
- `viewRule`: `""` (empty string is fine — public verification is the product's core value)
- `listRule`: `@request.auth.id != ""` — require authentication to list all certificates; public users should only access a single record by ID
- `createRule`, `updateRule`, `deleteRule`: `null` — locked to superuser only; all writes go through admin auth
- Verify in the PocketBase admin UI (Settings > Collections > [collection] > API Rules) before every deployment
- Add a deployment checklist item: "Review all collection rules"

**Warning signs:** API returns 200 with `items: []` instead of 403 when unauthenticated list requests are made (PocketBase returns empty results rather than errors for list rule violations — this can mask the problem during manual testing).

**Phase to address:** Backend setup phase (immediately when creating the `certificates` collection).

---

### Pitfall 2: PocketBase admin panel exposed to the internet

**What goes wrong:** Running PocketBase with `./pocketbase serve` (default binding) or `--http=0.0.0.0:8090` exposes the `/_/` admin interface on a public port. Shodan indexes PocketBase instances by their characteristic response headers, making exposed panels discoverable. The admin panel provides full database access with no rate limiting by default.

**Why it happens:** Developers test on the VPS by hitting `http://vps-ip:8090/_/` directly, find it convenient, and never add the nginx proxy that blocks direct port access.

**Consequences:** Brute-force attacks on admin credentials. Full database access if credentials are weak or leaked. Complete certificate data exposure and falsification capability.

**Prevention:**
- Always run: `./pocketbase serve --http=127.0.0.1:8090` — bind to loopback only
- Route all traffic through nginx reverse proxy
- In nginx, add IP-based restriction for the `/_/` path:
  ```nginx
  location /_/ {
      allow 1.2.3.4;  # admin's IP
      deny all;
      proxy_pass http://127.0.0.1:8090;
  }
  ```
- Enable superuser IP allowlisting in PocketBase settings (v0.38.0+): Settings > Superusers > Allowed IPs

**Warning signs:** Running `curl http://your-vps-ip:8090/_/` returns the PocketBase admin UI HTML from outside the server.

**Phase to address:** Deployment/infrastructure phase. Block port 8090 in the VPS firewall as day one config.

---

### Pitfall 3: PocketBase `VITE_` environment variable exposes the PocketBase URL and invites credential stuffing

**What goes wrong:** The PocketBase backend URL (`VITE_PB_URL`) is necessarily embedded in the React bundle — this is unavoidable and acceptable. The critical mistake is also embedding admin email/password as `VITE_` variables to enable some "admin-like" operation from the frontend. Any `VITE_` variable is publicly visible in the browser bundle; Vite intentionally strips non-`VITE_` variables.

**Why it happens:** Developers want to seed initial data or test admin operations from the React app and take the path of least resistance: `VITE_PB_ADMIN_EMAIL` and `VITE_PB_ADMIN_PASSWORD`.

**Consequences:** Admin credentials visible in the browser DevTools > Sources > env bundle. Any visitor can extract them and gain full database control.

**Prevention:**
- Only `VITE_PB_URL` should exist as a Vite env var; this is safe (it is a public URL)
- Admin auth is done interactively through the `/admin` route using `pb.collection('_superusers').authWithPassword()` — the password is typed by the human, never stored in env vars
- Never put PocketBase credentials in `.env` files that are committed to git

**Warning signs:** `.env` file contains `VITE_PB_ADMIN_EMAIL` or similar.

**Phase to address:** Admin panel phase (auth implementation).

---

### Pitfall 4: PDF generation — font CORS and cross-origin image failure

**What goes wrong:** `@react-pdf/renderer` (the correct choice for this project — it produces true PDF vectors, not a canvas screenshot) fetches fonts and images at PDF generation time via browser `fetch()`. Google Fonts URLs are not CORS-enabled for cross-origin fetches from arbitrary domains; neither are images served from PocketBase without explicit CORS headers. The PDF renders blank text or broken image boxes in production even though the browser page displays correctly.

**Why it happens:** The browser `<img>` and CSS `font-face` tags use different CORS mechanics than `fetch()`. A Google Fonts URL that works in CSS fails as a `fetch()` call. Developers test with localhost (no CORS) and miss the production failure.

**Consequences:** Certificates download as PDFs with missing fonts (fallback Helvetica, no accents for Spanish characters like `ó`, `ñ`) or missing logos. The downloaded certificate does not match the reference design.

**Prevention:**
- Self-host fonts: Download Inter and Fira Code `.ttf` files, place them in `/public/fonts/`, register via `Font.register({ family: 'Inter', src: '/fonts/Inter-Regular.ttf' })`
- Self-host images: Place the AndesCode logo and FCEFN logo in `/public/assets/`; reference as absolute URLs `${window.location.origin}/assets/logo.png` in the PDF `<Image>` component
- For images from PocketBase (e.g., student photo if added in v2), convert to base64 data URI at fetch time before passing to `<Image src={dataUri} />`
- Test PDF generation in a deployed environment (not only localhost) before shipping

**Warning signs:** PDF generation works in `npm run dev` but fails after `npm run build` + deploy; or Spanish characters (`á`, `é`, `ñ`) show as boxes in the downloaded PDF.

**Phase to address:** PDF generation phase.

---

### Pitfall 5: PDF layout — jsPDF/html2canvas pixel-capture approach produces blurry output

**What goes wrong:** The two PDF approaches are fundamentally different: `html2canvas + jsPDF` captures a screenshot of the DOM and embeds it as a raster image; `@react-pdf/renderer` generates true vector PDF with embedded fonts. The html2canvas approach produces blurry output at print resolution (72 DPI captured vs 300 DPI expected for a printed certificate), and text is not selectable/searchable in the resulting PDF.

**Why it happens:** `html2canvas + jsPDF` has more tutorials and lower perceived complexity, so developers reach for it first. The blurriness only becomes apparent when the PDF is opened at zoom or printed.

**Consequences:** Certificate PDFs look unprofessional when printed. Text cannot be copied from the PDF. The QR code embedded as a raster image may not scan reliably from a print.

**Prevention:** Use `@react-pdf/renderer` exclusively. It generates PDFs with:
- Selectable, searchable text (legally important for a certificate)
- Sharp vector rendering at any DPI
- Embeddable fonts with proper glyph support for Spanish characters
- True vector QR codes if generated as SVG paths

If `@react-pdf/renderer`'s layout model (flexbox-only, no CSS Grid, no HTML) is too constraining, the fallback is Puppeteer server-side — but that requires a Node server, which is out of scope for v1.

**Warning signs:** Any code that calls `html2canvas(element)` followed by `jsPDF.addImage()`.

**Phase to address:** PDF generation phase (architectural decision, not fixable after the fact without a rewrite).

---

### Pitfall 6: Certificate ID collision — sequential IDs without atomicity

**What goes wrong:** The `AC-YYYY-NNN` format requires knowing the current highest NNN for a given year to generate the next ID. The naive approach is: (1) query `MAX(id)` where `id LIKE 'AC-2025-%'`, (2) increment, (3) insert. This is a read-modify-write race: two concurrent creates in the admin panel produce the same ID.

**Why it happens:** SQLite is often assumed to be single-writer safe, but PocketBase exposes an HTTP API where concurrent requests can arrive simultaneously. The read-modify-write window is real even with SQLite's serialized writes because the uniqueness check happens in application code, not in the database constraint.

**Consequences:** Two certificates share the same `AC-2025-NNN` ID. One overwrites the other or a unique constraint violation surfaces with no user-friendly recovery path.

**Prevention:**
- Mark the `id` field (the custom `AC-YYYY-NNN` field, stored as a separate `certificate_id` field if PocketBase's internal `id` is kept as UUID) with a **Unique** constraint in the PocketBase collection settings
- Implement ID generation server-side in a PocketBase `pb_hooks` `onRecordCreate` hook that uses SQLite's `BEGIN IMMEDIATE` transaction to lock during the MAX query + insert sequence
- Alternatively, generate the sequential number client-side but let the database unique constraint be the final guard, and handle `400 Unique constraint failed` errors gracefully in the UI with a retry
- For v1 (single admin, low volume), the collision risk is minimal but the unique constraint is still mandatory to prevent accidental duplicates

**Warning signs:** Admin creates two certificates in quick succession and both receive the same number, or the UI shows a generic 400 error without explanation.

**Phase to address:** Backend schema phase (add unique constraint before any data is created).

---

## Moderate Pitfalls

---

### Pitfall 7: PocketBase authStore not persisting across page refresh

**What goes wrong:** After the admin logs in, `pb.authStore.isValid` is true. On page refresh it becomes false, forcing a re-login, because the `LocalAuthStore` (PocketBase's default) saves to `localStorage` but the React app does not call `pb.collection('_superusers').authRefresh()` on mount to rehydrate and validate the stored token.

**Why it happens:** Developers test the login flow in a single session without refreshing the page, so the issue is not caught until the admin complains that "I keep getting logged out."

**Consequences:** Admin must re-login after every page refresh. Token may be technically valid in localStorage but the React state is stale.

**Prevention:**
```typescript
// In the admin route's root component, on mount:
useEffect(() => {
  if (pb.authStore.isValid) {
    pb.collection('_superusers').authRefresh()
      .catch(() => {
        pb.authStore.clear();
        navigate('/admin/login');
      });
  }
}, []);
```
- Wrap protected admin routes in a component that checks `pb.authStore.isValid` before rendering, and redirects to `/admin/login` otherwise
- Do not rely on `pb.authStore.onChange` alone — it does not fire on initial load

**Warning signs:** Admin panel works until the browser tab is refreshed; then it redirects to login.

**Phase to address:** Admin panel / auth phase.

---

### Pitfall 8: nginx proxy missing WebSocket upgrade headers (PocketBase realtime breaks)

**What goes wrong:** PocketBase's realtime API (SSE/WebSocket) requires specific headers in the nginx `proxy_pass` block. A minimal nginx config without these headers causes realtime subscriptions to silently fail — the initial HTTP connection succeeds but the upgrade to WebSocket is dropped by nginx with a 400 or connection timeout.

**Why it happens:** Most nginx tutorials show basic `proxy_pass` without WebSocket upgrade headers. PocketBase's realtime is not used in this project for the public verification page, but the admin panel's live updates and any future use will fail.

**Consequences:** Not critical for this specific project (no realtime features planned for v1), but a footgun for future phases.

**Prevention (mandatory nginx config for PocketBase):**
```nginx
location / {
    proxy_pass http://127.0.0.1:8090;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 3600s;
}
```

**Warning signs:** PocketBase admin UI shows WebSocket errors in DevTools console; realtime list updates in the admin panel do not work.

**Phase to address:** Deployment/infrastructure phase.

---

### Pitfall 9: Open Graph metadata — Vite SPA cannot serve per-page OG tags to crawlers

**What goes wrong:** Social media crawlers (WhatsApp, Twitter/X, LinkedIn, Telegram) fetch the raw HTML of a URL and read `<meta property="og:*">` tags. A Vite SPA serves the same `index.html` to all routes — the OG tags are static and JavaScript-rendered dynamic meta is invisible to crawlers. When someone shares `https://andescode.com.ar/certificados/AC-2025-014` on WhatsApp, the preview shows the generic site title and description, not the student's name and certificate details.

**Why it happens:** This is a structural limitation of SPAs. `react-helmet-async` or similar libraries update `<head>` tags at runtime, which works for search engines that execute JS (Google) but not for social crawlers that do not.

**Consequences:** Sharing a certificate link produces a generic unfriendly preview. The core sharing use case ("share your certificate on LinkedIn") is degraded.

**Prevention options (choose one):**
1. **nginx-level prerender for crawlers**: Use a small nginx `map` block that detects social media crawler user agents (`facebookexternalhit`, `Twitterbot`, `WhatsApp`, etc.) and proxies them to a lightweight Node.js prerender service (or a custom Express endpoint on the same VPS) that fetches certificate data from PocketBase and returns HTML with injected OG tags. The React SPA is served normally to real users.
2. **PocketBase pb_hooks as an OG endpoint**: Add a custom route in PocketBase `pb_hooks` that serves a minimal HTML page with OG tags for crawler user agents at `/certificados/:id`, detected by the nginx proxy before the React SPA handles the request.
3. **Accept the limitation for v1**: Since the site is not SSR and adding SSR (SvelteKit/Next.js) is out of scope, explicitly document this as a known limitation. The verification page still works when opened directly from the QR code or a typed URL.

**Warning signs:** Testing with `curl -A "facebookexternalhit/1.1" https://andescode.com.ar/certificados/AC-2025-001` returns the same generic HTML for all certificate IDs.

**Phase to address:** Public verification phase. Decision required before shipping: accept the limitation or implement the nginx prerender approach. The nginx approach is ~2 hours of work and the right call if LinkedIn sharing matters.

---

### Pitfall 10: QR code — wrong error correction level when logo overlay is added

**What goes wrong:** QR codes at error correction level `L` can recover from 7% data damage. A centered logo overlay obscures 20-30% of the code. This makes the QR code unscannable even though it looks correct visually. `qrcode.react` defaults to level `M` (15% recovery), which is also insufficient with a logo.

**Why it happens:** Developers copy the default `qrcode.react` usage and add a logo over the center of the QR code for brand reasons, without understanding that the logo counts as physical damage to the code.

**Consequences:** Printed certificates with QR codes that cannot be scanned. This breaks the primary verification UX.

**Prevention:**
- For QR codes without a centered logo: level `M` is sufficient
- For QR codes with a logo overlay: use level `H` (30% recovery) — set `level="H"` on `<QRCodeSVG>`
- Use SVG output (`<QRCodeSVG>`) rather than canvas (`<QRCodeCanvas>`) — SVG scales perfectly for print; canvas produces a raster image that can blur when scaled up for print resolution
- Minimum quiet zone: 4 modules of white space around the QR boundary — do not clip this

**Warning signs:** QR code looks fine on screen but fails to scan when printed at certificate size (A4, ~3cm QR area).

**Phase to address:** QR code generation phase (before any print testing).

---

### Pitfall 11: CORS — nginx double-setting CORS headers

**What goes wrong:** PocketBase by default allows all origins (`*`). When nginx is added as a reverse proxy, developers sometimes also add `add_header Access-Control-Allow-Origin *` in the nginx config. The browser receives duplicate `Access-Control-Allow-Origin` headers (one from PocketBase, one from nginx), which causes the browser to reject the response with a CORS error — the opposite of the intended effect.

**Why it happens:** Developers debug a CORS error (often caused by something else, like using `http://` instead of `https://` in the PocketBase SDK init URL), find a Stack Overflow answer suggesting adding CORS headers in nginx, add them, and create a header duplication issue.

**Consequences:** API calls from the React frontend fail with CORS errors in production but work on localhost.

**Prevention:**
- Let PocketBase handle CORS via its `--origins` flag if restriction is needed; do not add CORS headers in nginx
- If the React frontend and PocketBase are on different subdomains (e.g., `andescode.com.ar` vs `api.andescode.com.ar`), start PocketBase with `--origins=https://andescode.com.ar`
- The most common real cause of CORS errors with PocketBase + nginx is the React SDK initialized with `http://` while the server only accepts `https://` — fix the URL first before touching CORS config

**Warning signs:** `Access-Control-Allow-Origin` appears twice in the response headers in DevTools > Network.

**Phase to address:** Deployment/integration phase.

---

## Minor Pitfalls

---

### Pitfall 12: PocketBase backup — no automated backup configured

**What goes wrong:** PocketBase v0.16+ includes a built-in backup UI at Settings > Backups, but it requires manual triggering by default. A VPS failure or accidental data deletion with no recent backup means certificate data is permanently lost.

**Why it happens:** Backup setup is deferred ("I'll do it later") and never happens.

**Prevention:**
- Set up a cron job on the VPS for automated SQLite backups:
  ```bash
  # /etc/cron.daily/pocketbase-backup
  sqlite3 /opt/pocketbase/pb_data/data.db ".backup /backups/pb-$(date +%Y%m%d).db"
  find /backups -name "pb-*.db" -mtime +7 -delete
  ```
- Alternatively use PocketBase's built-in S3-compatible backup to an external bucket (e.g., Cloudflare R2 free tier)
- For databases under 2GB (this project will never exceed this), the built-in backup zip is reliable

**Warning signs:** Settings > Backups shows "No backups found" or last backup is more than 7 days old.

**Phase to address:** Deployment/infrastructure phase (day one, not after launch).

---

### Pitfall 13: PocketBase settings encryption — credentials stored in plaintext

**What goes wrong:** PocketBase stores SMTP configuration (email server credentials) in its database unencrypted by default. If the SQLite file is accessed by an attacker, email credentials are exposed.

**Why it happens:** The `--encryptionEnv` flag is not well-publicized; most tutorials omit it.

**Prevention:**
- Set `PB_ENCRYPTION_KEY` to a random 32-character string in the VPS environment
- Start PocketBase with `--encryptionEnv=PB_ENCRYPTION_KEY`
- Store `PB_ENCRYPTION_KEY` in a secrets manager or at minimum in a non-committed `.env` file on the VPS

**Phase to address:** Deployment/infrastructure phase.

---

### Pitfall 14: PocketBase rate limiting not enabled — verification endpoint open to scraping

**What goes wrong:** Without rate limiting, a script can enumerate all certificate IDs by iterating `AC-2024-001` through `AC-2024-999` and harvesting student data from each response.

**Why it happens:** Rate limiting is off by default; enabling it requires an explicit Settings > Rate Limiting configuration.

**Prevention:**
- Enable the built-in rate limiter (PocketBase v0.23.0+): Settings > Rate Limiting
- Scope rate limits to the `/api/collections/certificates/records/*` path
- The public verification page fetches a single record by ID — legitimate users generate very low traffic; aggressive limiting (e.g., 30 requests/minute per IP) is safe

**Phase to address:** Backend setup phase.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| Backend schema setup | Empty collection rules allow public list of all certificates | Set `listRule` to require auth on day one; add UNIQUE constraint on `certificate_id` |
| PDF generation | Font CORS failures with Google Fonts in `@react-pdf/renderer` | Self-host fonts in `/public/fonts/` before building the PDF component |
| PDF generation | Choosing html2canvas+jsPDF over @react-pdf/renderer | Decide architecture first; html2canvas produces blurry print output |
| QR code | Default error correction level insufficient if logo is overlaid | Set `level="H"`, test by scanning from a printed copy at actual size |
| Admin panel auth | authStore not rehydrating on page refresh | Call `authRefresh()` on mount, handle 401 with redirect |
| Deployment / nginx | Port 8090 exposed on VPS firewall | UFW: `ufw deny 8090`, route all traffic through nginx on 443 |
| Deployment / nginx | Missing WebSocket upgrade headers | Use the full 7-header nginx config block |
| Deployment / nginx | Double CORS headers from nginx + PocketBase | Let PocketBase own CORS; do not add CORS headers in nginx |
| Open Graph sharing | SPA cannot serve dynamic OG tags to crawlers | Decide before shipping: accept limitation or implement nginx-level crawler detection |
| Data safety | No automated backup on VPS | Configure cron backup on deployment day, not post-launch |
| Certificate ID | Concurrent creates produce duplicate IDs | Add UNIQUE constraint on `certificate_id`; handle 400 gracefully in UI |

---

## Sources

- [PocketBase API Rules and Filters — Official Docs](https://pocketbase.io/docs/api-rules-and-filters/)
- [PocketBase Going to Production — Official Docs](https://pocketbase.io/docs/going-to-production/)
- [PocketBase Authentication — Official Docs](https://pocketbase.io/docs/authentication/)
- [PocketBase Self-Hosted: 7 Ways Your Backend Gets Owned — Valtik Studios](https://www.valtikstudios.com/blog/pocketbase-self-hosted-security)
- [authStore doesnt persist on page refresh — PocketBase GitHub Discussion #6103](https://github.com/pocketbase/pocketbase/discussions/6103)
- [Realtime fails when behind nginx proxy — PocketBase GitHub Issue #488](https://github.com/pocketbase/pocketbase/issues/488)
- [CORS Issue / Preflight Request using PocketBase — GitHub Discussion #2136](https://github.com/pocketbase/pocketbase/discussions/2136)
- [Transaction race conditions in pb_hooks — GitHub Discussion #4125](https://github.com/pocketbase/pocketbase/discussions/4125)
- [Fetching image using react-pdf Image causes CORS issue — GitHub Issue #1253](https://github.com/diegomura/react-pdf/issues/1253)
- [Dynamic OG Tags for React SPA on Vercel with Serverless and Vite — VibeIt Blog](https://blog.vibeit.hr/blog/dynamic-og-tags)
- [How to download React component as PDF with High Resolution — html2canvas Issue #3009](https://github.com/niklasvh/html2canvas/issues/3009)
- [What are QR code error correction levels and which should I use — Inventive HQ](https://inventivehq.com/blog/what-are-qr-code-error-correction-levels-and-which-should-i-use)
- [Backup and Restore — pocketbase/pocketbase DeepWiki](https://deepwiki.com/pocketbase/pocketbase/6.3-backup-and-restore)
- [Admin token expiration — GitHub Discussion #1778](https://github.com/pocketbase/pocketbase/discussions/1778)
