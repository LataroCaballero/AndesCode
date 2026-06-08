// src/sections/admin/AdminCertificateList.tsx
// Lista de certificados paginada, buscable y filtrable para el panel de administración.
// Muestra una tabla con columnas: Código, Nombre del estudiante, Fecha de emisión, Estado, Acciones.
import { useRef } from 'react';
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiToggleLeft,
  FiToggleRight,
  FiDownload,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import type { Certificate } from '../../types/certificate';

interface AdminCertificateListProps {
  items: Certificate[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  search: string;
  statusFilter: 'all' | 'active' | 'revoked';
  onSearchChange: (v: string) => void;
  onStatusFilterChange: (v: 'all' | 'active' | 'revoked') => void;
  onPageChange: (p: number) => void;
  onRetry: () => void;
  onCreateNew: () => void;
  onEdit: (c: Certificate) => void;
  onToggleStatus?: (c: Certificate) => void;
  // onDownloadQR removido — la descarga de QR es self-contained en CertificateRowQRDownload (Plan 03)
}

/* ─── Helper: formatear fecha DD/MM/YYYY ─── */
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/* ─── Skeleton row para estado de carga ─── */
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-24" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-40" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-20" /></td>
      <td className="px-4 py-3"><div className="h-5 bg-gray-200 rounded-full animate-pulse w-16" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-24" /></td>
    </tr>
  );
}

/* ─── Helper: descarga de QR por fila (lazy-mount, off-screen) ─── */

interface CertificateRowQRDownloadProps {
  certificateCode: string;
}

function CertificateRowQRDownload({ certificateCode }: CertificateRowQRDownloadProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // window.location.origin es el dominio de producción dentro del panel admin autenticado.
  // En desarrollo local, el QR apuntará a localhost — esto es esperado (RESEARCH Pitfall 6).
  const verificationUrl = `${window.location.origin}/certificados/${certificateCode}`;

  const handleDownload = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgRef.current);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR-${certificateCode}.svg`;
    // Safari requiere que el anchor esté en el DOM para que .click() dispare la descarga
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Revocar después de un tick para que el browser pueda iniciar la descarga
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <>
      {/* QR renderizado off-screen para serialización — no visible en la UI */}
      <span
        style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
        aria-hidden
      >
        <QRCodeSVG
          ref={svgRef}
          value={verificationUrl}
          size={256}
          level="H"
          marginSize={4}
        />
      </span>

      {/* Botón de descarga visible en la fila */}
      <div className="relative group">
        <button
          type="button"
          onClick={handleDownload}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-[var(--color-primary)] transition-colors"
          aria-label={`Descargar QR del certificado ${certificateCode}`}
        >
          <FiDownload size={16} />
        </button>
        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded text-xs text-white bg-gray-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Descargar QR
        </span>
      </div>
    </>
  );
}

export default function AdminCertificateList({
  items,
  loading,
  error,
  page,
  totalPages,
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onPageChange,
  onRetry,
  onCreateNew,
  onEdit,
  onToggleStatus,
}: AdminCertificateListProps) {
  const hasFilter = search.trim() !== '' || statusFilter !== 'all';

  return (
    <div className="flex flex-col gap-4">
      {/* ─── Fila de controles ─── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Búsqueda */}
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <FiSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre o código…"
            className="border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline focus:outline-2 focus:outline-[var(--color-primary)] transition min-h-[44px] w-full"
          />
        </div>

        {/* Filtro de estado */}
        <select
          value={statusFilter}
          onChange={e => onStatusFilterChange(e.target.value as 'all' | 'active' | 'revoked')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[44px] focus:outline focus:outline-2 focus:outline-[var(--color-primary)]"
        >
          <option value="all">Todos</option>
          <option value="active">Activo</option>
          <option value="revoked">Revocado</option>
        </select>

        {/* Botón nuevo certificado — alineado a la derecha */}
        <div className="ml-auto">
          <button
            type="button"
            onClick={onCreateNew}
            className="btn-primary min-h-[44px] px-4 text-sm rounded-lg flex items-center gap-2"
          >
            <FiPlus size={16} />
            Nuevo certificado
          </button>
        </div>
      </div>

      {/* ─── Estado de error ─── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
          <FiAlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={onRetry}
            className="ml-2 text-[var(--color-primary)] underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* ─── Tabla ─── */}
      {!error && (
        <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm text-[#191919]">
            {/* Encabezados */}
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[140px]">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                  Nombre del estudiante
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[130px]">
                  Fecha de emisión
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Estado de carga: 5 filas skeleton */}
              {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

              {/* Estado vacío */}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <FiSearch size={32} className="text-gray-300" />
                      {hasFilter ? (
                        <>
                          <p className="font-semibold text-[#191919] text-base">Sin resultados</p>
                          <p className="text-sm text-gray-500">
                            No encontramos certificados con ese criterio. Modificá la búsqueda o el filtro.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-[#191919] text-base">No hay certificados</p>
                          <p className="text-sm text-gray-500">
                            Creá el primer certificado con el botón de arriba.
                          </p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {/* Filas de certificados */}
              {!loading &&
                items.map(cert => (
                  <tr key={cert.id} className="hover:bg-gray-50 border-b border-gray-100" style={{ minHeight: '52px' }}>
                    {/* Código */}
                    <td className="px-4 py-3 w-[140px]">
                      <span className="fira-code-regular text-[var(--color-primary)]">
                        {cert.certificateCode}
                      </span>
                    </td>

                    {/* Nombre del estudiante */}
                    <td className="px-4 py-3 min-w-0">
                      <span className="block truncate">{cert.studentName}</span>
                    </td>

                    {/* Fecha de emisión */}
                    <td className="px-4 py-3 w-[130px]">
                      {formatDate(cert.issueDate)}
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3 w-[100px]">
                      {cert.status === 'active' ? (
                        <span className="bg-green-100 text-green-700 border border-green-200 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                          Activo
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-700 border border-red-200 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                          Revocado
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3 w-[120px]">
                      <div className="flex items-center gap-1">
                        {/* Editar */}
                        <div className="relative group">
                          <button
                            type="button"
                            onClick={() => onEdit(cert)}
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-[var(--color-primary)] transition-colors"
                            aria-label={`Editar certificado ${cert.certificateCode}`}
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded text-xs text-white bg-gray-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            Editar
                          </span>
                        </div>

                        {/* Revocar / Reactivar */}
                        <div className="relative group">
                          <button
                            type="button"
                            onClick={() => onToggleStatus?.(cert)}
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                            aria-label={cert.status === 'active' ? `Revocar certificado ${cert.certificateCode}` : `Reactivar certificado ${cert.certificateCode}`}
                          >
                            {cert.status === 'active' ? (
                              <FiToggleRight size={18} className="text-green-600" />
                            ) : (
                              <FiToggleLeft size={18} className="text-gray-400" />
                            )}
                          </button>
                          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded text-xs text-white bg-gray-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            {cert.status === 'active' ? 'Revocar' : 'Reactivar'}
                          </span>
                        </div>

                        {/* Descargar QR — self-contained, sin callback del orquestador */}
                        <CertificateRowQRDownload certificateCode={cert.certificateCode} />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Paginación ─── */}
      {!error && !loading && items.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="btn-secondary min-h-[44px] px-4 text-sm rounded-lg flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiChevronLeft size={16} />
            Anterior
          </button>

          <span className="text-sm text-gray-500">
            Página {page} de {totalPages}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="btn-secondary min-h-[44px] px-4 text-sm rounded-lg flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente
            <FiChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
