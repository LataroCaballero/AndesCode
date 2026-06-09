import { type ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";

const routeTitles: Record<string, string> = {
  "/": "AndesCode — Software a medida y auditorías de seguridad",
  "/servicios": "Servicios · Software a medida · AndesCode",
  "/auditorias": "Auditorías de seguridad · AndesCode",
  "/nosotros": "Nosotros · AndesCode",
  "/trabajos": "Trabajos · AndesCode",
  "/contacto": "Contacto · AndesCode",
  "/politica-de-privacidad": "Política de Privacidad",
  "/eliminacion-de-datos": "Eliminación de Datos",
  "/admin/login": "Iniciar sesión · AndesCode Admin",
  "/admin": "Panel de administración · AndesCode",
  // Nota: el título de /certificados/:code se establece de forma imperativa dentro
  // de CertificadoVerificacion una vez que se carga el registro (nombre del estudiante).
  "/certificados": "Verificar Certificado · AndesCode",
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
