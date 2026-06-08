// src/sections/admin/ConfirmModal.tsx
// Modal de confirmación para revocar o reactivar un certificado.
// Muestra el nombre del estudiante y el código del certificado antes de ejecutar la acción.
import { useEffect } from 'react';
import type { Certificate } from '../../types/certificate';

/* ─── Tipos ─── */

interface ConfirmModalProps {
  open: boolean;
  record: Certificate | null;
  action: 'revoke' | 'reactivate';
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/* ─── Spinner SVG ─── */

function Spinner({ label }: { label: string }) {
  return (
    <>
      <svg
        className="animate-spin h-4 w-4 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {label}
    </>
  );
}

/* ─── ConfirmModal ─── */

export default function ConfirmModal({
  open,
  record,
  action,
  loading = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const isRevoke = action === 'revoke';

  const heading = isRevoke ? '¿Revocar este certificado?' : '¿Reactivar este certificado?';
  const body = isRevoke
    ? 'Vas a revocar el certificado'
    : 'Vas a reactivar el certificado';
  const bodySuffix = isRevoke
    ? 'Esta acción se puede revertir.'
    : 'Va a volver a aparecer como válido.';
  const cancelLabel = isRevoke ? 'No revocar' : 'No reactivar';
  const confirmLabel = isRevoke ? 'Revocar' : 'Reactivar';
  const loadingLabel = isRevoke ? 'Revocando…' : 'Reactivando…';

  const confirmBtnClass = isRevoke
    ? 'bg-red-600 text-white border border-red-600 hover:bg-red-700 disabled:opacity-70'
    : 'bg-green-600 text-white border border-green-600 hover:bg-green-700 disabled:opacity-70';

  // Escape cierra el modal (ADMIN-08/10 acceptance criterion)
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  // Retornar null cuando el modal está cerrado o no hay registro seleccionado
  if (!open || !record) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="fade-in bg-white rounded-xl shadow-2xl w-full max-w-[440px] p-6">
        {/* Encabezado — Inter Semibold 20px */}
        <h2
          className="font-semibold text-[20px] leading-snug text-[#191919] mb-3"
        >
          {heading}
        </h2>

        {/* Cuerpo: código y nombre del estudiante — solo JSX, sin dangerouslySetInnerHTML */}
        <p className="text-sm text-gray-600 mb-4">
          {body}{' '}
          <span className="font-semibold text-[#191919]">{record.certificateCode}</span>
          {' '}de{' '}
          <span className="font-semibold text-[#191919]">{record.studentName}</span>
          {'. '}
          {bodySuffix}
        </p>

        {/* Error inline */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
            Error al actualizar el estado. Intentá de nuevo.
          </div>
        )}

        {/* Fila de botones — justify-end gap-3 */}
        <div className="flex justify-end gap-3">
          {/* Cancelar */}
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary min-h-[44px] px-5 text-sm rounded-lg"
          >
            {cancelLabel}
          </button>

          {/* Confirmar — color según acción */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`min-h-[44px] px-5 text-sm rounded-lg font-medium flex items-center gap-2 transition-colors ${confirmBtnClass}`}
          >
            {loading ? <Spinner label={loadingLabel} /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
