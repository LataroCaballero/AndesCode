// src/hooks/usePdfGenerator.ts
// Hook para generar y descargar el certificado como PDF con jsPDF.
// Carga las fuentes Inter auto-alojadas via Vite ?url, genera el QR con
// el paquete headless `qrcode` (no qrcode.react), y ensambla el PDF
// fiel al diseño de referencia (ref/assets/certificado.png).
// Los métodos vulnerables de jsPDF (CVE-2026-25755 / CVE-2026-31898) NO se usan.
// El campo DNI del certificado NUNCA se incluye en el PDF (privacidad pública).

import { useState, useCallback } from "react";
import type { Certificate } from "../types/certificate.ts";
import { jsPDF, GState } from "jspdf";
import QRCode from "qrcode";
// Importaciones ?url de fuentes TTF auto-alojadas — QRPDF-05
// La declaración en vite-env.d.ts cubre '*.ttf?url' para TypeScript strict mode
import interRegularUrl from "../assets/fonts/Inter-Regular.ttf?url";
import interBoldUrl from "../assets/fonts/Inter-Bold.ttf?url";
// Logos como URLs procesadas por Vite (se hace fetch al momento de generar)
import andescodeWordmarkUrl from "../assets/logo/andescode-wordmark.png";
import fcefnLogoUrl from "../assets/logo/fcefn.png";

/* ─── Tipo de retorno ─── */

interface UsePdfGeneratorResult {
  generate: (cert: Certificate, verificationUrl: string) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

/* ─── Helper: ArrayBuffer → base64 en chunks ─── */

// CRÍTICO: El método btoa+spread en un Uint8Array completo supera el call stack
// para fuentes de 65KB+. Se usan chunks de 8192 bytes (RESEARCH Pattern 1).
function arrayBufferToBase64(buf: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

/* ─── Helper: fetch URL → base64 ─── */

async function fetchToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Asset fetch failed: ${res.status} ${res.statusText} — ${url}`);
  }
  const buf = await res.arrayBuffer();
  return arrayBufferToBase64(buf);
}

/* ─── Helper: formatear fecha en español ─── */

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

/* ─── usePdfGenerator ─── */

export function usePdfGenerator(): UsePdfGeneratorResult {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (cert: Certificate, verificationUrl: string): Promise<void> => {
      setIsGenerating(true);
      setError(null);

      try {
        /* ─── Carga paralela: fuentes + QR + logos ─── */

        // Esperamos todo antes de ensamblar el PDF (RESEARCH Pitfall 6 — race condition)
        const [
          base64Regular,
          base64Bold,
          qrDataUrl,
          base64Wordmark,
          base64Fcefn,
        ] = await Promise.all([
          fetchToBase64(interRegularUrl),
          fetchToBase64(interBoldUrl),
          QRCode.toDataURL(verificationUrl, {
            errorCorrectionLevel: "H",
            width: 200,
            margin: 2,
            color: { dark: "#191919", light: "#ffffff" },
          }),
          fetchToBase64(andescodeWordmarkUrl),
          fetchToBase64(fcefnLogoUrl),
        ]);

        /* ─── Inicializar jsPDF — A4 apaisado ─── */

        const doc = new jsPDF({ orientation: "l", unit: "mm", format: "a4" });
        const pageW = doc.internal.pageSize.getWidth();   // 297mm
        const pageH = doc.internal.pageSize.getHeight();  // 210mm
        const margin = 15;

        /* ─── Registrar fuentes Inter auto-alojadas ─── */

        doc.addFileToVFS("Inter-Regular.ttf", base64Regular);
        doc.addFont("Inter-Regular.ttf", "Inter", "normal");
        doc.addFileToVFS("Inter-Bold.ttf", base64Bold);
        doc.addFont("Inter-Bold.ttf", "Inter", "bold");

        /* ─── Layout — posición Y dinámica ─── */

        let y = margin;

        /* ─── 1. Fila de logos ─── */

        // Logo AndesCode wordmark — arriba izquierda (35mm × 12mm)
        doc.addImage(base64Wordmark, "PNG", margin, y, 35, 12);
        // Logo FCEFN — arriba derecha (25mm × 12mm)
        doc.addImage(base64Fcefn, "PNG", pageW - margin - 25, y, 25, 12);

        y += 16;

        /* ─── 2. Línea divisora ─── */

        doc.setDrawColor(25, 25, 25);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageW - margin, y);
        y += 6;

        /* ─── 3. Bloque de título ─── */

        doc.setFont("Inter", "bold");
        doc.setFontSize(22);
        doc.setTextColor(25, 25, 25);
        doc.text("CERTIFICADO", pageW / 2, y, { align: "center" });
        y += 7;

        doc.setFont("Inter", "normal");
        doc.setFontSize(9);
        doc.text(
          "DE CULMINACIÓN DE PRÁCTICA PROFESIONAL SITUADA",
          pageW / 2,
          y,
          { align: "center" }
        );
        y += 5;

        doc.setFont("Inter", "normal");
        doc.setFontSize(9);
        doc.text("se certifica que", pageW / 2, y, { align: "center" });
        y += 7;

        /* ─── 4. Nombre del estudiante — all-caps, grande ─── */

        doc.setFont("Inter", "bold");
        doc.setFontSize(18);
        doc.text(cert.studentName.toUpperCase(), pageW / 2, y, {
          align: "center",
        });
        y += 8;

        /* ─── 5. Descripción ─── */

        if (cert.description) {
          doc.setFont("Inter", "normal");
          doc.setFontSize(8);
          const maxWidth = pageW - margin * 2;
          const lines = doc.splitTextToSize(cert.description, maxWidth);
          doc.text(lines, margin, y);
          y += lines.length * 4.5;
        }

        y += 2;

        /* ─── 6. Línea divisora ─── */

        doc.setDrawColor(25, 25, 25);
        doc.line(margin, y, pageW - margin, y);
        y += 5;

        /* ─── 7. Fila de 4 columnas de campos ─── */

        const colW = (pageW - margin * 2) / 4;
        doc.setFont("Inter", "normal");
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);

        // Etiquetas
        doc.text("PERÍODO", margin, y);
        doc.text("ÁREA DE DESEMPEÑO", margin + colW, y);
        doc.text("HERRAMIENTAS", margin + colW * 2, y);
        doc.text("CALIFICACIÓN", margin + colW * 3, y);

        y += 4.5;

        // Valores
        doc.setFont("Inter", "normal");
        doc.setFontSize(9);
        doc.setTextColor(25, 25, 25);

        const period = `${formatDate(cert.startDate)} – ${formatDate(cert.endDate)}`;
        const periodLines = doc.splitTextToSize(period, colW - 3);
        doc.text(periodLines, margin, y);

        const areaText = cert.degree || "—";
        const areaLines = doc.splitTextToSize(areaText, colW - 3);
        doc.text(areaLines, margin + colW, y);

        const toolsText =
          cert.technologies && cert.technologies.length > 0
            ? cert.technologies.join(", ")
            : "—";
        const toolsLines = doc.splitTextToSize(toolsText, colW - 3);
        doc.text(toolsLines, margin + colW * 2, y);

        const scoreText =
          cert.score !== undefined && cert.score !== null
            ? `${cert.score}/100`
            : "—";
        doc.text(scoreText, margin + colW * 3, y);

        const maxRowLines = Math.max(
          periodLines.length,
          areaLines.length,
          toolsLines.length,
          1
        );
        y += maxRowLines * 4.5 + 3;

        /* ─── 8. Línea divisora ─── */

        doc.setDrawColor(25, 25, 25);
        doc.line(margin, y, pageW - margin, y);
        y += 5;

        /* ─── 9. Fila inferior: supervisor + sello + QR ─── */

        const bottomRowY = pageH - margin - 30;
        const qrX = pageW - margin - 30;
        const qrY = bottomRowY;

        // Supervisor — izquierda
        doc.setFont("Inter", "normal");
        doc.setFontSize(8);
        doc.setTextColor(25, 25, 25);
        doc.line(margin, bottomRowY + 8, margin + 35, bottomRowY + 8);
        doc.setFont("Inter", "bold");
        doc.setFontSize(9);
        doc.text(cert.supervisorName, margin, bottomRowY + 12);
        doc.setFont("Inter", "normal");
        doc.setFontSize(8);
        doc.text(
          "Responsable de Gestión de Talento Humano",
          margin,
          bottomRowY + 17
        );

        // Sello AndesCode — centro
        const sealSize = 20;
        const sealX = pageW / 2 - sealSize / 2;
        doc.addImage(base64Wordmark, "PNG", sealX, bottomRowY, sealSize, sealSize * 0.34);

        // QR — derecha (30mm × 30mm)
        doc.addImage(qrDataUrl, "PNG", qrX, qrY, 30, 30);
        doc.setFont("Inter", "normal");
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        doc.text("VERIFICÁ LA AUTENTICIDAD", qrX + 15, qrY + 33, {
          align: "center",
        });

        /* ─── 10. Línea de pie de página ─── */

        const footerY = pageH - margin + 2;
        doc.setFont("Inter", "normal");
        doc.setFontSize(8);
        doc.setTextColor(25, 25, 25);
        doc.text(
          `// CERTIFICADO: ${cert.certificateCode}`,
          margin,
          footerY
        );
        doc.text(
          `San Juan, ${formatDate(cert.issueDate)}`,
          pageW - margin,
          footerY,
          { align: "right" }
        );

        /* ─── Marca de agua REVOCADO ─── */

        if (cert.status === "revoked") {
          doc.saveGraphicsState();
          doc.setGState(new GState({ opacity: 0.25 }));
          doc.setTextColor(185, 28, 28);
          doc.setFont("Inter", "bold");
          doc.setFontSize(60);
          // angle en jsPDF: grados en sentido antihorario (PDF coordinate system)
          // 45 grados produce diagonal de esquina inferior-izquierda a superior-derecha
          doc.text("REVOCADO", pageW / 2, pageH / 2, {
            angle: 45,
            align: "center",
          });
          doc.restoreGraphicsState();
        }

        /* ─── Guardar y descargar ─── */

        doc.save(`certificado-${cert.certificateCode}.pdf`);
      } catch (_err) {
        setError("No se pudo generar el PDF. Intentá de nuevo.");
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  return { generate, isGenerating, error };
}
