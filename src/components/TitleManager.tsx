import { type ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";

const routeTitles: Record<string, string> = {
  "/": "AndesCode",
  "/servicios": "Servicios",
  "/nosotros": "Nosotros",
  "/trabajos": "Trabajos",
  "/contacto": "Contacto",
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
