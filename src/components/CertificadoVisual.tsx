// src/components/CertificadoVisual.tsx
// Reproducción HTML/CSS del certificado físico de AndesCode.
// Acepta `cert: Certificate` y renderiza el layout fiel al diseño de referencia
// (ref/assets/certificado.png): logos, campos, firma, QR, marca de agua en revocados.

import type { Certificate } from "../types/certificate.ts";
import { FiCalendar, FiMonitor, FiTool, FiStar } from "react-icons/fi";
import { QRCodeSVG } from "qrcode.react";
import logoUrl from "../assets/logo/logo.png";
import wordmarkUrl from "../assets/logo/andescode-wordmark.png";
import fcefnUrl from "../assets/logo/fcefn.png";

/* ─── Props ─── */

type CertificadoVisualProps = {
  cert: Certificate;
  verificationUrl: string;
};

/* ─── Helper de formato de fecha ─── */

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ─── CertificadoVisual ─── */

export default function CertificadoVisual({ cert, verificationUrl }: CertificadoVisualProps) {
  // DNI NUNCA se renderiza (privacidad — UI-SPEC § Copywriting Contract)
  const isRevoked = cert.status === "revoked";

  return (
    <div
      className="relative overflow-hidden bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-6 p-4 shadow-[0_4px_24px_rgba(0,0,0,0.08)] fade-in"
    >
      {/* ─── Marca de agua REVOCADO (D-03) ─── */}
      {isRevoked && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <span
            className="text-[#b91c1c] font-bold select-none text-[48px] sm:text-[72px]"
            style={{ opacity: 0.25, transform: "rotate(-30deg)" }}
          >
            REVOCADO
          </span>
        </div>
      )}

      {/* ─── Fila de logos (header) ─── */}
      <div className="flex flex-row items-center justify-between mb-4">
        {/* Logo AndesCode: icono + wordmark */}
        <div className="flex flex-row items-center gap-2">
          <img
            src={logoUrl}
            alt="AndesCode"
            className="h-8 w-auto object-contain flex-shrink-0"
          />
          <img
            src={wordmarkUrl}
            alt="ANDESCODE"
            className="h-5 w-auto object-contain flex-shrink-0"
          />
        </div>
        {/* Logo FCEFN/UNSJ (fondo sólido oscuro — v1 fidelidad al diseño de referencia) */}
        <img
          src={fcefnUrl}
          alt="FCEFN UNSJ"
          className="h-10 w-auto object-contain flex-shrink-0"
        />
      </div>

      {/* ─── Divisor ─── */}
      <hr className="border-0 border-t border-[#191919] mb-4" />

      {/* ─── Bloque de título ─── */}
      <div className="text-center mb-4">
        <p
          className="text-2xl font-bold text-[#191919] leading-tight tracking-wide"
          style={{ fontSize: "28px" }}
        >
          CERTIFICADO
        </p>
        <p
          className="text-[#191919] mt-1 leading-snug"
          style={{ fontSize: "11px" }}
        >
          DE CULMINACIÓN DE PRÁCTICA PROFESIONAL SITUADA
        </p>
        <p
          className="text-[#191919] mt-2 italic"
          style={{ fontSize: "12px" }}
        >
          se certifica que
        </p>
      </div>

      {/* ─── Nombre del estudiante ─── */}
      <div className="text-center mb-4">
        <p className="uppercase font-bold text-[#191919] leading-tight text-3xl">
          {cert.studentName}
        </p>
      </div>

      {/* ─── Descripción de la práctica ─── */}
      {cert.description && (
        <p
          className="text-[#191919] text-center mb-4 leading-relaxed"
          style={{ fontSize: "12px" }}
        >
          {cert.description}
        </p>
      )}

      {/* ─── Divisor ─── */}
      <hr className="border-0 border-t border-[#191919] mb-4" />

      {/* ─── Fila de campos: 4 columnas → 2 en mobile ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">

        {/* PERÍODO */}
        <div className="flex flex-col items-start">
          <FiCalendar size={14} className="text-[#191919] mb-1" />
          <p
            className="uppercase text-[#191919] font-medium tracking-wide mb-1"
            style={{ fontSize: "10px" }}
          >
            PERÍODO
          </p>
          <p className="text-sm text-[#191919]">
            {formatDate(cert.startDate)} – {formatDate(cert.endDate)}
          </p>
        </div>

        {/* ÁREA DE DESEMPEÑO */}
        <div className="flex flex-col items-start">
          <FiMonitor size={14} className="text-[#191919] mb-1" />
          <p
            className="uppercase text-[#191919] font-medium tracking-wide mb-1"
            style={{ fontSize: "10px" }}
          >
            ÁREA DE DESEMPEÑO
          </p>
          <p className="text-sm text-[#191919]">{cert.degree}</p>
        </div>

        {/* HERRAMIENTAS */}
        <div className="flex flex-col items-start">
          <FiTool size={14} className="text-[#191919] mb-1" />
          <p
            className="uppercase text-[#191919] font-medium tracking-wide mb-1"
            style={{ fontSize: "10px" }}
          >
            HERRAMIENTAS
          </p>
          <p className="text-sm text-[#191919]">
            {cert.technologies ? cert.technologies.join(", ") : "—"}
          </p>
        </div>

        {/* CALIFICACIÓN */}
        <div className="flex flex-col items-start">
          <FiStar size={14} className="text-[#191919] mb-1" />
          <p
            className="uppercase text-[#191919] font-medium tracking-wide mb-1"
            style={{ fontSize: "10px" }}
          >
            CALIFICACIÓN
          </p>
          {cert.score !== undefined && cert.score !== null ? (
            <p className="text-sm text-[#191919]">{cert.score}/100</p>
          ) : (
            <p className="text-sm text-[#191919]">—</p>
          )}
        </div>

      </div>

      {/* ─── Divisor ─── */}
      <hr className="border-0 border-t border-[#191919] mb-4" />

      {/* ─── Fila inferior: supervisor | sello | QR ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-4">

        {/* Bloque de firma del supervisor */}
        <div className="flex flex-col items-start">
          <div
            className="border-t border-[#191919] pt-1 w-24 mb-1"
          />
          <p className="font-bold text-sm text-[#191919]">{cert.supervisorName}</p>
          <p
            className="text-[#191919]"
            style={{ fontSize: "10px" }}
          >
            Responsable de Gestión de Talento Humano
          </p>
        </div>

        {/* Sello AndesCode (logo icono, centrado) */}
        <div className="flex flex-col items-center">
          <img
            src={logoUrl}
            alt="Sello AndesCode"
            className="h-12 w-auto object-contain opacity-70"
          />
        </div>

        {/* Bloque QR */}
        <div className="flex flex-col items-center gap-1">
          <QRCodeSVG
            value={verificationUrl}
            size={100}
            level="H"
            bgColor="#FFFFFF"
            fgColor="#191919"
            marginSize={2}
          />
          <p
            className="uppercase text-gray-500 text-center tracking-wide"
            style={{ fontSize: "8px" }}
          >
            VERIFICÁ LA AUTENTICIDAD
          </p>
        </div>

      </div>

      {/* ─── Línea de pie de página: código + fecha ─── */}
      <div className="flex flex-row justify-between items-center pt-2 border-t border-[#E5E7EB]">
        <p className="fira-code-regular text-[#191919]" style={{ fontSize: "12px" }}>
          // CERTIFICADO: {cert.certificateCode}
        </p>
        <p className="text-[#191919]" style={{ fontSize: "12px" }}>
          San Juan, {formatDate(cert.issueDate)}
        </p>
      </div>

    </div>
  );
}
