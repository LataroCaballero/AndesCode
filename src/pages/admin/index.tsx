// src/pages/admin/index.tsx
// Orquestador del panel de administración.
// AdminGuard (aplicado en main.tsx) garantiza que solo usuarios autenticados lleguen aquí.
// Contiene todo el estado de la lista (paginación, búsqueda, filtro), el drawer (crear/editar)
// y el modal de confirmación de revocar/reactivar (Plan 03).
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { pb } from '../../services/pb';
import { usePocketBase } from '../../contexts/PocketBaseContext';
import type { Certificate } from '../../types/certificate';
import AdminTopBar from '../../sections/admin/AdminTopBar';
import AdminCertificateList from '../../sections/admin/AdminCertificateList';
import AdminCertificateDrawer from '../../sections/admin/AdminCertificateDrawer';
import ConfirmModal from '../../sections/admin/ConfirmModal';

/* ─── Constante de paginación ─── */
const ITEMS_PER_PAGE = 20;

export default function AdminPage() {
  const navigate = useNavigate();
  const { record } = usePocketBase();

  /* ─── Estado de la lista ─── */
  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  /* ─── Estado de controles de búsqueda y filtro ─── */
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked'>('all');

  /* ─── Estado del drawer (Plan 02) ─── */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [drawerRecord, setDrawerRecord] = useState<Certificate | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');

  /* ─── Estado del modal de confirmación revocar/reactivar (Plan 03) ─── */
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    record: Certificate | null;
    action: 'revoke' | 'reactivate';
  }>({ open: false, record: null, action: 'revoke' });
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  /* ─── Logout ─── */
  const handleLogout = () => {
    pb.authStore.clear();
    navigate('/admin/login', { replace: true });
  };

  /* ─── Debounce de búsqueda: 300ms ─── */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  /* ─── Resetear página al cambiar búsqueda o filtro ─── */
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  /* ─── Fetch de certificados ─── */
  const fetchCertificates = useCallback(async (
    currentPage: number,
    perPage: number,
    searchQuery: string,
    filter: 'all' | 'active' | 'revoked',
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Construir partes del filtro (T-03-FILTER: NUNCA concatenar input directamente)
      const filterParts: string[] = [];

      if (searchQuery.trim()) {
        // pb.filter() escapa caracteres especiales — previene inyección
        filterParts.push(
          pb.filter('(studentName ~ {:q} || certificateCode ~ {:q})', { q: searchQuery.trim() })
        );
      }

      if (filter !== 'all') {
        filterParts.push(pb.filter('status = {:status}', { status: filter }));
      }

      const result = await pb.collection('certificates').getList<Certificate>(
        currentPage,
        perPage,
        {
          filter: filterParts.join(' && ') || undefined,
          sort: '-issueDate',
          '$autoCancel': false,
        }
      );

      setItems(result.items);
      setTotalPages(result.totalPages || 1);
    } catch {
      setError('Error al cargar los certificados. Revisá tu conexión e intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ─── Effect principal: re-fetchar cuando cambian page, búsqueda, filtro o refreshKey ─── */
  useEffect(() => {
    fetchCertificates(page, ITEMS_PER_PAGE, debouncedSearch, statusFilter);
  }, [page, debouncedSearch, statusFilter, refreshKey, fetchCertificates]);

  /* ─── Scroll lock cuando el drawer está abierto (Pitfall 4) ─── */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  /* ─── Auto-generación del código de certificado (D-05) ─── */
  const generateNextCertificateCode = async (): Promise<string> => {
    const year = new Date().getFullYear();
    const prefix = `AC-${year}-`;

    // Busca el código más alto del año actual (sort descendente) e incrementa desde ahí.
    // Esto evita la colisión por totalItems+1 cuando dos sesiones leen simultáneamente
    // y también elimina el bug de timezone del filtro por `created` (Pitfall 3).
    const result = await pb.collection('certificates').getList(1, 1, {
      filter: pb.filter('certificateCode ~ {:prefix}', { prefix }),
      sort: '-certificateCode',
      fields: 'certificateCode',
      '$autoCancel': false,
    });

    if (result.items.length === 0) {
      return `${prefix}001`;
    }

    const lastCode = result.items[0].certificateCode; // e.g. "AC-2026-007"
    const lastNum = parseInt(lastCode.split('-')[2] ?? '0', 10);
    const next = String(lastNum + 1).padStart(3, '0');
    return `${prefix}${next}`;
  };

  /* ─── Abrir drawer ─── */
  const openDrawer = async (mode: 'create' | 'edit', cert?: Certificate) => {
    setDrawerMode(mode);
    setDrawerRecord(cert ?? null);

    if (mode === 'create') {
      try {
        const code = await generateNextCertificateCode();
        setGeneratedCode(code);
      } catch {
        // Si falla la generación, el campo quedará vacío y el admin puede escribirlo
        setGeneratedCode('');
      }
    } else {
      setGeneratedCode('');
    }

    setDrawerOpen(true);
  };

  /* ─── Cerrar drawer ─── */
  const closeDrawer = () => {
    setDrawerOpen(false);
    // Resetea el record y el código generado después de que termine la animación de salida
    setTimeout(() => {
      setDrawerRecord(null);
      setGeneratedCode('');
    }, 250);
  };

  /* ─── Callback tras guardar: cerrar drawer + refrescar lista ─── */
  const onSaved = () => {
    closeDrawer();
    setRefreshKey(k => k + 1); // Dispara re-fetch (Pitfall 5)
  };

  /* ─── Handlers del modal de confirmación (Plan 03) ─── */

  // Abre el modal derivando la acción desde el estado actual del certificado
  const openConfirm = (record: Certificate) => {
    const action = record.status === 'active' ? 'revoke' : 'reactivate';
    setConfirmModal({ open: true, record, action });
    setStatusError(null);
  };

  // Cierra el modal sin cambiar el estado
  const cancelConfirm = () => {
    setConfirmModal(m => ({ ...m, open: false }));
    setStatusError(null);
  };

  // Llama a PocketBase para actualizar el estado del certificado
  const updateCertificateStatus = async (id: string, newStatus: 'active' | 'revoked') => {
    await pb.collection('certificates').update(id, { status: newStatus });
  };

  // Confirma el cambio de estado: actualiza en PocketBase y refresca la lista
  const confirmStatusChange = async () => {
    if (!confirmModal.record) return;

    setStatusUpdating(true);
    setStatusError(null);

    const newStatus: 'active' | 'revoked' = confirmModal.action === 'revoke' ? 'revoked' : 'active';

    try {
      await updateCertificateStatus(confirmModal.record.id, newStatus);
      // Éxito: cerrar modal y refrescar la lista (Pitfall 5 — re-fetch via refreshKey)
      setConfirmModal(m => ({ ...m, open: false }));
      setRefreshKey(k => k + 1);
    } catch {
      setStatusError('Error al actualizar el estado. Intentá de nuevo.');
    } finally {
      setStatusUpdating(false);
    }
  };

  /* ─── Handlers de controles ─── */
  const handleSearchChange = (v: string) => {
    setSearch(v);
  };

  const handleStatusFilterChange = (v: 'all' | 'active' | 'revoked') => {
    setStatusFilter(v);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
  };

  const handleRetry = () => {
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="grid-bg min-h-screen">
      {/* Barra superior sticky */}
      <AdminTopBar record={record} onLogout={handleLogout} />

      {/* Contenido principal — offset pt-14 para compensar la top bar sticky h-14 */}
      <main className="px-4 sm:px-8 py-6">
        <AdminCertificateList
          items={items}
          loading={loading}
          error={error}
          page={page}
          totalPages={totalPages}
          search={search}
          statusFilter={statusFilter}
          onSearchChange={handleSearchChange}
          onStatusFilterChange={handleStatusFilterChange}
          onPageChange={handlePageChange}
          onRetry={handleRetry}
          onCreateNew={() => openDrawer('create')}
          onEdit={(cert) => openDrawer('edit', cert)}
          onToggleStatus={(cert) => openConfirm(cert)}
        />
      </main>

      {/* Drawer de crear/editar — renderiza sobre el contenido principal */}
      <AdminCertificateDrawer
        open={drawerOpen}
        mode={drawerMode}
        record={drawerRecord}
        initialCode={generatedCode}
        onClose={closeDrawer}
        onSaved={onSaved}
      />

      {/* Modal de confirmación de revocar/reactivar — renderiza sobre el drawer */}
      <ConfirmModal
        open={confirmModal.open}
        record={confirmModal.record}
        action={confirmModal.action}
        loading={statusUpdating}
        error={statusError}
        onConfirm={confirmStatusChange}
        onCancel={cancelConfirm}
      />
    </div>
  );
}
