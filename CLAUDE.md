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
