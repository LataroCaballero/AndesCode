// src/pages/admin/index.tsx
// Orquestador del panel de administración.
// AdminGuard (aplicado en main.tsx) garantiza que solo usuarios autenticados lleguen aquí.
// Contiene todo el estado de la lista (paginación, búsqueda, filtro) y el drawer (crear/editar).
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { pb } from '../../services/pb';
import { usePocketBase } from '../../contexts/PocketBaseContext';
import type { Certificate } from '../../types/certificate';
import AdminTopBar from '../../sections/admin/AdminTopBar';
import AdminCertificateList from '../../sections/admin/AdminCertificateList';
import AdminCertificateDrawer from '../../sections/admin/AdminCertificateDrawer';

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
        filterParts.push(`status = "${filter}"`);
      }

      const result = await pb.collection('certificates').getList<Certificate>(
        currentPage,
        perPage,
        {
          filter: filterParts.join(' && ') || undefined,
          sort: '-created',
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
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [drawerOpen]);

  /* ─── Auto-generación del código de certificado (D-05) ─── */
  const generateNextCertificateCode = async (): Promise<string> => {
    const year = new Date().getFullYear();
    const yearStart = `${year}-01-01 00:00:00`;
    const yearEnd = `${year}-12-31 23:59:59`;

    const result = await pb.collection('certificates').getList(1, 1, {
      filter: `created >= "${yearStart}" && created <= "${yearEnd}"`,
      sort: '-certificateCode',
      fields: 'certificateCode',
    });

    // totalItems es la cantidad de certificados del año actual
    // El UNIQUE index en PocketBase es el resguardo contra colisiones (Pitfall 3)
    const next = String(result.totalItems + 1).padStart(3, '0');
    return `AC-${year}-${next}`;
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
  };

  /* ─── Callback tras guardar: cerrar drawer + refrescar lista ─── */
  const onSaved = () => {
    closeDrawer();
    setRefreshKey(k => k + 1); // Dispara re-fetch (Pitfall 5)
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
          // onToggleStatus y onDownloadQR se agregarán en Plan 03
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
    </div>
  );
}
