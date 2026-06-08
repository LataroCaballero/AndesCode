import { type ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";

const routeTitles: Record<string, string> = {
  "/": "AndesCode",
  "/servicios": "Servicios",
  "/nosotros": "Nosotros",
  "/trabajos": "Trabajos",
  "/contacto": "Contacto",
  "/politica-de-privacidad": "Política de Privacidad",
  "/eliminacion-de-datos": "Eliminación de Datos",
  "/admin/login": "Iniciar sesión · AndesCode Admin",
  "/admin": "Panel de administración · AndesCode",
};

const DEFAULT_TITLE = "AndesCode";

type TitleManagerProps = {
  children: ReactNode;
};

export default function TitleManager({ children }: TitleManagerProps) {
  const location = useLocation();

  useEffect(() => {
    document.title = routeTitles[location.pathname] ?? DEFAULT_TITLE;
  }, [location.pathname]);

  return <>{children}</>;
}
