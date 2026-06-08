// src/pages/admin/index.tsx
// Dashboard protegido del administrador.
// AdminGuard (aplicado en main.tsx) garantiza que solo usuarios autenticados lleguen aquí.
// Phase 3 agregará el chrome completo del panel (sidebar, navegación, CRUD).
import { useNavigate } from 'react-router-dom';
import { pb } from '../../services/pb';
import { usePocketBase } from '../../contexts/PocketBaseContext';

export default function AdminPage() {
  const navigate = useNavigate();
  const { record } = usePocketBase();

  const handleLogout = () => {
    pb.authStore.clear();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="grid-bg min-h-screen flex items-center justify-center px-4">
      <div className="fade-in bg-white rounded-xl shadow-[0_4px_24px_rgba(67,66,255,0.10)] p-8 max-w-[480px] w-full">
        <h1 className="fira-code-bold text-xl text-[#191919] mb-1">ANDESCODE</h1>
        <p className="text-gray-500 text-sm mb-6">Panel de administración</p>

        <p className="text-[#191919] font-semibold text-lg mb-6">
          Bienvenido, {record?.email ?? pb.authStore.record?.email}
        </p>

        <button
          type="button"
          className="btn-secondary min-h-[44px] px-6 rounded-lg text-sm"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
