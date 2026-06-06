# Architecture Patterns: PocketBase Integration into AndesCode SPA

**Domain:** React SPA + PocketBase backend integration (certificate verification system)
**Researched:** 2026-06-06
**Overall Confidence:** HIGH — all patterns verified against official PocketBase JS SDK docs, React Router v7 docs, and PocketBase production docs.

---

## System Overview After Integration

```text
                          Browser
┌──────────────────────────────────────────────────────────────────┐
│  React SPA (existing)                                            │
│                                                                  │
│  ┌──────────────────┐   ┌──────────────────┐                    │
│  │  Public Routes   │   │  Admin Routes    │                    │
│  │  /               │   │  /admin/*        │                    │
│  │  /servicios      │   │  (ProtectedRoute │                    │
│  │  /nosotros       │   │   guard)         │                    │
│  │  /trabajos       │   └────────┬─────────┘                    │
│  │  /contacto       │            │                              │
│  │  /certificados   │            │                              │
│  │  /certificados/  │            │                              │
│  │  :id             │            │                              │
│  └────────┬─────────┘            │                              │
│           │                      │                              │
│           └──────────┬───────────┘                              │
│                      │                                          │
│           ┌──────────▼───────────┐                              │
│           │    Data Layer        │                              │
│           │  src/lib/pb.ts       │  ← PocketBase singleton      │
│           │  src/hooks/use*.ts   │  ← Custom hooks              │
│           │  src/services/*.ts   │  ← Service functions         │
│           └──────────┬───────────┘                              │
│                      │                                          │
│           ┌──────────▼───────────┐                              │
│           │  AuthContext         │                              │
│           │  src/contexts/       │  ← Auth state + provider    │
│           │  AuthContext.tsx      │                              │
│           └──────────┬───────────┘                              │
└──────────────────────┼───────────────────────────────────────────┘
                       │  HTTPS / REST + WebSocket
                       │
┌──────────────────────▼───────────────────────────────────────────┐
│  VPS                                                             │
│                                                                  │
│  ┌─────────────┐    ┌───────────────────────────────────────┐   │
│  │   Nginx     │    │  PocketBase (127.0.0.1:8090)          │   │
│  │  :443       ├───►│                                       │   │
│  │  (SSL/TLS)  │    │  collections:                         │   │
│  └─────────────┘    │  - _superusers (admin auth)           │   │
│                     │  - certificates (public read)          │   │
│                     │                                        │   │
│                     │  Admin UI: yourdomain.com/_/          │   │
│                     └───────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `src/lib/pb.ts` | PocketBase client singleton — single module-level export | Imported by hooks and services |
| `src/contexts/AuthContext.tsx` | Auth state (token + record), login/logout methods, onChange sync | Wraps all routes in main.tsx; consumed by ProtectedRoute and admin pages |
| `src/components/ProtectedRoute.tsx` | Route guard — redirects to /admin/login when not authenticated | Reads AuthContext; wraps admin route tree in main.tsx |
| `src/hooks/useCertificate.ts` | Fetch single certificate by certificateCode (public) | Calls pb singleton directly |
| `src/hooks/useCertificates.ts` | Paginated list + search for admin panel | Calls pb singleton directly |
| `src/services/certificates.ts` | CRUD mutations (create, update, revoke) for admin | Calls pb singleton directly |
| `src/pages/certificados/` | Public verification pages | useCertificate hook |
| `src/pages/admin/` | Admin panel — list, create, edit, view certificate | useCertificates hook + certificates service |

### Boundary Rules

- **Only `src/lib/pb.ts` imports `pocketbase`.** Nothing else touches the PocketBase constructor.
- **Hooks read data. Services mutate data.** Hooks use `getOne`, `getList`, `getFirstListItem`. Services use `create`, `update`, `delete`.
- **AuthContext is the sole owner of auth state.** No component reads `pb.authStore` directly — they use `useAuth()`.
- **Public routes never require auth.** Certificate verification (`/certificados/:id`) calls the API with no token and works because the `certificates` collection list/view rules are public.

---

## PocketBase Client Singleton

**Pattern: module-level export** — not React Context, not a store.

```typescript
// src/lib/pb.ts
import PocketBase from 'pocketbase';

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

export default pb;
```

**Why module-level over React Context:**
- The PocketBase SDK handles its own auth persistence via `LocalAuthStore` (uses `localStorage` automatically; survives page refresh; syncs between tabs).
- A React Context holding the `pb` instance adds overhead with no benefit — the singleton is stateless beyond the authStore it already manages.
- Components should receive _auth state_ (via AuthContext), not the _client_ itself. The client is a low-level detail.

**Vite environment variable type safety:**

```typescript
// src/vite-env.d.ts (augment existing file)
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POCKETBASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

```
# .env.local (not committed)
VITE_POCKETBASE_URL=https://api.andescode.com.ar

# .env.example (committed, documents required vars)
VITE_POCKETBASE_URL=https://api.yourdomain.com
```

`VITE_POCKETBASE_URL` is safe to expose in client bundles — it is the public API endpoint, not a secret.

---

## Authentication State in React

**Pattern: AuthContext with `pb.authStore.onChange` subscription.**

The PocketBase `authStore` is the source of truth. React state mirrors it. The `onChange` callback keeps them in sync when the token expires or is cleared from another tab.

```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '../lib/pb';
import type { RecordModel } from 'pocketbase';

interface AuthContextType {
  record: RecordModel | null;
  token: string;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [record, setRecord] = useState<RecordModel | null>(pb.authStore.record);
  const [token, setToken] = useState<string>(pb.authStore.token);

  useEffect(() => {
    // Fires on every authStore change (login, logout, token refresh, tab sync)
    const removeListener = pb.authStore.onChange((newToken, newRecord) => {
      setToken(newToken);
      setRecord(newRecord);
    });
    return () => removeListener();
  }, []);

  const login = async (email: string, password: string) => {
    // Authenticate against the _superusers collection (admin-only)
    await pb.collection('_superusers').authWithPassword(email, password);
    // onChange fires automatically — no manual setState needed here
  };

  const logout = () => {
    pb.authStore.clear();
    // onChange fires automatically
  };

  return (
    <AuthContext.Provider value={{
      record,
      token,
      isAuthenticated: pb.authStore.isValid,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
```

**Why `_superusers` collection for admin auth:**
- The admin panel is a single-operator tool. Superusers bypass all collection API rules — no additional rule configuration required.
- The PocketBase admin UI (`/_/`) uses the same `_superusers` credentials, keeping the credential set unified.
- For v1 (one admin), this is the simplest correct pattern. If multi-user admin is needed later, create a separate `admins` auth collection instead.

**Session persistence:** `LocalAuthStore` (the default) persists token to `localStorage`. On page load, `pb.authStore.isValid` reflects the stored token — no loading state needed for the initial render. If the token is expired, the first API call will return 401 and the app can call `pb.authStore.clear()`.

---

## Route Protection Pattern

**Pattern: `ProtectedRoute` wrapper component using `Outlet`.**

React Router v7 in library mode (this project uses `BrowserRouter`, not the framework mode) does not have server-side loaders for client-rendered SPAs. The `ProtectedRoute` component pattern is correct here.

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
```

**Route tree in `main.tsx`:**

```typescript
// src/main.tsx — add to existing route definitions
<Route path="/admin" element={<ProtectedRoute />}>
  <Route index element={<AdminDashboard />} />
  <Route path="nuevo" element={<AdminCertificadoNuevo />} />
  <Route path=":id/editar" element={<AdminCertificadoEditar />} />
</Route>
<Route path="/admin/login" element={<AdminLogin />} />

<Route path="/certificados" element={<CertificadosSearch />} />
<Route path="/certificados/:certificateCode" element={<CertificadoVerificacion />} />
```

**Why `<Outlet />` layout route instead of per-route wrapping:**
- One `ProtectedRoute` guards the entire `/admin/*` subtree. Adding new admin routes requires no additional guard boilerplate.
- `replace` on the `<Navigate>` prevents the login page from being in the browser history stack — back button works correctly after login.

**`AuthProvider` wraps everything in `main.tsx`:**

```typescript
// main.tsx
<BrowserRouter>
  <AuthProvider>
    <TitleManager />
    <ScrollToTop />
    <Routes>
      {/* existing public routes */}
      {/* new certificate + admin routes */}
    </Routes>
  </AuthProvider>
</BrowserRouter>
```

---

## Data Layer Structure

**Pattern: thin custom hooks for reads, service functions for writes.**

### Custom Hooks (Reads)

```typescript
// src/hooks/useCertificate.ts
// Public — no auth required. Called by /certificados/:certificateCode
import { useState, useEffect } from 'react';
import pb from '../lib/pb';
import type { RecordModel } from 'pocketbase';

export function useCertificate(certificateCode: string) {
  const [certificate, setCertificate] = useState<RecordModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!certificateCode) return;
    setLoading(true);
    pb.collection('certificates')
      .getFirstListItem(`certificateCode = "${certificateCode}"`)
      .then(setCertificate)
      .catch(() => setError('Certificado no encontrado'))
      .finally(() => setLoading(false));
  }, [certificateCode]);

  return { certificate, loading, error };
}
```

```typescript
// src/hooks/useCertificates.ts
// Admin — requires auth token (automatically sent by pb singleton)
import { useState, useEffect } from 'react';
import pb from '../lib/pb';
import type { ListResult, RecordModel } from 'pocketbase';

export function useCertificates(page = 1, search = '') {
  const [result, setResult] = useState<ListResult<RecordModel> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const filter = search
      ? `studentName ~ "${search}" || certificateCode ~ "${search}" || dni ~ "${search}"`
      : '';
    pb.collection('certificates')
      .getList(page, 20, { filter, sort: '-issueDate' })
      .then(setResult)
      .finally(() => setLoading(false));
  }, [page, search]);

  return { result, loading };
}
```

### Service Functions (Writes)

```typescript
// src/services/certificates.ts
// All mutations go here. Called by admin form components.
import pb from '../lib/pb';

export interface CertificatePayload {
  certificateCode: string;
  studentName: string;
  dni: string;
  university: string;
  degree: string;
  startDate: string;       // ISO date string
  endDate: string;
  issueDate: string;
  score: number;
  technologies: string[];  // multi-select values
  competencies: string[];  // multi-select values
  description: string;
  status: 'active' | 'revoked';
}

export const createCertificate = (data: CertificatePayload) =>
  pb.collection('certificates').create(data);

export const updateCertificate = (id: string, data: Partial<CertificatePayload>) =>
  pb.collection('certificates').update(id, data);

export const revokeCertificate = (id: string) =>
  pb.collection('certificates').update(id, { status: 'revoked' });

export const deleteCertificate = (id: string) =>
  pb.collection('certificates').delete(id);
```

**Why hooks + services over a single service layer:**
- Hooks co-locate data fetching with components that display it (loading/error state is UI concern).
- Service functions are pure async operations — no React coupling, easily testable.
- Avoids prop-drilling the `pb` client while keeping the SDK calls in one layer.

**Why not TanStack Query for v1:**
- Adds a dependency and mental model for a low-traffic admin tool with simple data needs.
- Manual `useEffect` + `useState` in hooks is sufficient. If caching becomes a pain point, adopt TanStack Query in v2.

---

## PocketBase Collection Schema: `certificates`

**Collection type:** Base (not Auth — certificates are data records, not user accounts).

### Field Definitions

| Field Name | PocketBase Type | Config | Notes |
|------------|-----------------|--------|-------|
| `certificateCode` | Text | Required, unique index | Format: `AC-2025-014`. Natural public identifier. Indexed for fast lookup. |
| `studentName` | Text | Required | Full name of the student |
| `dni` | Text | Required | Argentine national ID number. Text (not number) to preserve leading zeros. |
| `university` | Text | Required | v1: always "UNSJ - FCEFN"; hardcoded in UI but stored for v2 flexibility |
| `degree` | Text | Required | Student's degree/carrera |
| `startDate` | Date | Required | Start of the internship period |
| `endDate` | Date | Required | End of the internship period |
| `issueDate` | Date | Required | Certificate issue date (used for sorting) |
| `score` | Number | Required, min 0, max 10 | Numeric score |
| `technologies` | Select | Multi-select (MaxSelect ≥ 2), predefined options | e.g. "React", "Python", "PostgreSQL". Use Select over JSON for validation. |
| `competencies` | Select | Multi-select (MaxSelect ≥ 2), predefined options | e.g. "Trabajo en equipo", "Comunicación efectiva" |
| `description` | Text | Required, large (Editor field acceptable) | Free-text description of the internship work |
| `status` | Select | Single-select, options: `active` / `revoked`, default `active` | Used to soft-delete without losing history |

**Notes on field type decisions:**

- **`technologies` and `competencies` as Select (multi-select), not JSON:** Select fields enforce values from a predefined list, prevent typos, and make filtering clean (`technologies ?~ "React"`). JSON fields have no validation and make querying harder. Add new options to the select list via the PocketBase admin UI.

- **`dni` as Text, not Number:** Argentine DNIs can have formats with dots or leading patterns that a Number field would corrupt.

- **`status` as Select with `active`/`revoked`, not a Boolean:** Allows future expansion (e.g., `pending`, `expired`) without schema migration.

- **No `id` field to define:** PocketBase auto-generates a 15-character random `id` (the internal primary key). `certificateCode` (`AC-YYYY-NNN`) is the public-facing identifier used in QR URLs. Do not use PocketBase's internal `id` in public URLs.

### API Access Rules

```
List rule:   ""          (empty = anyone can list active certificates)
View rule:   ""          (empty = anyone can view a certificate by id)
Create rule: @request.auth.id != ""   (only authenticated superuser)
Update rule: @request.auth.id != ""   (only authenticated superuser)
Delete rule: @request.auth.id != ""   (only authenticated superuser)
```

**Why public list + view:** The verification page (`/certificados/:certificateCode`) is the core product feature — it must work without any authentication for employers, institutions, or anyone scanning the QR. Locking view to auth would break the product.

**Index to add:** `CREATE UNIQUE INDEX idx_certificates_code ON certificates (certificateCode)` — enables fast `getFirstListItem` by `certificateCode` without full table scans.

---

## Data Flow

### Public Certificate Verification Flow

```
1. User scans QR → browser navigates to /certificados/AC-2025-014
2. React Router matches route → CertificadoVerificacion component renders
3. useCertificate("AC-2025-014") fires useEffect
4. pb.collection('certificates').getFirstListItem('certificateCode = "AC-2025-014"')
   → GET https://api.andescode.com.ar/api/collections/certificates/records?filter=...
   → No auth token sent (public rule allows it)
5. On success: renders certificate card with status badge, QR, PDF download button
6. On 404: renders "Certificado no encontrado" error state
7. qrcode.react generates QR SVG client-side from the current URL
8. jsPDF renders PDF client-side from certificate data
```

### Admin Login Flow

```
1. Admin navigates to /admin → ProtectedRoute checks isAuthenticated
2. isAuthenticated = false → Navigate to /admin/login
3. AdminLogin form submits email + password
4. AuthContext.login() calls pb.collection('_superusers').authWithPassword(...)
   → POST https://api.andescode.com.ar/api/collections/_superusers/auth-with-password
5. PocketBase returns { token, record }
6. pb.authStore.save(token, record) called internally by SDK
7. pb.authStore.onChange fires → AuthContext setRecord + setToken update
8. pb.authStore persists token to localStorage (survives refresh)
9. ProtectedRoute re-evaluates → isAuthenticated = true → renders admin panel
10. Subsequent API calls include Authorization: Bearer <token> header automatically
```

### Admin CRUD Flow

```
1. Admin fills certificate form → submits
2. Component calls createCertificate(payload) from src/services/certificates.ts
3. Service calls pb.collection('certificates').create(payload)
   → POST https://api.andescode.com.ar/api/collections/certificates/records
   → SDK automatically includes Authorization: Bearer <token> from authStore
4. On success: navigate to certificate detail or list
5. On 401: authStore.clear() → ProtectedRoute redirects to login
```

---

## VPS Deployment Architecture

### Service Topology

```
Internet
    │
    ▼
Nginx :443 (SSL via Let's Encrypt)
    │
    ├── /          → serves React SPA static files (dist/)
    ├── /api/*     → proxy_pass http://127.0.0.1:8090
    └── /_/        → proxy_pass http://127.0.0.1:8090 (PocketBase admin UI)
```

**Single domain strategy:** Serve both the React SPA and the PocketBase API from the same domain (`andescode.com.ar`) to avoid CORS configuration entirely. Nginx routes `/api/*` and `/_/*` to PocketBase; everything else serves the React `dist/index.html`.

### Systemd Service

```ini
# /lib/systemd/system/pocketbase.service
[Unit]
Description=PocketBase AndesCode
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
LimitNOFILE=4096
Restart=always
RestartSec=5s
StandardOutput=append:/var/log/pocketbase/std.log
StandardError=append:/var/log/pocketbase/err.log
WorkingDirectory=/opt/pocketbase
ExecStart=/opt/pocketbase/pocketbase serve --http=127.0.0.1:8090

[Install]
WantedBy=multi-user.target
```

```bash
systemctl enable pocketbase
systemctl start pocketbase
```

### Nginx Configuration

```nginx
server {
    listen 443 ssl;
    server_name andescode.com.ar;

    # SSL via certbot / Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/andescode.com.ar/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/andescode.com.ar/privkey.pem;

    # React SPA — serve dist/ and fallback to index.html for client-side routing
    root /var/www/andescode/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # PocketBase API + Admin UI
    location ~ ^/(api|_)/ {
        proxy_pass http://127.0.0.1:8090;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;          # WebSocket support
        proxy_set_header Connection '';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 360s;
        client_max_body_size 10M;                        # file upload limit
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name andescode.com.ar;
    return 301 https://$host$request_uri;
}
```

**Critical:** `Upgrade` and `Connection` headers must be proxied — PocketBase realtime subscriptions use WebSocket. Missing these headers breaks realtime (though this project does not use realtime, it is good practice to not block it).

**`try_files $uri $uri/ /index.html`** is the key directive for React Router — any unknown path (e.g., `/certificados/AC-2025-014`) serves `index.html` and React Router handles the routing client-side.

---

## Suggested Build Order

Dependencies determine order. Each phase unlocks the next.

### Phase 1: Infrastructure Foundation
**Build:** PocketBase on VPS, systemd service, Nginx config, SSL, `certificates` collection schema.

**Rationale:** Every other component depends on a working API endpoint. Define the schema once early — changing field types in PocketBase after data exists requires migration.

Deliverables:
- PocketBase running at `https://api.andescode.com.ar` (or same-domain `/api/`)
- `certificates` collection with correct fields and API rules
- `.env.local` with `VITE_POCKETBASE_URL` set
- `src/lib/pb.ts` singleton created

### Phase 2: Auth Layer
**Build:** `AuthContext`, `ProtectedRoute`, `AdminLogin` page, route tree additions in `main.tsx`.

**Rationale:** The admin panel cannot be built until auth exists. Auth has no dependencies beyond Phase 1.

Deliverables:
- `src/contexts/AuthContext.tsx` with login/logout + onChange sync
- `src/components/ProtectedRoute.tsx`
- `/admin/login` route and page
- Routes for `/admin/*` protected subtree

### Phase 3: Public Verification
**Build:** `useCertificate` hook, `/certificados` search page, `/certificados/:id` verification page.

**Rationale:** This is the core product value. No auth needed — depends only on Phase 1 (API + schema). Can be built in parallel with Phase 2.

Deliverables:
- `src/hooks/useCertificate.ts`
- `src/pages/certificados/CertificadoVerificacion.tsx`
- `src/pages/certificados/CertificadosSearch.tsx`
- Open Graph meta tags on verification page

### Phase 4: Admin CRUD
**Build:** `src/services/certificates.ts`, admin list/create/edit pages, `useCertificates` hook.

**Rationale:** Depends on Phase 1 (schema) and Phase 2 (auth protection). Public verification (Phase 3) can be built in parallel.

Deliverables:
- Admin certificate list with search/pagination
- Create + edit forms with field validation
- Revoke action (sets `status: 'revoked'`)

### Phase 5: QR + PDF Generation
**Build:** QR code display on verification page, PDF download.

**Rationale:** Client-side features. Depend on Phase 3 (verification page structure). `qrcode.react` and `jsPDF` do not require API access.

Deliverables:
- QR rendered with `qrcode.react` on `/certificados/:id`
- PDF generated with `jsPDF` matching reference design
- QR also visible in admin certificate detail view

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Reading `pb.authStore` directly in components
**What goes wrong:** Components couple to the PocketBase SDK internals. If the SDK changes, all components break.
**Instead:** All auth state access goes through `useAuth()`. Components only see `{ isAuthenticated, record, login, logout }`.

### Anti-Pattern 2: Creating multiple PocketBase instances
**What goes wrong:** Each `new PocketBase(url)` has its own `authStore`. Two instances can have conflicting auth state.
**Instead:** Import the singleton from `src/lib/pb.ts` everywhere. The module system guarantees one instance.

### Anti-Pattern 3: Storing the JWT token in React state as the primary source of truth
**What goes wrong:** On refresh, React state is reset. The token must be re-read from `localStorage` — this causes a flash of unauthenticated state and a redirect to login before the token is restored.
**Instead:** `pb.authStore.isValid` reads from `localStorage` synchronously on load. Initialize `AuthContext` state from `pb.authStore` values — they are already hydrated before the first render.

### Anti-Pattern 4: Using PocketBase internal `id` in public QR URLs
**What goes wrong:** Internal IDs (15-char alphanumeric) are meaningless to users and are system implementation details.
**Instead:** QR codes link to `/certificados/AC-2025-014` using `certificateCode`. The internal `id` is only used for PocketBase API calls where a record ID is required (update, delete).

### Anti-Pattern 5: Blocking the verification page behind authentication
**What goes wrong:** The core product value — anyone verifying a certificate — requires no account. Gating this behind login eliminates the product's purpose.
**Instead:** `list` and `view` rules on the `certificates` collection are empty string (public). Only `create`, `update`, `delete` require `@request.auth.id != ""`.

### Anti-Pattern 6: Storing `VITE_POCKETBASE_URL` as a secret
**What goes wrong:** It is not a secret — it is a public API URL already visible in network traffic. Using environment secret managers for it adds complexity with zero security benefit.
**Instead:** Commit `.env.example` with the variable name. Keep `.env.local` in `.gitignore`. The URL itself can be the production URL.

---

## Scalability Considerations

| Concern | For this project (low traffic) | If traffic grows significantly |
|---------|-------------------------------|-------------------------------|
| PocketBase single file | Sufficient — SQLite handles thousands of read-mostly records | Add read replicas or migrate to a proper Postgres backend |
| Client-side PDF | Acceptable for v1 — PDF generation on user's device, zero server cost | Move to server-side rendering (Puppeteer/headless Chrome) if PDF complexity increases |
| Auth state sync across tabs | Automatic via LocalAuthStore (SDK default) | No change needed — localStorage events propagate between tabs |
| QR generation | Client-side with qrcode.react — zero server cost | No change needed at any scale |

---

## Sources

- [PocketBase JS SDK README — authStore, CRUD, realtime](https://github.com/pocketbase/js-sdk/blob/master/README.md) — HIGH confidence
- [PocketBase Going to Production — systemd + nginx config](https://pocketbase.io/docs/going-to-production/) — HIGH confidence
- [PocketBase Collections — field types](https://pocketbase.io/docs/collections/) — HIGH confidence
- [PocketBase Authentication — superusers vs auth collections](https://pocketbase.io/docs/authentication/) — HIGH confidence
- [PocketBase API Rules and Filters](https://pocketbase.io/docs/api-rules-and-filters/) — HIGH confidence
- [React Router v7 — redirect in loader, middleware auth](https://github.com/remix-run/react-router/blob/main/docs/start/framework/navigating.md) — HIGH confidence
- [Robin Wieruch — Protected Routes React Router v7](https://www.robinwieruch.de/react-router-private-routes/) — MEDIUM confidence (community, well-established author)
- [How I'm Using PocketBase with React Context — Scott Scharl](https://scharl.click/how-im-using-pocketbase-with-react-context/) — MEDIUM confidence (community article, patterns verified against official SDK docs)
- [Vite Environment Variables — official docs](https://vite.dev/guide/env-and-mode) — HIGH confidence
