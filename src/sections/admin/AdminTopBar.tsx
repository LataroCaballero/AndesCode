// src/sections/admin/AdminTopBar.tsx
// Barra superior sticky del panel de administración.
// Muestra el wordmark ANDESCODE, el email del admin logueado, y un botón de logout.
import type { RecordModel } from 'pocketbase';

interface AdminTopBarProps {
  record: RecordModel | null;
  onLogout: () => void;
}

export default function AdminTopBar({ record, onLogout }: AdminTopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between shadow-sm">
      {/* Wordmark */}
      <span className="fira-code-bold text-xl text-[#191919]">ANDESCODE</span>

      {/* Admin identity + logout */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500 hidden sm:block">{record?.email}</span>
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
