// src/sections/CertificadosSearch.tsx
// Sección de búsqueda pública para verificar certificados AndesCode.
// Normaliza el ID ingresado y navega a /certificados/:code.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle } from "react-icons/fi";
import { pb } from "../services/pb.ts";
import { normalizeCertificateCode } from "../types/certificate.ts";

/* ─── CertificadosSearch ─── */

export default function CertificadosSearch() {
  const [inputValue, setInputValue] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ─── Limpiar estado "no encontrado" al cambiar el input ─── */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (notFound) setNotFound(false);
  };

  /* ─── Submit: normalizar → buscar → navegar o mostrar error ─── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const code = normalizeCertificateCode(inputValue);
    setLoading(true);
    setNotFound(false);

    try {
      // Intentar pre-verificar la existencia del certificado.
      // listRule requiere autenticación; si el usuario no está autenticado
      // puede devolver 403. En ese caso (o cualquier error que no sea "not found")
      // navegamos directamente y dejamos que la página de detalle resuelva el estado.
      await pb.collection("certificates").getFirstListItem(
        pb.filter("certificateCode = {:code}", { code })
      );
      // Certificado encontrado → navegar a la página de detalle
      navigate("/certificados/" + code);
    } catch (err: unknown) {
      // Determinar si el error es un 404 genuino o un 403/error de red
      const isNotFound =
        err !== null &&
        typeof err === "object" &&
        "status" in err &&
        (err as { status: number }).status === 404;

      if (isNotFound) {
        // Certificado no existe → mostrar mensaje inline (no navegar)
        setNotFound(true);
      } else {
        // 403 (listRule requiere auth) u otro error → navegar igualmente.
        // La página de detalle usa viewRule (pública) y resolverá el estado correcto.
        navigate("/certificados/" + code);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ─── Render ─── */

  return (
    <section className="relative grid-bg pt-36 pb-20 px-4 overflow-hidden">
      <div className="max-w-xl mx-auto fade-in">
        {/* Etiqueta de sección */}
        <span className="block text-center text-xs uppercase tracking-widest text-[#4342FF] font-semibold mb-3">
          Verificación pública
        </span>

        {/* Título principal */}
        <h1 className="text-center font-semibold text-3xl text-[#191919] mb-4 leading-tight">
          Verificá la autenticidad de un certificado
        </h1>

        {/* Subtítulo */}
        <p className="text-center text-base text-gray-600 mb-10">
          Ingresá el ID del certificado para consultar su estado de validez.
        </p>

        {/* Formulario de búsqueda */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Campo de input */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="certificateId"
              className="text-sm font-medium text-[#191919]"
            >
              ID del certificado
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="certificateId"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="AC-AAAA-NNN"
                autoComplete="off"
                spellCheck={false}
                style={{ minHeight: "48px" }}
                className="fira-code-regular flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-2 focus:outline-[var(--color-primary)] transition"
              />
              <button
                type="submit"
                disabled={loading}
                style={{ minHeight: "48px" }}
                className="btn-primary px-6 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-70 whitespace-nowrap"
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Verificando...
                  </span>
                ) : (
                  "Verificar certificado"
                )}
              </button>
            </div>
            {/* Texto de ayuda */}
            <p className="text-xs text-gray-500 mt-1">
              Ingresá el código exacto, por ejemplo: AC-2025-001
            </p>
          </div>

          {/* Estado "no encontrado" — gris, distinto del badge rojo de revocado */}
          {notFound && (
            <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              <FiAlertCircle className="text-gray-600 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-sm text-gray-600">
                No encontramos un certificado con ese ID. Revisá el código e intentá de nuevo.
              </p>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
