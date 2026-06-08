// src/sections/CertificadoVerificacion.tsx
// Sección de verificación de un certificado AndesCode.
// Obtiene el certificado por certificateCode usando la viewRule pública de PocketBase.
// DNI NUNCA se renderiza en esta página (privacidad — UI-SPEC § Copywriting Contract).

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiCopy } from "react-icons/fi";
import { pb } from "../services/pb.ts";
import type { Certificate } from "../types/certificate.ts";
import CertificadoVisual from "../components/CertificadoVisual.tsx";

/* ─── Estados posibles ─── */

type FetchState = "loading" | "found" | "notFound" | "error";

/* ─── CertificadoVerificacion ─── */

export default function CertificadoVerificacion() {
  const { certificateCode } = useParams<{ certificateCode: string }>();

  const [state, setState] = useState<FetchState>("loading");
  const [cert, setCert] = useState<Certificate | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  /* ─── Fetch del certificado ─── */

  useEffect(() => {
    if (!certificateCode) {
      setState("notFound");
      return;
    }

    setState("loading");
    setCert(null);

    // Buscar por certificateCode usando el filtro parametrizado (T-02-06: nunca concatenar raw)
    // viewRule = "" → pública; listRule requiere auth.
    // getFirstListItem usa el endpoint de list (listRule) → puede devolver 403 para invitados.
    // Si devuelve 403 u otro error no-404, mostramos el estado not-found ya que no podemos
    // obtener los datos del record. Esto es coherente con la intención de viewRule pública:
    // el QR linkea directamente a la URL del certificado; la búsqueda maneja 403 navegando aquí.
    pb.collection("certificates")
      .getFirstListItem<Certificate>(
        pb.filter("certificateCode = {:code}", { code: certificateCode })
      )
      .then((record) => {
        setCert(record);
        setState("found");
        // Establecer el título de la página de forma imperativa (TitleManager no puede
        // mapear rutas dinámicas con parámetros en el mapa estático de routeTitles)
        document.title = record.studentName
          ? `${record.studentName} · Certificado AndesCode`
          : "Certificado · AndesCode";
      })
      .catch((err: unknown) => {
        // 404 → not found; cualquier otro error (403, red, etc.) → estado not-found también
        // (no crashear; el usuario puede ir a /certificados y buscar de nuevo)
        const status =
          err !== null &&
          typeof err === "object" &&
          "status" in err
            ? (err as { status: number }).status
            : 0;

        if (status === 404 || status === 0) {
          setState("notFound");
        } else {
          // 403 (listRule auth required) u otros → mostrar not-found para invitados
          setState("notFound");
        }
      });

    // Restaurar título al desmontar (regresa al comportamiento de TitleManager)
    return () => {
      document.title = "AndesCode";
    };
  }, [certificateCode]);

  /* ─── Copiar URL ─── */

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  /* ─── Estado LOADING — esqueleto del nuevo layout (VIS-01) ─── */

  if (state === "loading") {
    return (
      <section className="relative grid-bg pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Esqueleto del badge de estado — 48px, primer elemento visible */}
          <div className="animate-pulse h-12 bg-gray-200 rounded-lg mb-4 w-full max-w-[480px]" />
          {/* Esqueleto de la fila de botones */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="animate-pulse h-11 bg-gray-200 rounded-lg w-full sm:w-56" />
            <div className="animate-pulse h-11 bg-gray-200 rounded-lg w-full sm:w-40" />
          </div>
          {/* Esqueleto del certificado visual — bloque único redondeado */}
          <div className="animate-pulse bg-gray-100 rounded-xl w-full" style={{ height: "420px" }} />
        </div>
      </section>
    );
  }

  /* ─── Estado NOT FOUND ─── */

  if (state === "notFound" || state === "error") {
    return (
      <section className="relative grid-bg pt-24 pb-20 px-4">
        <div className="max-w-xl mx-auto text-center fade-in">
          <FiAlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
          <h1 className="text-2xl font-semibold text-[#191919] mb-3">
            Certificado no encontrado
          </h1>
          <p className="text-gray-600 mb-8">
            No existe un certificado con el código{" "}
            <span className="fira-code-regular text-[var(--color-primary)]">
              {certificateCode}
            </span>
            . Verificá que el ID sea correcto.
          </p>
          <Link
            to="/certificados"
            className="btn-primary inline-block px-6 py-3 rounded-lg text-sm font-medium"
          >
            Buscar otro certificado
          </Link>
        </div>
      </section>
    );
  }

  /* ─── Estado FOUND ─── */

  if (!cert) return null;

  const isActive = cert.status === "active";

  return (
    <section className="relative grid-bg pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">

        {/* ─── 1. STATUS BADGE — siempre visible sin scroll en mobile (VIS-05, D-04) ─── */}
        <div
          className={`slide-up flex items-center gap-3 rounded-lg border px-4 py-3 mb-4 w-full max-w-[480px] font-semibold text-base ${
            isActive
              ? "bg-green-100 border-green-200 text-green-700"
              : "bg-red-100 border-red-200 text-red-700"
          }`}
          style={{ minHeight: "48px" }}
        >
          {isActive ? (
            <FiCheckCircle size={20} className="flex-shrink-0" />
          ) : (
            <FiXCircle size={20} className="flex-shrink-0" />
          )}
          <span>
            {isActive
              ? "Certificado válido emitido por AndesCode"
              : "Certificado revocado"}
          </span>
        </div>

        {/* ─── 2. Fila de botones de acción (D-04) ─── */}
        {/* Plan 02 agrega el botón "Descargar certificado PDF" aquí */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">

          {/* Copiar enlace (VERIF-08) */}
          <button
            onClick={handleCopyUrl}
            style={{ minHeight: "44px" }}
            className="btn-secondary flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium"
          >
            <FiCopy size={16} />
            {copySuccess ? "Enlace copiado!" : "Copiar enlace"}
          </button>

        </div>

        {/* ─── 3. Certificado visual HTML/CSS (VIS-01) ─── */}
        <CertificadoVisual cert={cert} />

      </div>
    </section>
  );
}
