# Technology Stack

**Analysis Date:** 2026-06-06

## Languages

**Primary:**
- TypeScript 5.8.3 - All source code in `src/`
- HTML5 - Entry point and static structure in `index.html`
- CSS3 - Global styles and Tailwind directives in `src/style.css`

**Secondary:**
- JavaScript (ES modules) - Module format, transpiled from TypeScript

## Runtime

**Environment:**
- Node.js (no specific version pinned, uses system default)

**Package Manager:**
- npm (v3 lockfile format detected in `package-lock.json`)
- Lockfile present: Yes

## Frameworks

**Core:**
- React 19.1.0 - Component framework for UI (`src/main.tsx`, `src/pages/`, `src/components/`, `src/sections/`)
- React DOM 19.1.0 - React rendering to DOM

**Routing:**
- react-router-dom 7.6.3 - Client-side routing defined in `src/main.tsx`
  - Routes: `/`, `/servicios`, `/nosotros`, `/trabajos`, `/contacto`, `/politica-de-privacidad`, `/eliminacion-de-datos`

**Styling:**
- Tailwind CSS 4.1.11 - Utility-first CSS framework
- @tailwindcss/postcss 4.1.11 - PostCSS plugin for Tailwind
- @tailwindcss/vite 4.1.11 - Vite integration for Tailwind (in `vite.config.ts`)
- postcss 8.5.6 - CSS transformation tool
- autoprefixer 10.4.21 - Browser prefix auto-insertion

**Animation & Motion:**
- framer-motion 12.34.3 - React animation library for motion effects
- typewriter-effect 2.22.0 - Typewriter text animation in `src/sections/Hero.tsx`

**Particles & Visuals:**
- @tsparticles/react 3.0.0 - React wrapper for tsparticles
- @tsparticles/slim 3.9.1 - Lightweight particle engine in `src/components/ParticlesBackground.tsx`
- @tsparticles/engine (dependency) - Core particle engine

**Icons:**
- react-icons 5.5.0 - Icon library used in `src/components/Footer.tsx` and `src/components/Header.tsx`
  - Includes FontAwesome 6 (fa6) and Material Design icons

**Build/Dev:**
- Vite 7.0.0 - Frontend build tool and dev server
- TypeScript 5.8.3 - Type checking and compilation

## Key Dependencies

**Critical:**
- react 19.1.0 - Why it matters: Core UI rendering framework, React 19 is latest with improved patterns
- typescript 5.8.3 - Why it matters: Type safety with strict mode enabled (`noUnusedLocals`, `noUnusedParameters`)
- vite 7.0.0 - Why it matters: Fast HMR dev server and production builds
- tailwindcss 4.1.11 - Why it matters: Complete CSS framework via `@tailwindcss/vite` plugin

**Infrastructure:**
- @tsparticles/react, @tsparticles/slim - Animated particle background in all pages
- framer-motion 12.34.3 - Interactive animations for components
- react-router-dom 7.6.3 - Multi-page routing

## Configuration

**Environment:**
- No environment variables required (verified via grep for `process.env` and `import.meta.env`)
- No `.env` file needed for development
- No secrets management configured

**Build:**
- `tsconfig.json`:
  - Target: ESNext
  - Module: ESNext
  - Strict mode: Enabled
  - JSX: react-jsx automatic runtime
  - `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly` enabled
  
- `vite.config.ts`:
  - Single plugin: `@tailwindcss/vite` (Tailwind CSS integration)
  - No build optimizations or code splitting config

- `tailwind.config.ts`:
  - Dark mode: Media queries via `prefers-color-scheme`
  - Custom colors: primary (#4342FF), ink (#191919), ink-contrast (#2A2A2A), accent (#48FF3E), warning (#FF6829)
  - Custom fonts: Inter (sans) and Fira Code (display)
  - Custom animations: fadeIn, slideUp
  - No plugins

**PostCSS:**
- Via `@tailwindcss/postcss` - Implicit configuration, no `postcss.config.js` needed
- autoprefixer 10.4.21 for browser compatibility

## Platform Requirements

**Development:**
- Node.js (version not pinned, infer from system)
- npm 3+ (package-lock.json v3 format)
- Modern browser with ES2022 support

**Production:**
- Static SPA deployment (dist/ folder after build)
- Any web server can serve (no backend required)
- Browser: ES2022+ support required

## Build Commands

- `npm run dev` - Start Vite dev server with HMR
- `npm run build` - TypeScript type-check then Vite bundle (`tsc && vite build`)
- `npm run preview` - Preview production build locally

## Design Tokens (CSS Custom Properties)

Located in `src/style.css`:
- `--color-primary: #4342FF` (brand blue)
- `--color-ink: #191919` (near-black text)
- `--color-ink-contrast: #2A2A2A` (dark mode text)
- `--color-accent: #CCFF3E` (bright yellow-green)
- `--color-warning: #FF6829` (orange for alerts)

Fonts:
- Body: Inter (via Google Fonts)
- Display/Mono: Fira Code (via Google Fonts)

---

*Stack analysis: 2026-06-06*
