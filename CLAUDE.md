# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AndesCode is a marketing/portfolio website for a software development company. The site is in Spanish. It is a single-page-style React app with multiple routes, built with Vite, TypeScript, and Tailwind CSS v4.

## Commands

- **Dev server:** `npm run dev` — starts Vite dev server
- **Build:** `npm run build` — runs `tsc && vite build` (type-checks then bundles)
- **Preview production build:** `npm run preview`
- No test runner or linter is configured.

## Architecture

**Stack:** React 19 + TypeScript + Vite 7 + Tailwind CSS 4 (via `@tailwindcss/vite` plugin) + react-router-dom v7

**Routing:** Defined in `src/main.tsx` using `<BrowserRouter>` with these routes:

- `/` → Home, `/servicios` → Servicios, `/nosotros` → Nosotros, `/trabajos` → Trabajos, `/contacto` → Contacto

**Page structure:** Every page follows the same pattern — `Header` + a hero/content section + `Footer`. Pages live in `src/pages/`, and their main content sections live in `src/sections/`.

**Key directories:**

- `src/pages/` — Route-level page components (thin wrappers: Header + Section + Footer)
- `src/sections/` — Main content sections for each page (Hero, ServiciosHero, NosotrosHero, TrabajosHero, ContactForm, NewService)
- `src/components/` — Shared components (Header, Footer, ParticlesBackground, WelcomeModal, ScrollToTop, TitleManager, MouseParallaxCard)
- `src/assets/` — Static images organized by category (logo, projects, servicios, team)

**Global wrappers (in main.tsx):**

- `ParticlesBackground` — tsparticles animated background rendered behind all content
- `TitleManager` — Updates `document.title` based on current route
- `ScrollToTop` — Scrolls to top on route navigation

## Styling

- Tailwind CSS v4 with PostCSS integration
- Global styles and CSS custom properties in `src/style.css`
- Design tokens (CSS variables): `--color-primary: #4342FF`, `--color-ink: #191919`, `--color-ink-contrast: #2A2A2A`, `--color-accent: #CCFF3E`, `--color-warning: #FF6829`
- Fonts: Inter (body) and Fira Code (display/mono) — loaded from Google Fonts
- Dark/light mode via `prefers-color-scheme` media queries
- Animated mesh gradient background on `body` (different for light/dark)
- Custom font-weight utility classes: `.fira-code-light`, `.fira-code-regular`, `.fira-code-medium`, `.fira-code-semibold`, `.fira-code-bold`

## TypeScript

Strict mode enabled with `noUnusedLocals`, `noUnusedParameters`, and `erasableSyntaxOnly`. Target ESNext, module resolution set to `node`.

<!-- GSD:project-start source:PROJECT.md -->

## Project

**AndesCode — Sistema de Certificados Verificables**

AndesCode es el sitio de marketing y portfolio de una empresa de desarrollo de software. El proyecto agrega un sistema completo de certificados verificables e insignias digitales para los estudiantes que realizan Prácticas Profesionales Situadas (PPS) dentro de la empresa. Cualquier persona puede verificar la autenticidad de un certificado escaneando un QR o ingresando su ID. El administrador puede emitir, editar y revocar certificados desde un panel interno protegido.

**Core Value:** Cualquier persona debe poder verificar la autenticidad de un certificado AndesCode en segundos, sin crear cuenta, sin fricciones.

### Constraints

- **Tech stack:** React + TypeScript + Vite + Tailwind CSS v4 — no cambiar el stack del frontend
- **Backend:** PocketBase en VPS propio — no usar Supabase, Firebase ni servicios externos de BD
- **Universidades:** Solo UNSJ / FCEFN en v1 — logo hardcodeado, no sistema de logos dinámicos
- **Badges:** Fuera del alcance de v1 — no implementar
- **Sin backend propio de Node:** PocketBase es el único servidor; no Express, no API separada
- **PDF:** jsPDF o similar client-side — sin servidor de renderizado

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- TypeScript 5.8.3 - All source code in `src/`
- HTML5 - Entry point and static structure in `index.html`
- CSS3 - Global styles and Tailwind directives in `src/style.css`
- JavaScript (ES modules) - Module format, transpiled from TypeScript

## Runtime

- Node.js (no specific version pinned, uses system default)
- npm (v3 lockfile format detected in `package-lock.json`)
- Lockfile present: Yes

## Frameworks

- React 19.1.0 - Component framework for UI (`src/main.tsx`, `src/pages/`, `src/components/`, `src/sections/`)
- React DOM 19.1.0 - React rendering to DOM
- react-router-dom 7.6.3 - Client-side routing defined in `src/main.tsx`
- Tailwind CSS 4.1.11 - Utility-first CSS framework
- @tailwindcss/postcss 4.1.11 - PostCSS plugin for Tailwind
- @tailwindcss/vite 4.1.11 - Vite integration for Tailwind (in `vite.config.ts`)
- postcss 8.5.6 - CSS transformation tool
- autoprefixer 10.4.21 - Browser prefix auto-insertion
- framer-motion 12.34.3 - React animation library for motion effects
- typewriter-effect 2.22.0 - Typewriter text animation in `src/sections/Hero.tsx`
- @tsparticles/react 3.0.0 - React wrapper for tsparticles
- @tsparticles/slim 3.9.1 - Lightweight particle engine in `src/components/ParticlesBackground.tsx`
- @tsparticles/engine (dependency) - Core particle engine
- react-icons 5.5.0 - Icon library used in `src/components/Footer.tsx` and `src/components/Header.tsx`
- Vite 7.0.0 - Frontend build tool and dev server
- TypeScript 5.8.3 - Type checking and compilation

## Key Dependencies

- react 19.1.0 - Why it matters: Core UI rendering framework, React 19 is latest with improved patterns
- typescript 5.8.3 - Why it matters: Type safety with strict mode enabled (`noUnusedLocals`, `noUnusedParameters`)
- vite 7.0.0 - Why it matters: Fast HMR dev server and production builds
- tailwindcss 4.1.11 - Why it matters: Complete CSS framework via `@tailwindcss/vite` plugin
- @tsparticles/react, @tsparticles/slim - Animated particle background in all pages
- framer-motion 12.34.3 - Interactive animations for components
- react-router-dom 7.6.3 - Multi-page routing

## Configuration

- No environment variables required (verified via grep for `process.env` and `import.meta.env`)
- No `.env` file needed for development
- No secrets management configured
- `tsconfig.json`:
- `vite.config.ts`:
- `tailwind.config.ts`:
- Via `@tailwindcss/postcss` - Implicit configuration, no `postcss.config.js` needed
- autoprefixer 10.4.21 for browser compatibility

## Platform Requirements

- Node.js (version not pinned, infer from system)
- npm 3+ (package-lock.json v3 format)
- Modern browser with ES2022 support
- Static SPA deployment (dist/ folder after build)
- Any web server can serve (no backend required)
- Browser: ES2022+ support required

## Build Commands

- `npm run dev` - Start Vite dev server with HMR
- `npm run build` - TypeScript type-check then Vite bundle (`tsc && vite build`)
- `npm run preview` - Preview production build locally

## Design Tokens (CSS Custom Properties)

- `--color-primary: #4342FF` (brand blue)
- `--color-ink: #191919` (near-black text)
- `--color-ink-contrast: #2A2A2A` (dark mode text)
- `--color-accent: #CCFF3E` (bright yellow-green)
- `--color-warning: #FF6829` (orange for alerts)
- Body: Inter (via Google Fonts)
- Display/Mono: Fira Code (via Google Fonts)

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- React components: PascalCase with `.tsx` extension (e.g., `Header.tsx`, `WelcomeModal.tsx`)
- Utility/non-component modules: camelCase with `.ts` extension (e.g., `scroll.tsx` - note inconsistency, should be `scroll.ts`)
- Sections (content-heavy components): PascalCase with `.tsx` (e.g., `Hero.tsx`, `ServiciosHero.tsx`, `ContactForm.tsx`)
- Pages (route-level components): camelCase with `.tsx` extension (e.g., `home.tsx`, `servicios.tsx`, `contacto.tsx`)
- Context providers: PascalCase with `.tsx` (e.g., `ThemeContext.tsx`)
- React functional components: PascalCase (e.g., `export default function Header() {}`, `function Hero() {}`)
- Regular functions: camelCase (e.g., `handleSubmit`, `handleMouseMove`, `handleNavigate`)
- Event handlers: `handle[EventName]` prefix (e.g., `handleSubmit`, `handleMouseLeave`, `handleNavigate`)
- Custom hooks: `use[Name]` prefix (e.g., `useTheme` in `ThemeContext.tsx`)
- State variables: camelCase (e.g., `const [open, setOpen] = useState(false)`, `const [success, setSuccess] = useState(false)`)
- Component props: camelCase (e.g., `{ onClose }`, `{ children }`)
- Constants (immutable data): camelCase (e.g., `const routeTitles = {...}`, `const techStack = [...]`, `const socialIcons = [...]`)
- DOM refs: camelCase with `Ref` suffix (e.g., `const ref = useRef()`, `const containerRef = useRef()`, `const interactiveRef = useRef()`)
- Inline objects/arrays for rendering: camelCase (e.g., `const servicios = [...]`, `const valores = [...]`)
- Type/Interface names: PascalCase (e.g., `type TitleManagerProps`, `type Theme`, `interface ThemeContextValue`)
- Props types: `[ComponentName]Props` suffix (e.g., `WelcomeModalProps`, `TitleManagerProps`)
- Enum-like objects: camelCase keys (e.g., `routeTitles`, `socialIcons`, `servicios`)

## Code Style

- No formal formatter configured (no ESLint or Prettier config files detected)
- Code uses consistent 2-space indentation
- Quotes: Mix of single and double quotes (inconsistency: some files use single `'`, others use double `"`)
- Line length: No strict limit observed, but lines generally stay under 100 characters
- Semicolons: Consistently used at end of statements
- No ESLint configuration found
- TypeScript strict mode enabled with `noUnusedLocals`, `noUnusedParameters`, and `erasableSyntaxOnly` compiler flags
- All TypeScript files must pass strict type checking before build (verified via `npm run build` which runs `tsc` first)

## Import Organization

- No path aliases configured in `tsconfig.json` or `vite.config.ts`
- All imports use relative paths: `import Header from "../components/Header"`, `import Hero from "../sections/Hero"`

## Error Handling

- Try-catch blocks with async operations: Used in `ContactForm.tsx` when submitting forms
- Generic error handling: Catch errors and set boolean error state for UI feedback
- No custom error classes or error boundary components detected
- Network errors: Caught in fetch operations, error state triggers red notification toast

## Logging

- No logging detected in production code
- TypeScript `strict` mode enforces catching unused variables, preventing accidental `console` statements from being left in code
- Spanish comments used throughout to document functionality

## Comments

- Section dividers: Used extensively with `/* ─── Section Name ─── */` format (e.g., in `src/style.css` and HTML templates)
- Complex logic explanation: Comments explain non-obvious behavior (e.g., in `ParticlesBackground.tsx`: `// Detecta el modo claro/oscuro del sistema operativo`)
- Component responsibilities: File-level comments explaining purpose (e.g., `// src/components/ScrollToTop.tsx`)
- Inline clarifications: Spanish comments explain the "why" (e.g., in `ContactForm.tsx`: `// Mensaje de éxito`, `// Mensaje de error`)
- Minimal JSDoc usage observed
- Type annotations preferred over JSDoc type comments
- Props types are explicitly typed via TypeScript interfaces/types rather than JSDoc

## Function Design

- Small-to-medium: Most components are concise (under 100 lines)
- Larger components decompose into sections with clear responsibilities (e.g., `ContactForm.tsx` ~190 lines handles form rendering + submission)
- Destructured props pattern: `export default function Header() {}` for components that don't need props, or `function WelcomeModal({ onClose }: WelcomeModalProps) {}`
- Event handlers typed explicitly: `(e: React.FormEvent)`, `(e: React.MouseEvent)`
- Children prop: `{ children }: { children: React.ReactNode }` for wrapper/layout components
- JSX elements for components
- Functions return early on guard clauses (e.g., `if (!el) return;` in `MouseParallaxCard.tsx`)
- Event handlers return void or perform side effects

## Module Design

- `export default function [ComponentName]() {}` — Default export for all components
- Single component per file (one default export per `.tsx` file)
- Named exports for utilities (e.g., `export const useTheme = () => useContext(ThemeContext)`)
- Type exports: `export type` for prop types used across modules
- Not used; each page imports directly from component files
- Example: `import Header from "../components/Header"` rather than `import { Header } from "../components"`

## Tailwind CSS & Styling

- Inline Tailwind utility classes in JSX (utility-first approach)
- CSS custom properties for design tokens: `var(--color-primary)`, `var(--color-ink)`, etc.
- Custom CSS classes for reusable patterns defined in `src/style.css`:

## React Patterns

- `useState` for local component state (e.g., `const [open, setOpen] = useState(false)`)
- `useEffect` for side effects (fetch, event listeners, localStorage, DOM updates)
- `useCallback` for memoizing functions (e.g., in `BackgroundGradientAnimation.tsx`)
- `useMemo` for memoizing values (e.g., in `ParticlesBackground.tsx` for particle options)
- `useRef` for DOM references and persistent values (e.g., `ref.current?.scrollIntoView()`)
- `useContext` with custom hook pattern (e.g., `useTheme()` from `ThemeContext.tsx`)
- `useLocation` from react-router for route detection (e.g., `TitleManager.tsx`)
- Wrapper/Provider components that render `{children}`: `TitleManager`, `ScrollToTop`, `ThemeProvider`
- Functional stateless components for pure rendering: `GridBackground`, `Footer`
- Functional components with local state for interactivity: `Header` (mobile menu toggle), `WelcomeModal`
- Children forwarding: `return <>{children}</>;` (e.g., `TitleManager`, `ScrollToTop`)
- Props spreading: Not observed; props are explicitly destructured

## Data Structures

- Service data arrays: `const servicios = [{ titulo, descripcion, id, img, imgbig }, ...]`
- Route mappings: `const routeTitles: Record<string, string> = { "/" : "AndesCode", ... }`
- Social icons: `const socialIcons = [{ icon, link }, ...]`
- `Record<string, Type>` for key-value mappings (e.g., `routeTitles`)
- Union types for constants (e.g., `type Theme = 'light' | 'dark'`)
- Interface definitions for complex props (e.g., `interface ThemeContextValue`)
- Type inference preferred where obvious (e.g., `const [open, setOpen] = useState(false)` infers `boolean`)

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## System Overview

```text

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

- Route-driven architecture with React Router v7
- Consistent page template pattern (Header → Section → Footer)
- Global context for theme management
- Composition-based component structure with minimal nesting
- Tailwind CSS v4 for styling with CSS custom properties for design tokens
- Static site with no backend integration except Formspree for contact forms

## Layers

- Purpose: Bootstrap application, set up routing, apply global wrappers
- Location: `src/main.tsx`
- Contains: BrowserRouter setup, route definitions, global provider nesting
- Depends on: All pages, all wrapper components, React Router
- Used by: Browser entry point only
- Purpose: Thin route-level components that compose header, section, and footer
- Location: `src/pages/`
- Contains: One component per route (home.tsx, servicios.tsx, etc.)
- Depends on: Header, Section components, Footer
- Used by: React Router Routes
- Purpose: Page-specific content components (Hero sections, forms, policy text)
- Location: `src/sections/`
- Contains: Hero sections, ContactForm, policy pages
- Depends on: Shared components, assets, styling
- Used by: Page components
- Purpose: Reusable UI components (Header, Footer, backgrounds, effects)
- Location: `src/components/`
- Contains: Layout components, visual effects, utility wrappers
- Depends on: Styling, assets, React Router (Link/useLocation)
- Used by: Pages, sections, other components
- Purpose: Global state management (theme toggling)
- Location: `src/contexts/`
- Contains: ThemeContext with theme state and toggle function
- Depends on: localStorage, React hooks
- Used by: Components that need theme-aware styling
- Purpose: Design tokens, utility classes, static images
- Location: `src/style.css`, `src/assets/`
- Contains: CSS variables, Tailwind directives, component-specific styles, PNG/SVG images
- Depends on: Tailwind CSS v4, Google Fonts
- Used by: All components

## Data Flow

### Primary Request Path (Page Navigation)

### Form Submission Flow (Contact Form)

### Theme Management Flow

- Theme state: localStorage + React Context (ThemeContext)
- Form state: React local state (success/error flags in ContactForm)
- Navigation state: React Router (pathname tracking in TitleManager and ScrollToTop)
- Particle animation state: Internal tsparticles engine state

## Key Abstractions

- Purpose: Standardize layout structure across all routes
- Examples: `src/pages/home.tsx`, `src/pages/servicios.tsx`, `src/pages/nosotros.tsx`
- Pattern: Functional component with fixed structure `<Header /> <Section /> <Footer />`
- Purpose: Encapsulate page-specific content and interactions
- Examples: `src/sections/Hero.tsx`, `src/sections/ServiciosHero.tsx`, `src/sections/ContactForm.tsx`
- Pattern: Standalone component with all content markup and local state
- Purpose: Maintain single source of truth for page titles
- Examples: `src/components/TitleManager.tsx:4-12`
- Pattern: Record<string, string> object mapping pathname to document.title value
- Purpose: Define reusable service display structure
- Examples: `src/sections/ServiciosHero.tsx:12-35`
- Pattern: Array of objects with titulo, descripcion, cta, img, imgbig properties

## Entry Points

- Location: `src/main.tsx`
- Triggers: Browser loads index.html, executes module script
- Responsibilities: React app initialization, route setup, global wrapper nesting
- Location: `src/pages/home.tsx`
- Triggers: User navigates to `/` or page load at root
- Responsibilities: Renders Header, Hero section, Footer
- Location: `src/pages/servicios.tsx`
- Triggers: User navigates to `/servicios`
- Responsibilities: Renders Header, ServiciosHero section, Footer
- Location: `src/pages/contacto.tsx`
- Triggers: User navigates to `/contacto` or clicks CTA buttons
- Responsibilities: Renders Header, ContactForm section, Footer
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

```typescript

```

### Hardcoded Responsive Classes in Components

```css

```

### Form Validation Without Feedback

```typescript

```

## Error Handling

- Contact form: Success/error toasts displayed for 4 seconds (`src/sections/ContactForm.tsx:48-72`)
- Navigation: Loading spinner shows during route transition (`src/components/scroll.tsx:24-30`)
- Missing routes: Fallback 404 page rendered (`src/main.tsx:30`)
- Particle initialization: Graceful fallback if tsparticles engine fails to load

## Cross-Cutting Concerns

- Form validation: Only server-side (Formspree validates on receipt)
- Route validation: React Router handles unknown routes with 404 fallback

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
