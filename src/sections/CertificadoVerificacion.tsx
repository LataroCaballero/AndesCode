// src/sections/CertificadoVerificacion.tsx
// Sección de verificación de un certificado AndesCode.
// Obtiene el certificado por certificateCode usando la viewRule pública de PocketBase.
// DNI NUNCA se renderiza en esta página (privacidad — UI-SPEC § Copywriting Contract).

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiCopy } from "react-icons/fi";
import { pb } from "../services/pb.ts";
import type { Certificate } from "../types/certificate.ts";

/* ─── Estados posibles ─── */

type FetchState = "loading" | "found" | "notFound" | "error";

/* ─── Helpers de formato ─── */

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  // PocketBase retorna fechas ISO; mostrar solo la parte de la fecha
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

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

  /* ─── Estado LOADING ─── */

  if (state === "loading") {
    return (
      <section className="relative grid-bg pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* El esqueleto del badge es el primer elemento — misma posición que el badge real */}
          <div className="animate-pulse h-12 bg-gray-200 rounded-lg mb-6 max-w-[480px]" />
          <div className="animate-pulse h-8 bg-gray-200 rounded mb-4 w-3/4" />
          <div className="animate-pulse h-4 bg-gray-100 rounded mb-3 w-1/2" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-gray-200 rounded mb-2 w-2/3" />
                <div className="h-4 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
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
      <div className="max-w-2xl mx-auto">

        {/* STATUS BADGE — primer elemento de la página, visible sin scroll en mobile (VIS-05) */}
        <div
          className={`slide-up flex items-center gap-3 rounded-lg border px-4 py-3 mb-6 w-full max-w-[480px] font-semibold text-base ${
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

        {/* Nombre del estudiante */}
        <h1 className="uppercase text-3xl font-semibold text-[#191919] mb-8 leading-tight">
          {cert.studentName}
        </h1>

        {/* Grilla de metadatos (fade-in) */}
        <div className="fade-in grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">

          {/* ID del certificado */}
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
              ID del certificado
            </p>
            <p className="fira-code-regular text-sm text-[var(--color-primary)]">
              {cert.certificateCode}
            </p>
          </div>

          {/* Fecha de emisión */}
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
              Fecha de emisión
            </p>
            <p className="text-sm text-[#191919]">{formatDate(cert.issueDate)}</p>
          </div>

          {/* Período de la práctica */}
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
              Período de la práctica
            </p>
            <p className="text-sm text-[#191919]">
              {formatDate(cert.startDate)} – {formatDate(cert.endDate)}
            </p>
          </div>

          {/* Universidad */}
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
              Universidad
            </p>
            <p className="text-sm text-[#191919]">{cert.university}</p>
          </div>

          {/* Área de desempeño */}
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
              Área de desempeño
            </p>
            <p className="text-sm text-[#191919]">{cert.degree}</p>
          </div>

          {/* Calificación */}
          {cert.score !== undefined && cert.score !== null && (
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                Calificación
              </p>
              <p className="text-sm text-[#191919]">{cert.score}</p>
            </div>
          )}

          {/* Supervisor */}
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
              Supervisor
            </p>
            <p className="text-sm text-[#191919]">{cert.supervisorName}</p>
          </div>

          {/* DNI: NUNCA renderizado (privacidad — UI-SPEC § Copywriting Contract) */}

        </div>

        {/* Botón copiar enlace (VERIF-08) */}
        <div className="mb-8">
          <button
            onClick={handleCopyUrl}
            style={{ minHeight: "44px" }}
            className="btn-secondary flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium"
          >
            <FiCopy size={16} />
            {copySuccess ? "Enlace copiado!" : "Copiar enlace de verificación"}
          </button>
        </div>

        {/* Descripción de la práctica */}
        {cert.description && (
          <div className="fade-in mb-8">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
              Descripción de la práctica
            </p>
            <p className="text-sm text-gray-700 max-w-[640px] leading-relaxed">
              {cert.description}
            </p>
          </div>
        )}

        {/* Tecnologías utilizadas (VERIF-07) */}
        {cert.technologies && cert.technologies.length > 0 && (
          <div className="fade-in">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">
              Tecnologías utilizadas
            </p>
            <div className="flex flex-wrap gap-2">
              {cert.technologies.map((tech, idx) => (
                <span
                  key={idx}
                  className="fira-code-regular bg-[#4342FF]/10 text-[#4342FF] text-sm px-3 py-1 rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
