# Phase 3: Admin CRUD - Pattern Map

**Mapped:** 2026-06-08
**Files analyzed:** 7 new/modified files
**Analogs found:** 7 / 7

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/pages/admin/index.tsx` | page (orchestrator) | CRUD + event-driven | `src/pages/admin/index.tsx` (current stub) | exact — same file, replace |
| `src/sections/admin/AdminTopBar.tsx` | component | request-response | `src/pages/admin/login.tsx` (wordmark + Fira Code + btn-secondary logout) | role-match |
| `src/sections/admin/AdminCertificateList.tsx` | section | CRUD + batch | `src/pages/admin/login.tsx` (input pattern, error state, loading) | role-match |
| `src/sections/admin/AdminCertificateDrawer.tsx` | section | event-driven | `src/components/BackgroundGradientAnimation.tsx` (framer-motion import) | partial |
| `src/sections/admin/AdminCertificateForm.tsx` | section | CRUD | `src/pages/admin/login.tsx` (form fields, validation, label pattern) | role-match |
| `src/sections/admin/ConfirmModal.tsx` | component | event-driven | `src/pages/admin/login.tsx` (error state structure, btn-primary/btn-secondary) | role-match |
| `src/components/TagsInput.tsx` | component | event-driven | `src/pages/admin/login.tsx` (input with focus ring + min-h-[44px]) | role-match |

---

## Pattern Assignments

### `src/pages/admin/index.tsx` (page orchestrator, CRUD + event-driven)

**Analog:** `src/pages/admin/index.tsx` (current stub, lines 1–38)

**Imports pattern** (lines 1–8 of current stub):
```typescript
// src/pages/admin/index.tsx
import { useNavigate } from 'react-router-dom';
import { pb } from '../../services/pb';
import { usePocketBase } from '../../contexts/PocketBaseContext';
```

New orchestrator adds state and child sections:
```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pb } from '../../services/pb';
import { usePocketBase } from '../../contexts/PocketBaseContext';
import type { Certificate } from '../../types/certificate';
import type { ListResult } from 'pocketbase';
import AdminTopBar from '../../sections/admin/AdminTopBar';
import AdminCertificateList from '../../sections/admin/AdminCertificateList';
import AdminCertificateDrawer from '../../sections/admin/AdminCertificateDrawer';
import ConfirmModal from '../../sections/admin/ConfirmModal';
```

**Page shell pattern** (lines 19–37 of current stub — keep grid-bg, replace card with full layout):
```tsx
// Current pattern to preserve:
<div className="grid-bg min-h-screen ...">
  {/* AdminGuard in main.tsx wraps this — no auth check needed here */}
</div>
```

New shell (replaces card with full-height layout):
```tsx
export default function AdminPage() {
  const navigate = useNavigate();
  const { record } = usePocketBase();
  // ... state declarations

  return (
    <div className="grid-bg min-h-screen flex flex-col">
      <AdminTopBar record={record} onLogout={handleLogout} />
      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        <AdminCertificateList ... />
      </main>
      <AdminCertificateDrawer ... />
      <ConfirmModal ... />
    </div>
  );
}
```

**Logout pattern** (lines 13–16 of current stub — copy exactly):
```typescript
const handleLogout = () => {
  pb.authStore.clear();
  navigate('/admin/login', { replace: true });
};
```

**Auth record access** (line 25 of current stub):
```tsx
{record?.email ?? pb.authStore.record?.email}
// usePocketBase() returns { pb, isValid, record: RecordModel | null }
// record has .email and .name fields
```

**Drawer scroll lock pattern** (add to AdminPage useEffect):
```typescript
useEffect(() => {
  if (drawerOpen) {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }
}, [drawerOpen]);
```

**Error handling pattern** (from `src/pages/admin/login.tsx` lines 16–28):
```typescript
const [saving, setSaving] = useState(false);
const [saveError, setSaveError] = useState<string | null>(null);

const handleSave = async () => {
  setSaving(true);
  setSaveError(null);
  try {
    await pb.collection('certificates').create(formData);
    onSuccess();
  } catch (err) {
    const pbErr = err as { data?: { certificateCode?: { code?: string } } };
    if (pbErr?.data?.certificateCode?.code === 'validation_not_unique') {
      setSaveError('El código de certificado ya existe. Modificá el código e intentá de nuevo.');
    } else {
      setSaveError('Error al guardar. Intentá de nuevo.');
    }
  } finally {
    setSaving(false);
  }
};
```

---

### `src/sections/admin/AdminTopBar.tsx` (component, request-response)

**Analog:** `src/pages/admin/login.tsx` (lines 43–48 for wordmark/Fira Code pattern; lines 86–108 for button pattern)

**Imports pattern:**
```typescript
// src/sections/admin/AdminTopBar.tsx
import type { RecordModel } from 'pocketbase';
```

**Wordmark pattern** (login.tsx lines 45–48 — copy exactly):
```tsx
<h1 className="fira-code-bold text-xl text-[#191919]">ANDESCODE</h1>
<p className="text-gray-500 text-sm mt-1">Panel de administración</p>
```

**Sticky top bar shell:**
```tsx
interface AdminTopBarProps {
  record: RecordModel | null;
  onLogout: () => void;
}

export default function AdminTopBar({ record, onLogout }: AdminTopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between shadow-sm">
      <span className="fira-code-bold text-lg text-[#191919]">ANDESCODE</span>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">{record?.email}</span>
        <button
          type="button"
          className="btn-secondary min-h-[44px] px-4 rounded-lg text-sm"
          onClick={onLogout}
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
```

**Logout button** (login.tsx line 89 — use btn-secondary for top bar, it's a secondary action):
```tsx
<button
  type="button"
  className="btn-secondary min-h-[44px] px-4 rounded-lg text-sm"
  onClick={onLogout}
>
  Cerrar sesión
</button>
```

---

### `src/sections/admin/AdminCertificateList.tsx` (section, CRUD + batch)

**Analog:** `src/pages/admin/login.tsx` (input/label pattern lines 52–75; error state lines 77–84)

**Imports pattern:**
```typescript
// src/sections/admin/AdminCertificateList.tsx
import { FiEdit2, FiToggleLeft, FiToggleRight, FiPlus } from 'react-icons/fi';
import type { Certificate } from '../../types/certificate';
import type { ListResult } from 'pocketbase';
import CertificateRowQRDownload from './CertificateRowQRDownload'; // or inline
```

**Search input** (login.tsx lines 53–62 — same input class):
```tsx
<input
  type="search"
  value={search}
  onChange={e => onSearchChange(e.target.value)}
  placeholder="Buscar por nombre o código..."
  className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline focus:outline-2 focus:outline-[var(--color-primary)] transition min-h-[44px]"
/>
```

**Status badge pattern:**
```tsx
// active = green, revoked = red
const statusBadge = (status: Certificate['status']) =>
  status === 'active'
    ? <span className="bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-0.5 rounded-full">Activo</span>
    : <span className="bg-red-50 text-red-700 border border-red-200 text-xs px-2 py-0.5 rounded-full">Revocado</span>;
```

**Row action icons** (react-icons fi family — already used in Header/Footer):
```tsx
// Three always-visible action icons per row
<button type="button" onClick={() => onEdit(cert)} className="p-2 min-h-[44px]" title="Editar">
  <FiEdit2 size={16} />
</button>
<button type="button" onClick={() => onToggleStatus(cert)} className="p-2 min-h-[44px]"
  title={cert.status === 'active' ? 'Revocar' : 'Reactivar'}>
  {cert.status === 'active' ? <FiToggleRight size={18} className="text-green-600" /> : <FiToggleLeft size={18} className="text-gray-400" />}
</button>
{/* QR download handled separately — see Pattern 5 in RESEARCH.md */}
```

**Error state** (login.tsx lines 77–84 — copy class names exactly):
```tsx
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
    <FiAlertCircle size={16} className="flex-shrink-0" />
    <span>{error}</span>
  </div>
)}
```

**Loading spinner** (login.tsx lines 93–103 — reuse SVG spinner):
```tsx
{loading && (
  <svg className="animate-spin h-5 w-5 text-[#4342FF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)}
```

**"Nuevo certificado" button** (login.tsx line 89 — use btn-primary):
```tsx
<button
  type="button"
  onClick={onCreateNew}
  className="btn-primary min-h-[44px] px-5 rounded-lg text-sm flex items-center gap-2"
>
  <FiPlus size={16} /> Nuevo certificado
</button>
```

---

### `src/sections/admin/AdminCertificateDrawer.tsx` (section, event-driven)

**Analog:** `src/components/BackgroundGradientAnimation.tsx` line 1 (framer-motion import path)

**Imports pattern** (BackgroundGradientAnimation.tsx line 1 — copy import path exactly):
```typescript
// CRITICAL: import from 'framer-motion', NOT 'motion/react'
import { motion, AnimatePresence } from 'framer-motion';
import type { Certificate } from '../../types/certificate';
import AdminCertificateForm from './AdminCertificateForm';
```

**Drawer shell** (from RESEARCH.md Pattern 3 — verified against framer-motion v12.34.3):
```tsx
interface AdminCertificateDrawerProps {
  open: boolean;
  mode: 'create' | 'edit';
  record: Certificate | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function AdminCertificateDrawer({ open, mode, record, onClose, onSaved }: AdminCertificateDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/30 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            key="drawer"
            className="fixed right-0 top-0 h-full w-full max-w-[600px] bg-white shadow-2xl z-50 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
          >
            <AdminCertificateForm mode={mode} record={record} onClose={onClose} onSaved={onSaved} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

---

### `src/sections/admin/AdminCertificateForm.tsx` (section, CRUD)

**Analog:** `src/pages/admin/login.tsx` (full file, lines 50–109 — form field pattern)

**Imports pattern:**
```typescript
// src/sections/admin/AdminCertificateForm.tsx
import { useState, useEffect } from 'react';
import { FiAlertCircle, FiX } from 'react-icons/fi';
import { pb } from '../../services/pb';
import type { Certificate } from '../../types/certificate';
import TagsInput from '../../components/TagsInput';
```

**Label + input pattern** (login.tsx lines 52–62 — copy exactly for every field):
```tsx
<label className="flex flex-col gap-1.5">
  <span className="text-sm font-medium text-[#191919]">Nombre del estudiante</span>
  <input
    type="text"
    required
    value={form.studentName}
    onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
    className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline focus:outline-2 focus:outline-[var(--color-primary)] transition min-h-[44px]"
  />
</label>
```

**Two-column grid layout for desktop:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* left col: studentName, dni, university, degree, supervisorName, score */}
  {/* right col: certificateCode, startDate, endDate, issueDate */}
  {/* full-width: description, technologies[], competencies[] */}
</div>
```

**certificateCode pre-populated field** (editable input, pre-filled by parent):
```tsx
<label className="flex flex-col gap-1.5">
  <span className="text-sm font-medium text-[#191919]">Código de certificado</span>
  <input
    type="text"
    required
    value={form.certificateCode}
    onChange={e => setForm(f => ({ ...f, certificateCode: e.target.value }))}
    className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm fira-code-regular focus:outline focus:outline-2 focus:outline-[var(--color-primary)] transition min-h-[44px]"
    placeholder="AC-2026-001"
  />
</label>
```

**Submit button with loading state** (login.tsx lines 86–108 — copy pattern):
```tsx
<button
  type="submit"
  disabled={saving}
  className="btn-primary w-full min-h-[44px] flex items-center justify-center gap-2 rounded-lg text-sm"
  style={saving ? { opacity: 0.7 } : undefined}
>
  {saving ? (
    <>
      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Guardando...
    </>
  ) : mode === 'create' ? 'Crear certificado' : 'Guardar cambios'}
</button>
```

**Error display** (login.tsx lines 77–84 — copy class names exactly):
```tsx
{saveError && (
  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
    <FiAlertCircle size={16} className="flex-shrink-0" />
    <span>{saveError}</span>
  </div>
)}
```

**Client-side required field validation before submit:**
```typescript
const requiredFields: (keyof typeof form)[] = [
  'certificateCode', 'studentName', 'dni', 'university',
  'degree', 'startDate', 'endDate', 'issueDate', 'supervisorName',
];

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const missing = requiredFields.filter(f => !form[f]);
  if (missing.length > 0) {
    setSaveError('Completá todos los campos requeridos.');
    return;
  }
  // ... proceed with pb.create() or pb.update()
};
```

---

### `src/sections/admin/ConfirmModal.tsx` (component, event-driven)

**Analog:** `src/pages/admin/login.tsx` (card + btn-primary + btn-secondary pattern)

**Imports pattern:**
```typescript
// src/sections/admin/ConfirmModal.tsx
import type { Certificate } from '../../types/certificate';
```

**Modal shell** (card style from login.tsx lines 43–44 — same shadow, rounded-xl, bg-white):
```tsx
interface ConfirmModalProps {
  open: boolean;
  record: Certificate | null;
  action: 'revoke' | 'reactivate';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ open, record, action, onConfirm, onCancel }: ConfirmModalProps) {
  if (!open || !record) return null;

  const isRevoke = action === 'revoke';

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="fade-in bg-white rounded-xl shadow-[0_4px_24px_rgba(67,66,255,0.10)] p-8 w-full max-w-[400px]">
        <h2 className="fira-code-bold text-lg text-[#191919] mb-2">
          {isRevoke ? 'Revocar certificado' : 'Reactivar certificado'}
        </h2>
        <p className="text-sm text-gray-600 mb-1">
          Estudiante: <span className="font-semibold text-[#191919]">{record.studentName}</span>
        </p>
        <p className="text-sm text-gray-600 mb-6">
          Código: <span className="fira-code-regular text-[#191919]">{record.certificateCode}</span>
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 min-h-[44px] rounded-lg text-sm font-medium text-white ${isRevoke ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isRevoke ? 'Revocar' : 'Reactivar'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1 min-h-[44px] rounded-lg text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### `src/components/TagsInput.tsx` (component, event-driven)

**Analog:** `src/pages/admin/login.tsx` (lines 53–62 — input focus ring + min-h-[44px] pattern)

**Imports pattern:**
```typescript
// src/components/TagsInput.tsx
import { useState, type KeyboardEvent } from 'react';
```

**Focus ring class** (login.tsx line 60 — copy exactly for the container):
```
focus-within:outline focus-within:outline-2 focus-within:outline-[var(--color-primary)]
```

**Full component** (RESEARCH.md Pattern 4 — already complete, use directly):
```tsx
interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagsInput({ value, onChange, placeholder }: TagsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = inputValue.trim();
      if (tag && !value.includes(tag)) {
        onChange([...value, tag]);
      }
      setInputValue('');
    }
    if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="border border-gray-300 rounded-lg px-3 py-2 flex flex-wrap gap-1.5 focus-within:outline focus-within:outline-2 focus-within:outline-[var(--color-primary)] min-h-[44px]">
      {value.map((tag, i) => (
        <span key={i} className="bg-[#4342FF]/10 text-[#4342FF] text-sm fira-code-regular px-2 py-0.5 rounded-full flex items-center gap-1">
          {tag}
          <button type="button" onClick={() => removeTag(i)} className="text-[#4342FF] hover:text-[#4342FF]/70 leading-none" aria-label={`Eliminar ${tag}`}>×</button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
      />
    </div>
  );
}
```

---

## Shared Patterns

### Admin Page Shell (standalone — no Header/Footer)
**Source:** `src/pages/admin/login.tsx` lines 42–43 and `src/pages/admin/index.tsx` lines 19–20
**Apply to:** `AdminPage` (`src/pages/admin/index.tsx`)
```tsx
// All admin pages use grid-bg, never import public Header or Footer
<div className="grid-bg min-h-screen ...">
```

### Input Field Pattern
**Source:** `src/pages/admin/login.tsx` lines 52–62
**Apply to:** `AdminCertificateForm`, `AdminCertificateList` (search input)
```tsx
<label className="flex flex-col gap-1.5">
  <span className="text-sm font-medium text-[#191919]">{label}</span>
  <input
    className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline focus:outline-2 focus:outline-[var(--color-primary)] transition min-h-[44px]"
  />
</label>
```

### Error State
**Source:** `src/pages/admin/login.tsx` lines 77–84
**Apply to:** `AdminCertificateForm`, `AdminCertificateList`
```tsx
<div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
  <FiAlertCircle size={16} className="flex-shrink-0" />
  <span>{errorMessage}</span>
</div>
```

### Loading Spinner
**Source:** `src/pages/admin/login.tsx` lines 93–103
**Apply to:** `AdminCertificateForm` (save button), `AdminCertificateList` (list loading)
```tsx
<svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
</svg>
```

### PocketBase Auth Record Access
**Source:** `src/contexts/PocketBaseContext.tsx` line 42 + `src/pages/admin/index.tsx` line 11
**Apply to:** `AdminTopBar`, `AdminPage`
```typescript
const { record } = usePocketBase();
// record: RecordModel | null — has .email and .name properties
// Fallback: record?.email ?? pb.authStore.record?.email
```

### PocketBase Singleton Import
**Source:** `src/services/pb.ts` line 6 + `src/pages/admin/login.tsx` line 7
**Apply to:** `AdminPage`, `AdminCertificateForm`, `AdminCertificateList`
```typescript
import { pb } from '../../services/pb'; // or '../services/pb' depending on depth
```

### Card Shadow Style
**Source:** `src/pages/admin/login.tsx` line 43 + `src/pages/admin/index.tsx` line 20
**Apply to:** `ConfirmModal` overlay card
```tsx
className="bg-white rounded-xl shadow-[0_4px_24px_rgba(67,66,255,0.10)] p-8"
```

### framer-motion Import Path
**Source:** `src/components/BackgroundGradientAnimation.tsx` line 1
**Apply to:** `AdminCertificateDrawer`
```typescript
import { motion, AnimatePresence } from 'framer-motion';
// NOT: import { motion } from 'motion/react'  ← WRONG package
```

### Wordmark Pattern
**Source:** `src/pages/admin/login.tsx` lines 45–48
**Apply to:** `AdminTopBar`
```tsx
<h1 className="fira-code-bold text-xl text-[#191919]">ANDESCODE</h1>
```

### btn-primary / btn-secondary
**Source:** `src/style.css` lines 99–118; `src/pages/admin/login.tsx` lines 86–108
**Apply to:** All buttons across admin panel components
```tsx
// Primary action (create, save, confirm dangerous action):
className="btn-primary min-h-[44px] rounded-lg text-sm"
// Secondary action (cancel, logout):
className="btn-secondary min-h-[44px] rounded-lg text-sm"
```

### fade-in Entry Animation
**Source:** `src/style.css` lines 195–197; `src/pages/admin/login.tsx` line 43; `src/pages/admin/index.tsx` line 20
**Apply to:** `ConfirmModal` card (CSS class), initial admin page content
```tsx
className="fade-in ..."  // animation: fadeIn 0.18s ease-out both
```

---

## No Analog Found

All files have analogs in the codebase. No files require falling back to RESEARCH.md patterns alone — though RESEARCH.md Patterns 1–6 supplement the analogs with PocketBase-specific API usage.

---

## Pre-Implementation Checklist

| Action | Required Before | Reason |
|--------|----------------|--------|
| `npm install qrcode.react` | Any QR download code | NOT in package.json — confirmed missing |
| Create `src/sections/admin/` directory | All section files | New directory, does not exist yet |

---

## Metadata

**Analog search scope:** `src/pages/admin/`, `src/components/`, `src/contexts/`, `src/services/`, `src/types/`, `src/style.css`
**Files scanned:** 7 analog files read
**Pattern extraction date:** 2026-06-08
