<!-- refreshed: 2026-06-06 -->
# Architecture

**Analysis Date:** 2026-06-06

## System Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                      Global Wrappers (Layout)                   │
│  BrowserRouter → TitleManager → ScrollToTop → Routes            │
│        `src/main.tsx`                                            │
└──────────────┬──────────────┬──────────────┬────────────────────┘
               │              │              │
               ▼              ▼              ▼
┌──────────────────────────────────────────────────────────────────┐
│                        Page Layer                                │
│  Home, Servicios, Contacto, Nosotros, Trabajos, etc.            │
│  `src/pages/`                                                    │
│  (Thin wrappers: Header + Section + Footer)                      │
└──────────────┬──────────────┬──────────────┬────────────────────┘
               │              │              │
               ▼              ▼              ▼
        ┌──────────────┬──────────────┬──────────────┐
        │   Header     │   Section    │   Footer     │
        │ `components` │ `sections`   │ `components` │
        └──────────────┴──────────────┴──────────────┘
               │              │              │
               ▼              ▼              ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Shared Components Layer                       │
│  ParticlesBackground, TitleManager, ScrollToTop, WelcomeModal   │
│  Header, Footer, MouseParallaxCard, GridBackground              │
│  `src/components/`, `src/contexts/`                              │
└──────────────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│                      Styling & Assets                            │
│  Tailwind CSS v4, CSS custom properties, static images           │
│  `src/style.css`, `src/assets/`                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Header | Navigation bar with logo, nav links, mobile menu toggle, CTA button | `src/components/Header.tsx` |
| Footer | Social links, footer navigation, policy links, copyright info | `src/components/Footer.tsx` |
| ParticlesBackground | Animated particle background using tsparticles, system theme detection | `src/components/ParticlesBackground.tsx` |
| TitleManager | Updates `document.title` based on current route | `src/components/TitleManager.tsx` |
| ScrollToTop | Scrolls page to top on route navigation, shows loading state | `src/components/scroll.tsx` |
| WelcomeModal | Initial welcome modal component | `src/components/WelcomeModal.tsx` |
| MouseParallaxCard | 3D parallax effect wrapper for card hover interactions | `src/components/MouseParallaxCard.tsx` |
| GridBackground | Grid background pattern utility | `src/components/GridBackground.tsx` |
| BackgroundGradientAnimation | Animated gradient background component | `src/components/BackgroundGradientAnimation.tsx` |
| Hero | Home page main hero section with typewriter effect | `src/sections/Hero.tsx` |
| ServiciosHero | Servicios page content with service cards | `src/sections/ServiciosHero.tsx` |
| NosotrosHero | Nosotros page with company values and mission | `src/sections/NosotrosHero.tsx` |
| TrabajosHero | Trabajos page portfolio/projects section | `src/sections/TrabajosHero.tsx` |
| ContactForm | Contact form with Formspree integration, validation feedback | `src/sections/ContactForm.tsx` |
| NewService | Reusable service display component | `src/sections/NewService.tsx` |
| PoliticaPrivacidad | Privacy policy page content | `src/sections/PoliticaPrivacidad.tsx` |
| EliminacionDatos | Data deletion policy page content | `src/sections/EliminacionDatos.tsx` |
| ThemeContext | React Context for theme state (light/dark mode) | `src/contexts/ThemeContext.tsx` |

## Pattern Overview

**Overall:** Layered Single-Page Application (SPA) with nested route-based pages

**Key Characteristics:**
- Route-driven architecture with React Router v7
- Consistent page template pattern (Header → Section → Footer)
- Global context for theme management
- Composition-based component structure with minimal nesting
- Tailwind CSS v4 for styling with CSS custom properties for design tokens
- Static site with no backend integration except Formspree for contact forms

## Layers

**Routing & App Shell (main.tsx):**
- Purpose: Bootstrap application, set up routing, apply global wrappers
- Location: `src/main.tsx`
- Contains: BrowserRouter setup, route definitions, global provider nesting
- Depends on: All pages, all wrapper components, React Router
- Used by: Browser entry point only

**Page Layer:**
- Purpose: Thin route-level components that compose header, section, and footer
- Location: `src/pages/`
- Contains: One component per route (home.tsx, servicios.tsx, etc.)
- Depends on: Header, Section components, Footer
- Used by: React Router Routes

**Section Layer:**
- Purpose: Page-specific content components (Hero sections, forms, policy text)
- Location: `src/sections/`
- Contains: Hero sections, ContactForm, policy pages
- Depends on: Shared components, assets, styling
- Used by: Page components

**Component Layer:**
- Purpose: Reusable UI components (Header, Footer, backgrounds, effects)
- Location: `src/components/`
- Contains: Layout components, visual effects, utility wrappers
- Depends on: Styling, assets, React Router (Link/useLocation)
- Used by: Pages, sections, other components

**Context Layer:**
- Purpose: Global state management (theme toggling)
- Location: `src/contexts/`
- Contains: ThemeContext with theme state and toggle function
- Depends on: localStorage, React hooks
- Used by: Components that need theme-aware styling

**Styling & Assets:**
- Purpose: Design tokens, utility classes, static images
- Location: `src/style.css`, `src/assets/`
- Contains: CSS variables, Tailwind directives, component-specific styles, PNG/SVG images
- Depends on: Tailwind CSS v4, Google Fonts
- Used by: All components

## Data Flow

### Primary Request Path (Page Navigation)

1. User clicks navigation link or direct URL access (`src/components/Header.tsx:18-21`)
2. React Router matches route to Page component (`src/main.tsx:22-30`)
3. ScrollToTop intercepts navigation, sets loading state, scrolls to top (`src/components/scroll.tsx:9-20`)
4. TitleManager reads route and updates document.title (`src/components/TitleManager.tsx:23-25`)
5. Page component renders: Header → Section → Footer (`src/pages/home.tsx:5-11`)
6. Section renders specific page content (Hero for home, ServiciosHero for /servicios)
7. Components render with Tailwind classes for styling (`src/components/Header.tsx:9-34`)
8. ParticlesBackground animates in background (rendered at root level)

### Form Submission Flow (Contact Form)

1. User fills ContactForm and submits (`src/sections/ContactForm.tsx:21-23`)
2. Form data collected from FormData API (`src/sections/ContactForm.tsx:24`)
3. POST request sent to Formspree endpoint (`src/sections/ContactForm.tsx:27`)
4. On success: form reset, success toast shown for 4 seconds (`src/sections/ContactForm.tsx:35-37`)
5. On error: error toast shown for 4 seconds (`src/sections/ContactForm.tsx:39-42`)

### Theme Management Flow

1. On app load, ThemeContext checks localStorage for saved theme (`src/contexts/ThemeContext.tsx:16-19`)
2. Falls back to system preference (prefers-color-scheme) (`src/contexts/ThemeContext.tsx:19`)
3. Sets theme state and applies dark class to document.documentElement (`src/contexts/ThemeContext.tsx:24-28`)
4. Saves selection to localStorage (`src/contexts/ThemeContext.tsx:29`)
5. CSS custom properties and Tailwind respond to .dark class on root element

**State Management:**
- Theme state: localStorage + React Context (ThemeContext)
- Form state: React local state (success/error flags in ContactForm)
- Navigation state: React Router (pathname tracking in TitleManager and ScrollToTop)
- Particle animation state: Internal tsparticles engine state

## Key Abstractions

**Page Template:**
- Purpose: Standardize layout structure across all routes
- Examples: `src/pages/home.tsx`, `src/pages/servicios.tsx`, `src/pages/nosotros.tsx`
- Pattern: Functional component with fixed structure `<Header /> <Section /> <Footer />`

**Section Pattern:**
- Purpose: Encapsulate page-specific content and interactions
- Examples: `src/sections/Hero.tsx`, `src/sections/ServiciosHero.tsx`, `src/sections/ContactForm.tsx`
- Pattern: Standalone component with all content markup and local state

**Route-Title Mapping:**
- Purpose: Maintain single source of truth for page titles
- Examples: `src/components/TitleManager.tsx:4-12`
- Pattern: Record<string, string> object mapping pathname to document.title value

**Service Card Data:**
- Purpose: Define reusable service display structure
- Examples: `src/sections/ServiciosHero.tsx:12-35`
- Pattern: Array of objects with titulo, descripcion, cta, img, imgbig properties

## Entry Points

**Application Entry:**
- Location: `src/main.tsx`
- Triggers: Browser loads index.html, executes module script
- Responsibilities: React app initialization, route setup, global wrapper nesting

**Home Page:**
- Location: `src/pages/home.tsx`
- Triggers: User navigates to `/` or page load at root
- Responsibilities: Renders Header, Hero section, Footer

**Services Page:**
- Location: `src/pages/servicios.tsx`
- Triggers: User navigates to `/servicios`
- Responsibilities: Renders Header, ServiciosHero section, Footer

**Contact Page:**
- Location: `src/pages/contacto.tsx`
- Triggers: User navigates to `/contacto` or clicks CTA buttons
- Responsibilities: Renders Header, ContactForm section, Footer

**Navigation:**
- Location: `src/components/Header.tsx`
- Triggers: User clicks navigation links
- Responsibilities: Link routing, mobile menu toggle, CTA button

## Architectural Constraints

- **Threading:** Single-threaded event loop (browser JavaScript runtime)
- **Global state:** Theme state in localStorage and React Context (ThemeContext). ParticlesBackground initialization flag stored in local component state.
- **Circular imports:** None detected in current structure
- **Form handling:** Relies on external Formspree service (no backend API)
- **Static routing:** No dynamic route generation; all routes defined statically in main.tsx
- **CSS-in-JS:** Uses Tailwind CSS utility classes exclusively; no inline styles except for ParticlesBackground config object
- **Dark mode:** Implemented via .dark class on document.documentElement, CSS media query, and localStorage persistence

## Anti-Patterns

### Direct String Literals in Route Definitions

**What happens:** Routes defined as string paths repeated across Header navigation, TitleManager mapping, and Router definitions

**Why it's wrong:** Route string changes require updates in multiple places (main.tsx, Header.tsx, TitleManager.tsx), increasing bug surface

**Do this instead:** Define route constants in a single file and import them everywhere:
```typescript
// src/constants/routes.ts
export const ROUTES = {
  HOME: '/',
  SERVICIOS: '/servicios',
  CONTACTO: '/contacto',
  NOSOTROS: '/nosotros',
  TRABAJOS: '/trabajos',
} as const;
```
Then use `ROUTES.HOME` instead of `"/"` in all components.

### Hardcoded Responsive Classes in Components

**What happens:** Tailwind responsive prefixes (md:, lg:, sm:) scattered throughout component markup in Header, Footer, sections

**Why it's wrong:** Makes components harder to maintain and inconsistent breakpoint usage across pages

**Do this instead:** Create Tailwind component classes in `src/style.css` for common responsive patterns:
```css
@layer components {
  .container-responsive {
    @apply px-4 md:px-10 max-w-7xl mx-auto;
  }
  .hero-title {
    @apply text-4xl md:text-5xl lg:text-6xl font-bold;
  }
}
```

### Form Validation Without Feedback

**What happens:** ContactForm submits data without client-side validation; only shows success/error after request completes

**Why it's wrong:** Poor UX; users don't know if required fields are missing until server responds

**Do this instead:** Add client-side validation before fetch:
```typescript
const form = e.target as HTMLFormElement;
const email = (form.email as HTMLInputElement).value;
if (!email.match(emailRegex)) {
  setError(true);
  return;
}
// Then proceed with fetch
```

## Error Handling

**Strategy:** Silent failures with user-facing toast notifications

**Patterns:**
- Contact form: Success/error toasts displayed for 4 seconds (`src/sections/ContactForm.tsx:48-72`)
- Navigation: Loading spinner shows during route transition (`src/components/scroll.tsx:24-30`)
- Missing routes: Fallback 404 page rendered (`src/main.tsx:30`)
- Particle initialization: Graceful fallback if tsparticles engine fails to load

## Cross-Cutting Concerns

**Logging:** None implemented; development relies on browser DevTools console

**Validation:** 
- Form validation: Only server-side (Formspree validates on receipt)
- Route validation: React Router handles unknown routes with 404 fallback

**Authentication:** Not applicable; site is public marketing website

**Internationalization:** Spanish language only; no i18n framework configured

---

*Architecture analysis: 2026-06-06*
