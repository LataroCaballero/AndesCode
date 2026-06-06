# Coding Conventions

**Analysis Date:** 2026-06-06

## Naming Patterns

**Files:**
- React components: PascalCase with `.tsx` extension (e.g., `Header.tsx`, `WelcomeModal.tsx`)
- Utility/non-component modules: camelCase with `.ts` extension (e.g., `scroll.tsx` - note inconsistency, should be `scroll.ts`)
- Sections (content-heavy components): PascalCase with `.tsx` (e.g., `Hero.tsx`, `ServiciosHero.tsx`, `ContactForm.tsx`)
- Pages (route-level components): camelCase with `.tsx` extension (e.g., `home.tsx`, `servicios.tsx`, `contacto.tsx`)
- Context providers: PascalCase with `.tsx` (e.g., `ThemeContext.tsx`)

**Functions:**
- React functional components: PascalCase (e.g., `export default function Header() {}`, `function Hero() {}`)
- Regular functions: camelCase (e.g., `handleSubmit`, `handleMouseMove`, `handleNavigate`)
- Event handlers: `handle[EventName]` prefix (e.g., `handleSubmit`, `handleMouseLeave`, `handleNavigate`)
- Custom hooks: `use[Name]` prefix (e.g., `useTheme` in `ThemeContext.tsx`)

**Variables:**
- State variables: camelCase (e.g., `const [open, setOpen] = useState(false)`, `const [success, setSuccess] = useState(false)`)
- Component props: camelCase (e.g., `{ onClose }`, `{ children }`)
- Constants (immutable data): camelCase (e.g., `const routeTitles = {...}`, `const techStack = [...]`, `const socialIcons = [...]`)
- DOM refs: camelCase with `Ref` suffix (e.g., `const ref = useRef()`, `const containerRef = useRef()`, `const interactiveRef = useRef()`)
- Inline objects/arrays for rendering: camelCase (e.g., `const servicios = [...]`, `const valores = [...]`)

**Types:**
- Type/Interface names: PascalCase (e.g., `type TitleManagerProps`, `type Theme`, `interface ThemeContextValue`)
- Props types: `[ComponentName]Props` suffix (e.g., `WelcomeModalProps`, `TitleManagerProps`)
- Enum-like objects: camelCase keys (e.g., `routeTitles`, `socialIcons`, `servicios`)

## Code Style

**Formatting:**
- No formal formatter configured (no ESLint or Prettier config files detected)
- Code uses consistent 2-space indentation
- Quotes: Mix of single and double quotes (inconsistency: some files use single `'`, others use double `"`)
- Line length: No strict limit observed, but lines generally stay under 100 characters
- Semicolons: Consistently used at end of statements

**Linting:**
- No ESLint configuration found
- TypeScript strict mode enabled with `noUnusedLocals`, `noUnusedParameters`, and `erasableSyntaxOnly` compiler flags
- All TypeScript files must pass strict type checking before build (verified via `npm run build` which runs `tsc` first)

## Import Organization

**Order:**
1. React and core libraries (e.g., `import React from 'react'`, `import { useState } from 'react'`)
2. Third-party libraries (e.g., `import { Link } from 'react-router-dom'`, `import Typewriter from 'typewriter-effect'`)
3. Local components (relative imports with `../`)
4. Assets (e.g., `import desarrolloweb from '../assets/servicios/desarrolloweb.png'`)
5. Styles (e.g., `import './style.css'`)

**Path Aliases:**
- No path aliases configured in `tsconfig.json` or `vite.config.ts`
- All imports use relative paths: `import Header from "../components/Header"`, `import Hero from "../sections/Hero"`

**Pattern Example from `src/main.tsx`:**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from "./components/scroll.tsx";
import TitleManager from "./components/TitleManager.tsx";

import Home from './pages/home.tsx';
import Servicios from './pages/servicios.tsx';
// ... more pages
import './style.css'
```

## Error Handling

**Patterns:**
- Try-catch blocks with async operations: Used in `ContactForm.tsx` when submitting forms
- Generic error handling: Catch errors and set boolean error state for UI feedback
- No custom error classes or error boundary components detected
- Network errors: Caught in fetch operations, error state triggers red notification toast

**Example from `ContactForm.tsx`:**
```typescript
try {
    const response = await fetch('https://formspree.io/f/xldnyqdq', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
    });
    if (response.ok) {
        setSuccess(true);
        form.reset();
    } else {
        setError(true);
    }
} catch (err) {
    setError(true);
}
```

## Logging

**Framework:** `console` (no structured logging library detected)

**Patterns:**
- No logging detected in production code
- TypeScript `strict` mode enforces catching unused variables, preventing accidental `console` statements from being left in code
- Spanish comments used throughout to document functionality

## Comments

**When to Comment:**
- Section dividers: Used extensively with `/* ─── Section Name ─── */` format (e.g., in `src/style.css` and HTML templates)
- Complex logic explanation: Comments explain non-obvious behavior (e.g., in `ParticlesBackground.tsx`: `// Detecta el modo claro/oscuro del sistema operativo`)
- Component responsibilities: File-level comments explaining purpose (e.g., `// src/components/ScrollToTop.tsx`)
- Inline clarifications: Spanish comments explain the "why" (e.g., in `ContactForm.tsx`: `// Mensaje de éxito`, `// Mensaje de error`)

**JSDoc/TSDoc:**
- Minimal JSDoc usage observed
- Type annotations preferred over JSDoc type comments
- Props types are explicitly typed via TypeScript interfaces/types rather than JSDoc

**Comment Example from `ParticlesBackground.tsx`:**
```typescript
// 1. Detecta el modo claro/oscuro del sistema operativo
useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateColor = () => {
        setParticleColor(mediaQuery.matches ? '#ffffff' : '#191919');
    };
    updateColor(); // Color inicial
    mediaQuery.addEventListener('change', updateColor); // Escucha cambios
    return () => mediaQuery.removeEventListener('change', updateColor);
}, []);
```

## Function Design

**Size:** 
- Small-to-medium: Most components are concise (under 100 lines)
- Larger components decompose into sections with clear responsibilities (e.g., `ContactForm.tsx` ~190 lines handles form rendering + submission)

**Parameters:**
- Destructured props pattern: `export default function Header() {}` for components that don't need props, or `function WelcomeModal({ onClose }: WelcomeModalProps) {}`
- Event handlers typed explicitly: `(e: React.FormEvent)`, `(e: React.MouseEvent)`
- Children prop: `{ children }: { children: React.ReactNode }` for wrapper/layout components

**Return Values:**
- JSX elements for components
- Functions return early on guard clauses (e.g., `if (!el) return;` in `MouseParallaxCard.tsx`)
- Event handlers return void or perform side effects

## Module Design

**Exports:**
- `export default function [ComponentName]() {}` — Default export for all components
- Single component per file (one default export per `.tsx` file)
- Named exports for utilities (e.g., `export const useTheme = () => useContext(ThemeContext)`)
- Type exports: `export type` for prop types used across modules

**Barrel Files:**
- Not used; each page imports directly from component files
- Example: `import Header from "../components/Header"` rather than `import { Header } from "../components"`

## Tailwind CSS & Styling

**Conventions:**
- Inline Tailwind utility classes in JSX (utility-first approach)
- CSS custom properties for design tokens: `var(--color-primary)`, `var(--color-ink)`, etc.
- Custom CSS classes for reusable patterns defined in `src/style.css`:
  - `.btn-primary` — Primary button styling with hover effects
  - `.btn-secondary` — Secondary button styling
  - `.fira-code-[weight]` — Font weight utilities for Fira Code (light, regular, medium, semibold, bold)
  - `.grid-bg` / `.grid-bg-dark` — Grid background patterns
  - `.nav-link` — Navigation link styling with hover states
  - `.fade-in`, `.slide-up` — Animation classes

**Theme Colors (CSS variables):**
```css
--color-primary: #4342FF;        /* Vibrant blue */
--color-ink: #191919;            /* Dark text/backgrounds */
--color-ink-contrast: #2A2A2A;   /* Slightly lighter dark */
--color-accent: #CCFF3E;         /* Bright yellow-green */
--color-warning: #FF6829;        /* Orange for warnings */
```

**Example from `Header.tsx`:**
```typescript
<a href="/" className="logo text-2xl fira-code-bold text-[#191919]">ANDESCODE</a>
<button className="btn-primary fira-code-medium px-5 py-2 rounded-lg text-sm transition">
  Agendá tu consulta gratuita
</button>
```

## React Patterns

**Hooks Usage:**
- `useState` for local component state (e.g., `const [open, setOpen] = useState(false)`)
- `useEffect` for side effects (fetch, event listeners, localStorage, DOM updates)
- `useCallback` for memoizing functions (e.g., in `BackgroundGradientAnimation.tsx`)
- `useMemo` for memoizing values (e.g., in `ParticlesBackground.tsx` for particle options)
- `useRef` for DOM references and persistent values (e.g., `ref.current?.scrollIntoView()`)
- `useContext` with custom hook pattern (e.g., `useTheme()` from `ThemeContext.tsx`)
- `useLocation` from react-router for route detection (e.g., `TitleManager.tsx`)

**Component Patterns:**
- Wrapper/Provider components that render `{children}`: `TitleManager`, `ScrollToTop`, `ThemeProvider`
- Functional stateless components for pure rendering: `GridBackground`, `Footer`
- Functional components with local state for interactivity: `Header` (mobile menu toggle), `WelcomeModal`

**Props Forwarding:**
- Children forwarding: `return <>{children}</>;` (e.g., `TitleManager`, `ScrollToTop`)
- Props spreading: Not observed; props are explicitly destructured

## Data Structures

**Inline Objects/Arrays:**
- Service data arrays: `const servicios = [{ titulo, descripcion, id, img, imgbig }, ...]`
- Route mappings: `const routeTitles: Record<string, string> = { "/" : "AndesCode", ... }`
- Social icons: `const socialIcons = [{ icon, link }, ...]`

**TypeScript Usage:**
- `Record<string, Type>` for key-value mappings (e.g., `routeTitles`)
- Union types for constants (e.g., `type Theme = 'light' | 'dark'`)
- Interface definitions for complex props (e.g., `interface ThemeContextValue`)
- Type inference preferred where obvious (e.g., `const [open, setOpen] = useState(false)` infers `boolean`)

---

*Convention analysis: 2026-06-06*
