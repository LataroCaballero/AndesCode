// src/pages/admin/index.tsx
// Orquestador del panel de administración.
// AdminGuard (aplicado en main.tsx) garantiza que solo usuarios autenticados lleguen aquí.
// Contiene todo el estado de la lista (paginación, búsqueda, filtro) y lo pasa a los sub-componentes.
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { pb } from '../../services/pb';
import { usePocketBase } from '../../contexts/PocketBaseContext';
import type { Certificate } from '../../types/certificate';
import AdminTopBar from '../../sections/admin/AdminTopBar';
import AdminCertificateList from '../../sections/admin/AdminCertificateList';

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

  /* ─── Placeholder handlers para Plans 02/03 ─── */
  const handleCreateNew = () => {
    // Plan 02 reemplazará este placeholder con la apertura del drawer
  };

  const handleEdit = (_cert: Certificate) => {
    // Plan 02 reemplazará este placeholder con la apertura del drawer en modo edit
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
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          // onToggleStatus y onDownloadQR se agregarán en Plans 02/03
        />
      </main>
    </div>
  );
}
