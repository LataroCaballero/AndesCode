// src/components/AdminGuard.tsx
// Wrapper de ruta que protege todas las páginas /admin/*.
// Revalida el token contra el servidor (authRefresh) en cada mount —
// si el token expiró o fue revocado, limpia el store y redirige al login.
// NOTA: La barrera real de seguridad son las collection rules de PocketBase (server-side).
// Este guard es defensa en profundidad para la UX.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pb } from '../services/pb';
import { usePocketBase } from '../contexts/PocketBaseContext';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  usePocketBase(); // suscribirse al contexto para re-renders reactivos
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (!pb.authStore.isValid) {
        if (!cancelled) navigate('/admin/login', { replace: true });
        return;
      }

      try {
        // Revalidar el token contra el servidor (AUTH-03)
        await pb.collection('_superusers').authRefresh();
        if (!cancelled) setValidated(true);
      } catch (err) {
        // Token expirado o inválido: limpiar y redirigir
        console.error('[AdminGuard] authRefresh falló:', err);
        if (!cancelled) {
          pb.authStore.clear();
          navigate('/admin/login', { replace: true });
        }
      }
    };

    check();
    return () => { cancelled = true; };
  // Sólo corre al montar — no re-ejecutar cuando cambia isValid
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mientras se valida, no renderizar nada para evitar flash de contenido protegido
  if (!validated) return null;

  return <>{children}</>;
}
