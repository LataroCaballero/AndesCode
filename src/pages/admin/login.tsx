// src/pages/admin/login.tsx
// Página standalone de login para el panel de administración.
// No incluye Header ni Footer — es completamente independiente del sitio público.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle } from 'react-icons/fi';
import { pb } from '../../services/pb';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      await pb.collection('_superusers').authWithPassword(email, password);
      navigate('/admin');
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(false);
  };

  return (
    <div className="grid-bg min-h-screen flex items-center justify-center px-4">
      <div className="fade-in bg-white rounded-xl shadow-[0_4px_24px_rgba(67,66,255,0.10)] p-8 w-full max-w-[400px]">
        {/* Encabezado */}
        <div className="mb-6">
          <h1 className="fira-code-bold text-xl text-[#191919]">ANDESCODE</h1>
          <p className="text-gray-500 text-sm mt-1">Panel de administración</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[#191919]">Correo electrónico</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={handleEmailChange}
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline focus:outline-2 focus:outline-[var(--color-primary)] transition min-h-[44px]"
            />
          </label>

          {/* Contraseña */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[#191919]">Contraseña</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={handlePasswordChange}
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline focus:outline-2 focus:outline-[var(--color-primary)] transition min-h-[44px]"
            />
          </label>

          {/* Alerta de error de credenciales */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
              <FiAlertCircle size={16} className="flex-shrink-0" />
              <span>Credenciales incorrectas. Revisá tu correo y contraseña.</span>
            </div>
          )}

          {/* Botón de submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full min-h-[44px] flex items-center justify-center gap-2 rounded-lg text-sm"
            style={loading ? { opacity: 0.7 } : undefined}
          >
            {loading ? (
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
                Iniciando sesión...
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
