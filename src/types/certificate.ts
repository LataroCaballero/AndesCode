// src/types/certificate.ts
// Tipo de dato para la colección `certificates` de PocketBase.
// Refleja exactamente el esquema de pb_migrations/1780790669_create_certificates.js.

/* ─── Tipo Certificate ─── */

export interface Certificate {
  // Campos del sistema (retornados por el SDK de PocketBase en todo record)
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;

  // Campos del esquema de la colección (14 campos — INFRA-04)
  certificateCode: string;
  studentName: string;
  /** DNI presente en el esquema pero NUNCA renderizado en la página pública (privacidad). */
  dni: string;
  university: string;
  degree: string;
  startDate: string;
  endDate: string;
  issueDate: string;
  score?: number;
  /** Array de strings de tags libres almacenado como JSON en PocketBase. */
  technologies?: string[];
  /** Array de strings de tags libres almacenado como JSON en PocketBase. */
  competencies?: string[];
  description?: string;
  supervisorName: string;
  status: "active" | "revoked";
}

/* ─── Helper: normalizeCertificateCode ─── */

/**
 * Normaliza un código de certificado a su forma canónica `XX-XXXX-XXX`.
 *
 * Ejemplos:
 *   normalizeCertificateCode('ac2025001')     → 'AC-2025-001'
 *   normalizeCertificateCode('AC-2025-001')   → 'AC-2025-001'
 *   normalizeCertificateCode('  Ac-2025-001 ') → 'AC-2025-001'
 *
 * Reglas (VERIF-02):
 *  1. Recortar espacios en blanco (trim)
 *  2. Convertir todo a mayúsculas
 *  3. Eliminar todos los guiones
 *  4. Reinsertar guiones como XX-XXXX-XXX (2 chars, guion, 4 chars, guion, resto)
 *
 * Si el string resultante tiene menos de 6 caracteres, retorna la
 * forma con guiones que sea posible sin lanzar error (el componente
 * de detalle resolverá el estado "no encontrado").
 */
export function normalizeCertificateCode(raw: string): string {
  // Paso 1: trim
  const trimmed = raw.trim();
  // Paso 2: mayúsculas
  const upper = trimmed.toUpperCase();
  // Paso 3: eliminar todos los guiones
  const stripped = upper.replace(/-/g, "");

  // Paso 4: reinsertar como XX-XXXX-XXX
  const part1 = stripped.slice(0, 2);
  const part2 = stripped.slice(2, 6);
  const part3 = stripped.slice(6);

  const parts = [part1, part2, part3].filter(Boolean);
  return parts.join("-");
}
