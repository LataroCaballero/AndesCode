# Testing Patterns

**Analysis Date:** 2026-06-06

## Test Framework

**Status:** Not configured

**Current State:**
- No test runner installed (Jest, Vitest, or similar not in `package.json`)
- No test files found in the codebase (no `*.test.*` or `*.spec.*` files)
- No test configuration files (`jest.config.js`, `vitest.config.ts`, etc.)
- TypeScript compiler (`tsc`) serves as the only automated check via `npm run build`

## TypeScript Strict Mode as Validation

Since no runtime tests are configured, the codebase relies on **TypeScript strict mode** for correctness:

**Enabled Compiler Flags (from `tsconfig.json`):**
- `strict: true` — All strict type-checking options enabled
- `noUnusedLocals: true` — Errors on unused variables (prevents dead code)
- `noUnusedParameters: true` — Errors on unused function parameters
- `erasableSyntaxOnly: true` — Only allows syntax that can be cleanly erased (no enum-like constructs)
- `noFallthroughCasesInSwitch: true` — Enforces switch case exhaustiveness
- `noUncheckedSideEffectImports: true` — Warns about imports with side effects

**Build Command:**
```bash
npm run build     # Runs: tsc && vite build
```

The `tsc` step runs type checking before bundling. Any TypeScript errors will block the build.

## Manual Testing Approach

Since automated tests are not configured, the development workflow relies on:

1. **Dev Server:** `npm run dev` — Starts Vite development server with hot module reloading
2. **Type Checking:** `npm run build` — Verifies all TypeScript types are correct
3. **Preview Build:** `npm run preview` — Tests production build locally before deployment
4. **Browser Testing:** Manual testing in development browser; TypeScript strict mode catches type errors at development time

## Code Quality Practices (Implicit)

**Error Boundaries:**
- Functional components wrap features safely (e.g., `TitleManager`, `ScrollToTop` are guard components)
- Try-catch blocks in async operations (e.g., `ContactForm.tsx` fetch handler)
- Optional chaining (`?.`) used to safely access DOM elements (e.g., `document.getElementById('ia')?.scrollIntoView()`)

**Type Safety:**
- All component props are explicitly typed (e.g., `TitleManagerProps`, `WelcomeModalProps`)
- Event handlers use React type definitions (e.g., `React.FormEvent`, `React.MouseEvent`)
- Context values typed with interfaces (e.g., `ThemeContextValue`)

**Defensive Patterns:**
- Null checks before DOM access: `if (!el) return;` in `MouseParallaxCard.tsx`
- Reference checks in effects: `if (!interactiveRef.current) return` in `BackgroundGradientAnimation.tsx`
- Cleanup functions in useEffect: `return () => clearTimeout(timer);` in `ContactForm.tsx`

## Testing Patterns (Observations from Existing Code)

### Component State Testing (Manual)

**Pattern from `ContactForm.tsx`:**
```typescript
const [success, setSuccess] = useState(false);
const [error, setError] = useState(false);

useEffect(() => {
    if (success) {
        const timer = setTimeout(() => setSuccess(false), 4000);
        return () => clearTimeout(timer);
    }
}, [success]);
```

To manually verify this would work:
1. Submit a valid form → `success` state should become `true`
2. Observe notification appears for 4 seconds
3. Notification should disappear automatically via timeout cleanup

### Async Operation Testing (Manual)

**Pattern from `ContactForm.tsx`:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

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
};
```

Manual test scenarios:
1. Fill form fields completely → Submit → `response.ok` true → success notification
2. Fill form fields → Network failure → catch block → error notification
3. Submit → Server returns non-200 → error state set → error notification
4. After success, form should be cleared via `form.reset()`

### Event Handler Testing (Manual)

**Pattern from `Header.tsx` (mobile menu toggle):**
```typescript
const [open, setOpen] = useState(false);

return (
    <button onClick={() => setOpen(!open)}>
        {open ? <FiX /> : <FiMenu />}
    </button>
);
```

Manual test:
1. Click hamburger button → `open` becomes true → navigation visible
2. Click "X" button → `open` becomes false → navigation hidden
3. Click on any navigation link → `onClick={() => setOpen(false)}` closes menu

### Side Effect Testing (Manual)

**Pattern from `TitleManager.tsx`:**
```typescript
const location = useLocation();

useEffect(() => {
    document.title = routeTitles[location.pathname] ?? DEFAULT_TITLE;
}, [location.pathname]);
```

Manual test:
1. Navigate to `/servicios` → Check browser tab title → Should read "Servicios"
2. Navigate to `/contacto` → Check browser tab title → Should read "Contacto"
3. Navigate to unknown route → Should fallback to `DEFAULT_TITLE` ("AndesCode")

### Context Testing (Manual)

**Pattern from `ThemeContext.tsx`:**
```typescript
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

Manual test:
1. On first load → Should detect system preference via `window.matchMedia`
2. On subsequent loads → Should restore saved theme from localStorage
3. Toggle theme → localStorage should update
4. Document class should add/remove `dark` class based on theme

## Test Coverage Gaps

**Untested Areas (No Automated Tests):**
- Form submission with actual API calls (`ContactForm.tsx`)
- Navigation routing and page transitions
- Theme persistence across page reloads
- Particle animation rendering (`ParticlesBackground.tsx`)
- Mouse parallax effects (`MouseParallexCard.tsx`)
- Mobile menu responsiveness and touch interactions
- Browser API interactions (localStorage, localStorage, matchMedia)
- Third-party library integration (framer-motion, tsparticles, react-router-dom)

**Risk Areas:**
- Form validation is minimal (only HTML5 `required` attributes)
- Network error handling is generic (same error state for all failure types)
- No visual regression testing for animations or gradients
- No accessibility testing for interactive components
- No E2E testing for complete user workflows

## Recommended Testing Approach (Future)

To add testing without changing current setup:

**Option 1: Add Vitest (Minimal)**
```bash
npm install --save-dev vitest @testing-library/react @testing-library/user-event
```
- Create `vitest.config.ts`
- Add test files alongside components (`Component.test.tsx`)
- Run `npm test` for unit tests

**Option 2: Add Playwright (E2E)**
```bash
npm install --save-dev @playwright/test
```
- Create `e2e/` directory with test specs
- Test complete user flows (form submission, navigation, etc.)

**Option 3: Hybrid Approach**
- Use Vitest for component/hook unit tests
- Use Playwright for E2E workflows
- Keep TypeScript strict mode as the first line of defense

---

*Testing analysis: 2026-06-06*
