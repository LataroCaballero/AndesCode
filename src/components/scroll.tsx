// src/components/ScrollToTop.tsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mostrar el loader
    setLoading(true);
    window.scrollTo(0, 0);

    // Esperar 400ms y luego ocultarlo
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 400); // Cambiá la duración si querés más/menos delay

    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      {loading ? (
        <div className="w-full h-screen flex items-center justify-center bg-white">
          <div className="animate-pulse w-16 h-16 bg-gray-300 rounded-full" />
        </div>
      ) : (
        children
      )}
    </>
  );
}
