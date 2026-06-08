# Codebase Concerns

**Analysis Date:** 2026-06-06

## Tech Debt

**Modal State Management Complexity:**
- Issue: The `TrabajosHero` component (`src/sections/TrabajosHero.tsx`) manages modal state (open/close) with manual DOM manipulation for body overflow and event listeners. When a project modal opens, it directly sets `document.body.style.overflow = 'hidden'` and adds/removes keyboard event listeners inline.
- Files: `src/sections/TrabajosHero.tsx` (lines 130-141)
- Impact: Modal state logic is tightly coupled to component, making it hard to reuse across pages. Body overflow management is fragile if multiple modals exist. No cleanup guarantee if component unmounts unexpectedly.
- Fix approach: Extract modal logic into a custom hook (`useModalState` or `useBodyLock`) that encapsulates overflow prevention, keyboard handling, and cleanup. Consider using compound component pattern for reusable modals.

**No Testing Infrastructure:**
- Issue: Project has zero test runners configured. No Jest, Vitest, or similar setup. No test files exist anywhere in codebase.
- Files: `package.json` (devDependencies), entire `src/` directory
- Impact: Impossible to safely refactor without manual testing. No regression detection. No CI/CD confidence. Breaking changes go undetected until production.
- Fix approach: Install Vitest (lightweight, Vite-native). Create test configuration. Start with critical paths: form submission in `ContactForm.tsx`, modal interactions in `TrabajosHero.tsx`, routing logic in `src/main.tsx`. Aim for 60%+ coverage of components.

**Hardcoded Contact Information:**
- Issue: Phone number, email, and external links are hardcoded throughout components instead of centralized config.
- Files: `src/components/Footer.tsx` (line 9, 12), `src/sections/ContactForm.tsx` (line 179), multiple inline in buttons
- Impact: Updating contact details requires changes in 5+ places. High risk of inconsistency. No easy way to feature-flag or A/B test contact methods.
- Fix approach: Create `src/config/contact.ts` with centralized contact object. Export as constants. Use throughout codebase.

**Unstructured Project Data:**
- Issue: Projects array in `TrabajosHero.tsx` is inline (416 lines total, 125 lines just for data). Contains no validation, no TypeScript discrimination, and mixed concerns (data + markup).
- Files: `src/sections/TrabajosHero.tsx` (lines 21-125)
- Impact: Hard to manage as projects grow. No version control over project changes. Mixing data structure with presentation layer. No easy way to migrate to backend-driven content.
- Fix approach: Extract to `src/data/projects.ts` with strict TypeScript types. Consider Zod schema for runtime validation. Plan migration path to CMS/API in future.

**No Error Boundary:**
- Issue: No error boundary component exists. If any component throws, entire app crashes without graceful fallback.
- Files: `src/main.tsx`
- Impact: Production bugs become white-screen-of-death for users. No error logging capability. Debugging production issues impossible.
- Fix approach: Create `src/components/ErrorBoundary.tsx` using React.Component with error lifecycle. Wrap entire app in `src/main.tsx`. Log errors to Sentry or similar service.

---

## Known Bugs

**Modal Backdrop Click Closes Modal (Too Aggressive):**
- Symptoms: Clicking anywhere outside the modal content (on the dark backdrop) closes it. UX is abrupt, not matching industry standard (typically only Esc or X button should close).
- Files: `src/sections/TrabajosHero.tsx` (lines 308-310)
- Trigger: Open any project modal, click backdrop area
- Workaround: Use X button or press Escape to close instead of clicking backdrop

**ContactForm Success/Error Timers Race Condition:**
- Symptoms: If user rapidly submits form or network is unstable, success and error timers can overlap, causing both messages to display or flashy UI.
- Files: `src/sections/ContactForm.tsx` (lines 7-19)
- Trigger: Submit form, then before 4s timeout completes, trigger another submit or error state
- Workaround: Wait 4 seconds between submissions for toast to disappear

**ScrollToTop Loader Blocks Interaction:**
- Symptoms: After clicking navigation link, user sees white screen with spinner for 400ms. If link was slow to route, user sees blank page longer. No way to interact.
- Files: `src/components/scroll.tsx` (lines 24-27)
- Trigger: Click any navigation link in Header
- Workaround: None — must wait for spinner to disappear
- Note: This is implemented as feature but UX is blocking; should use progress bar or skeleton instead

**Missing Form Validation Feedback:**
- Symptoms: Form inputs have `required` attribute but no client-side validation feedback. If user tries to submit incomplete form, browser default validation runs (ugly) with no custom styling.
- Files: `src/sections/ContactForm.tsx` (lines 98-165)
- Trigger: Click submit with empty required field
- Workaround: Fill all fields before submitting

---

## Security Considerations

**Formspree Endpoint Exposed:**
- Risk: Form endpoint `https://formspree.io/f/xldnyqdq` is hardcoded in frontend. Attackers can spam your form. No rate limiting. Form ID is public knowledge.
- Files: `src/sections/ContactForm.tsx` (line 27)
- Current mitigation: None
- Recommendations: (1) Move form submission to own backend endpoint that proxies to Formspree and adds rate limiting/CSRF tokens. (2) Consider moving to service like Sendgrid or own email backend. (3) Add honeypot field to catch bots.

**No CSRF Protection:**
- Risk: Form POST is unprotected. Any site can trick users into submitting form.
- Files: `src/sections/ContactForm.tsx`
- Current mitigation: Formspree may have internal protections, unclear from code
- Recommendations: Implement CSRF token in backend. Use SameSite cookies.

**Hardcoded WhatsApp Phone Number:**
- Risk: Phone number is public. Bots can scrape and spam.
- Files: `src/components/Footer.tsx` (line 9), `src/sections/ContactForm.tsx` (line 179)
- Current mitigation: None
- Recommendations: (1) Consider showing phone only to authenticated users (unlikely for marketing site). (2) Obfuscate in HTML source (minimal value). (3) Accept as acceptable marketing risk and monitor for abuse.

**No Content Security Policy (CSP):**
- Risk: Injected scripts (via XSS) can run freely. External font/particle libraries load without CSP headers.
- Files: `public/index.html` (if it exists), Vite config
- Current mitigation: None detected
- Recommendations: Add `<meta http-equiv="Content-Security-Policy">` header restricting script sources. Ensure tsparticles, Google Fonts, and Typewriter Effect are whitelisted.

**Sensitive Data in DOM (Contact Form):**
- Risk: Form values are briefly visible in DOM. If user has malware, data can be intercepted before submission.
- Files: `src/sections/ContactForm.tsx`
- Current mitigation: Uses HTTPS (assumed in production)
- Recommendations: (1) Confirm HTTPS in production. (2) Consider clearing sensitive fields after successful submission. (3) Add client-side input masking for email/phone if collected in future.

---

## Performance Bottlenecks

**Particles Background Renders on Every Page:**
- Problem: `ParticlesBackground` component in `src/components/ParticlesBackground.tsx` initializes tsparticles library globally, even on lightweight pages like privacy policy. Adds ~100KB+ bundle size and CPU load.
- Files: `src/components/ParticlesBackground.tsx`, `src/main.tsx` (line 20)
- Cause: Rendered as global wrapper. No lazy loading. Engine initialization is synchronous until async setup completes.
- Improvement path: (1) Make particles optional per route. (2) Lazy load tsparticles only on Home page. (3) Use React.lazy() + Suspense. (4) Consider alternative: simpler CSS-only animated background for other pages.

**Large Image Assets Not Optimized:**
- Problem: Project images in `src/assets/projects/` are loaded as raw PNG/MP4 files. No lazy loading, compression, or responsive sizes.
- Files: `src/sections/TrabajosHero.tsx` (lines 9-19), multiple image imports
- Cause: Direct imports without any image optimization plugin. No Astro Image component equivalent.
- Improvement path: (1) Add Vite image optimization plugin (`vite-plugin-image-optimization` or `@rollup/plugin-image`). (2) Use `<img loading="lazy">` on all portfolio images. (3) Serve WebP with fallback. (4) Add responsive srcsets.

**Modal Content Not Memoized:**
- Problem: Project modal in `TrabajosHero.tsx` re-renders full content tree (videos, lists, etc.) every time state changes, even if project data unchanged.
- Files: `src/sections/TrabajosHero.tsx` (lines 312-410)
- Cause: Modal markup inline, no memoization, no optimization
- Improvement path: Extract modal to separate component `ProjectModal.tsx`. Memoize with `React.memo()`. Use `useMemo()` for complex lists.

**Typewriter Effect Blocks Render:**
- Problem: Typewriter animation in Hero initializes synchronously and types out long string (54 characters + delays). Takes ~1s to complete, blocking interactivity.
- Files: `src/sections/Hero.tsx` (lines 52-57)
- Cause: Typewriter library is procedural, not optimized for React
- Improvement path: (1) Use CSS animations instead for instant hero (better FCP). (2) If keeping Typewriter, defer initialization with `setTimeout`. (3) Consider Framer Motion for better control.

**No Code Splitting:**
- Problem: All pages bundled together. Single JS bundle loads even if user only visits home page.
- Files: `src/main.tsx`
- Cause: Routes defined inline, no lazy loading
- Improvement path: Use `React.lazy()` on routes. Wrap in Suspense with fallback. Enable route-based code splitting.

---

## Fragile Areas

**ContactForm — No Error State Persistence:**
- Files: `src/sections/ContactForm.tsx`
- Why fragile: Network errors auto-clear after 4s. User has no record of what went wrong. If they refresh page thinking form didn't submit, they see blank form again — no way to recover message.
- Safe modification: (1) Store failed submission data in localStorage before clearing toast. (2) Show persistent error state with retry button. (3) Add link to email us instead if form broken.
- Test coverage: No tests exist. Missing scenarios: network timeout, Formspree API down, malformed response.

**TrabajosHero — 416-Line Mega Component:**
- Files: `src/sections/TrabajosHero.tsx`
- Why fragile: Single large component owns project data, grid layout, featured project logic, and modal dialog. Changes to one feature risk breaking others. No separation of concerns.
- Safe modification: (1) Extract projects data to `src/data/projects.ts`. (2) Create `ProjectCard.tsx` component for grid items. (3) Create `ProjectModal.tsx` for modal. (4) Create `ProjectGrid.tsx` wrapper. (5) Leave TrabajosHero as thin wrapper.
- Test coverage: None. Modal interactions, project filtering, keyboard handling untested.

**Header — Mobile Menu State Leak:**
- Files: `src/components/Header.tsx`
- Why fragile: Mobile menu state (`open`) is local to Header. If navigation is slow, menu can get stuck open. No way to close if link click failed. Closing menu on navigation requires onClick in every nav Link.
- Safe modification: (1) Add useEffect to close menu on pathname change. (2) Extract mobile menu to separate component. (3) Use context or state machine for menu state.
- Test coverage: None. Missing: keyboard nav (Tab/Esc), mobile-desktop resize, focus management.

**ParticlesBackground — Media Query Listener Not Cleaned Up Properly:**
- Files: `src/components/ParticlesBackground.tsx` (lines 13-24)
- Why fragile: Listener is added in useEffect, removed in cleanup. But if multiple instances of ParticlesBackground exist (shouldn't, but possible), listeners stack. Color updates may race.
- Safe modification: (1) Ensure ParticlesBackground is singleton (rendered once in main.tsx only). (2) Consider extracting color detection to custom hook. (3) Use AbortController for cleanup.
- Test coverage: None. Missing: system theme change detection, re-initialization on theme toggle.

**ServiciosHero — Large Unstructured Component:**
- Files: `src/sections/ServiciosHero.tsx` (225 lines)
- Why fragile: Services array is complex nested structure with JSX in values. Adding/removing service requires careful editing. No validation.
- Safe modification: Extract services to data file. Create `ServiceCard.tsx` component. Consider Zod validation.
- Test coverage: None. Missing: service card rendering, link validation, pricing display.

---

## Scaling Limits

**Hardcoded Navigation Routes:**
- Current capacity: Fixed set of 7 routes (Home, Services, About, Projects, Contact, Privacy, Data Deletion)
- Limit: Adding new page requires editing `src/main.tsx` Routes, Header nav, Footer nav, TitleManager cases. No scalable routing config.
- Scaling path: (1) Create `src/config/routes.ts` with route definitions. (2) Generate navigation dynamically. (3) Move TitleManager to use route config instead of hardcoded cases.

**Portfolio Projects Array:**
- Current capacity: 3 projects maximum (CLINICAL, Galeria Estudio, Secretario Virtual)
- Limit: Adding 10+ projects makes `TrabajosHero.tsx` unmaintainable (already 416 lines). No filtering/pagination.
- Scaling path: (1) Migrate to backend API. (2) Add pagination or infinite scroll. (3) Add search/filter by tech stack or category. (4) Consider Sanity or Airtable as CMS.

**Form Submission to Formspree:**
- Current capacity: ~100 submissions/day without hitting rate limits (estimate, Formspree is generous)
- Limit: No spam protection. At scale, form spam could overwhelm inbox or hit Formspree limits.
- Scaling path: (1) Move to own backend with rate limiting (2 req/min per IP). (2) Add CAPTCHA. (3) Use SendGrid or Postmark with queue. (4) Monitor spam rate.

**No Analytics:**
- Current capacity: No visibility into traffic, page performance, or user behavior
- Limit: Can't optimize marketing ROI. Don't know which pages convert. No error tracking.
- Scaling path: (1) Add Google Analytics 4 or Plausible. (2) Add error tracking (Sentry). (3) Add session replay (LogRocket) if budget allows. (4) Create dashboard to monitor conversion funnel.

---

## Dependencies at Risk

**TypeScript `~5.8.3` (Tilde Pin):**
- Risk: Allows minor/patch updates (5.8.x). Could break strict mode if new rules added in 5.8.4+.
- Impact: Type checking might fail unexpectedly after npm update.
- Migration plan: Use caret `^5.8.3` for more flexibility, OR pin exact version `5.8.3` if paranoid. Test tsconfig after each TS upgrade.

**React Router v7 (`^7.6.3`):**
- Risk: Major version. Caret allows breaking changes in future 8.x. If upgraded, route API could change.
- Impact: Navigation might break. TitleManager integration might need rewrite.
- Migration plan: Monitor React Router changelog. Pin to `^7.6.3` and test before upgrading major version. Consider migration guide for v8 early.

**tsparticles Dependency Chain:**
- Risk: tsparticles (@3.0.0) and @tsparticles/slim (@3.9.1) are mismatched versions. Major version difference could cause API drift.
- Impact: Particles might not initialize. Color changes might not propagate.
- Migration plan: Align versions. Test after update. Consider simpler alternative (CSS animation) if tsparticles becomes unmaintained.

**No Lockfile in Git (Likely):**
- Risk: `package-lock.json` should be in .gitignore or git. If missing, team members may install different versions.
- Impact: "Works on my machine" problems. Builds inconsistent across environments.
- Migration plan: Ensure `package-lock.json` is committed. Run `npm ci` in CI/CD instead of `npm install`. Document Node version in `.nvmrc`.

**Tailwind CSS v4 via Vite Plugin (`@tailwindcss/vite`):**
- Risk: New plugin. Less mature than webpack/PostCSS approach. May have edge cases with tree-shaking.
- Impact: Unused styles might not be purged. Build output could be larger than expected.
- Migration plan: Monitor bundle size. Test production builds regularly. Consider PostCSS approach if issues arise.

---

## Missing Critical Features

**No Sitemap or robots.txt:**
- Problem: Search engines have no guidance on crawling. May miss pages or crawl inefficiently.
- Blocks: SEO optimization. Discovery on Google.
- Solution: (1) Generate sitemap.xml dynamically in `public/`. (2) Add `robots.txt` to `public/`. (3) Use `next-sitemap` or similar if migrating to Next.js.

**No Open Graph / Meta Tags for Social Sharing:**
- Problem: When portfolio link shared on LinkedIn/Twitter, no preview image or description. Looks unprofessional.
- Blocks: Social engagement. Click-through rate on shared links.
- Solution: (1) Use Helmet or react-helmet-async for dynamic meta tags. (2) Create `useMeta()` hook. (3) Add OG image to each page.

**No 404 Page:**
- Problem: Visiting `/unknown-route` shows ugly HTML: `<h1>Pagina no encontrada</h1>` with no styling, footer, or nav.
- Blocks: User experience on misclicked links.
- Solution: Create `src/pages/404.tsx` with styled 404 component. Route 404 to it in Routes fallback.

**No Loading States for Images/Videos:**
- Problem: Project images and videos in `TrabajosHero.tsx` have no fallback while loading. Blank space causes layout shift.
- Blocks: Smooth UX on slow networks.
- Solution: (1) Add `loading="lazy"` and `placeholder` to images. (2) Use Skeleton loader from headless UI library. (3) Add blur-up effect.

**No Performance Monitoring:**
- Problem: No visibility into Core Web Vitals (LCP, FID, CLS). Don't know if site is slow.
- Blocks: Optimization efforts. Can't justify performance work to stakeholders.
- Solution: Add web-vitals package. Report to analytics. Set budget in Lighthouse CI.

**No Internationalization (i18n):**
- Problem: Site is Spanish-only. Growth opportunity in English-speaking markets is blocked.
- Blocks: Scaling outside Spanish market.
- Solution: Use `i18next` or `react-i18next`. Create `src/locales/` with translation JSONs. Add language switcher in Footer. Requires major refactor.

---

## Test Coverage Gaps

**Form Submission Logic:**
- What's not tested: `ContactForm.tsx` — (1) Form submits to correct endpoint. (2) Success toast appears/disappears. (3) Error toast appears on network failure. (4) Form resets on success. (5) Required validation works.
- Files: `src/sections/ContactForm.tsx`
- Risk: Form broken in production, users can't contact. Revenue impact if form down even 1 hour.
- Priority: **High** — form is revenue-critical

**Modal Interactions:**
- What's not tested: `TrabajosHero.tsx` — (1) Clicking project opens modal. (2) Clicking X or outside closes modal. (3) Pressing Escape closes modal. (4) Body overflow is restored after close. (5) Video plays in modal.
- Files: `src/sections/TrabajosHero.tsx`
- Risk: Modal broken, users can't see project details. Portfolio appears incomplete.
- Priority: **High** — portfolio is brand representation

**Routing & Navigation:**
- What's not tested: `src/main.tsx` — (1) Routes render correct components. (2) TitleManager updates document.title. (3) ScrollToTop scrolls to top on route change. (4) Header nav links work. (5) Footer nav links work.
- Files: `src/main.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx`
- Risk: Dead links, broken routing in production. Users confused about site structure.
- Priority: **High** — navigation is foundational

**Responsive Design:**
- What's not tested: Mobile/tablet layouts. Header mobile menu, responsive grids, touch interactions.
- Files: All `src/sections/`, `src/components/Header.tsx`
- Risk: Mobile users see broken layouts. ~40-50% of traffic likely mobile.
- Priority: **High** — mobile is significant traffic

**Accessibility (a11y):**
- What's not tested: Keyboard navigation, screen reader compatibility, color contrast, focus management.
- Files: All components
- Risk: Site inaccessible to visually impaired users. Legal exposure under WCAG guidelines.
- Priority: **Medium** — not urgent but important for inclusivity

**Browser Compatibility:**
- What's not tested: Does site work on Safari, Firefox, older Chrome versions?
- Files: All build output
- Risk: Large portion of users see broken site on their browser.
- Priority: **Medium** — impacts user base, not critical to fix immediately

---

*Concerns audit: 2026-06-06*
