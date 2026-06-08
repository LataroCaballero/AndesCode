// src/sections/admin/AdminCertificateForm.tsx
// Formulario de 14 campos para crear o editar un certificado.
// Se renderiza dentro de AdminCertificateDrawer.
// NO incluye el campo `status` — el estado se cambia desde la lista con confirmación.
import { useState, useEffect } from 'react';
import { FiAlertCircle, FiX } from 'react-icons/fi';
import { pb } from '../../services/pb';
import type { Certificate } from '../../types/certificate';
import TagsInput from '../../components/TagsInput';

interface AdminCertificateFormProps {
  mode: 'create' | 'edit';
  record: Certificate | null;
  initialCode?: string;
  onClose: () => void;
  onSaved: () => void;
}

/* ─── Estado del formulario (14 campos editables, excluye status) ─── */
interface FormState {
  certificateCode: string;
  studentName: string;
  dni: string;
  university: string;
  degree: string;
  startDate: string;
  endDate: string;
  issueDate: string;
  score: string;
  technologies: string[];
  competencies: string[];
  description: string;
  supervisorName: string;
}

/* ─── Campos requeridos — exactamente los definidos en REQUIREMENTS.md ─── */
const requiredFields: (keyof FormState)[] = [
  'certificateCode',
  'studentName',
  'dni',
  'university',
  'degree',
  'startDate',
  'endDate',
  'issueDate',
  'supervisorName',
];

function buildInitialState(record: Certificate | null, initialCode?: string): FormState {
  if (record) {
    // Modo edición: pre-poblar desde el record existente
    return {
      certificateCode: record.certificateCode ?? '',
      studentName: record.studentName ?? '',
      dni: record.dni ?? '',
      university: record.university ?? '',
      degree: record.degree ?? '',
      startDate: record.startDate ?? '',
      endDate: record.endDate ?? '',
      issueDate: record.issueDate ?? '',
      score: record.score != null ? String(record.score) : '',
      technologies: record.technologies ?? [],
      competencies: record.competencies ?? [],
      description: record.description ?? '',
      supervisorName: record.supervisorName ?? '',
    };
  }
  // Modo creación: vacío, código pre-generado por el orquestador
  return {
    certificateCode: initialCode ?? '',
    studentName: '',
    dni: '',
    university: '',
    degree: '',
    startDate: '',
    endDate: '',
    issueDate: '',
    score: '',
    technologies: [],
    competencies: [],
    description: '',
    supervisorName: '',
  };
}

export default function AdminCertificateForm({
  mode,
  record,
  initialCode,
  onClose,
  onSaved,
}: AdminCertificateFormProps) {
  const [form, setForm] = useState<FormState>(() =>
    buildInitialState(record, initialCode)
  );
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Si el orquestador actualiza initialCode (nuevo código generado), actualizar el estado
  useEffect(() => {
    if (mode === 'create' && initialCode) {
      setForm(f => ({ ...f, certificateCode: initialCode }));
    }
  }, [initialCode, mode]);

  /* ─── Helper para actualizar un campo simple ─── */
  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    // Limpiar error del campo al modificarlo
    if (fieldErrors[key]) {
      setFieldErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  /* ─── Submit: validación client-side → pb.create / pb.update ─── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    // Validación de campos requeridos (T-03-VALIDATION)
    const missing = requiredFields.filter(f => !form[f] || String(form[f]).trim() === '');
    if (missing.length > 0) {
      const errors: Partial<Record<keyof FormState, string>> = {};
      missing.forEach(f => { errors[f] = 'Este campo es requerido'; });
      setFieldErrors(errors);
      return; // NO llamar a PocketBase si falta algún campo
    }

    setSaving(true);
    try {
      const data = {
        certificateCode: form.certificateCode.trim(),
        studentName: form.studentName.trim(),
        dni: form.dni.trim(),
        university: form.university.trim(),
        degree: form.degree.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        issueDate: form.issueDate,
        score: form.score !== '' ? parseFloat(form.score) : null,
        technologies: form.technologies,
        competencies: form.competencies,
        description: form.description.trim() || null,
        supervisorName: form.supervisorName.trim(),
      };

      if (mode === 'create') {
        await pb.collection('certificates').create(data);
      } else {
        await pb.collection('certificates').update(record!.id, data);
      }

      onSaved();
    } catch (err) {
      // Verificar si es error de código duplicado (T-03-UNIQUE)
      const pbErr = err as { data?: { certificateCode?: { code?: string } } };
      if (pbErr?.data?.certificateCode?.code === 'validation_not_unique') {
        setSaveError('El código ya existe. Modificá el código e intentá de nuevo.');
      } else {
        setSaveError('Error al guardar. Intentá de nuevo.');
      }
    } finally {
      setSaving(false);
    }
  };

  /* ─── Clases de campo con o sin error ─── */
  const inputClass = (field: keyof FormState) =>
    [
      'border rounded-lg px-4 py-3 text-sm focus:outline focus:outline-2 focus:outline-[var(--color-primary)] transition min-h-[44px] w-full',
      fieldErrors[field] ? 'border-red-400' : 'border-gray-300',
    ].join(' ');

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ─── Encabezado del drawer ─── */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between z-10">
        <h2 className="text-xl font-semibold text-[#191919]">
          {mode === 'create' ? 'Nuevo certificado' : 'Editar certificado'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-[#191919] transition"
          aria-label="Cerrar drawer"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* ─── Cuerpo del formulario — grilla de 2 columnas ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 px-6 py-6">

        {/* ── Columna izquierda: info del estudiante ── */}

        {/* studentName */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[#191919]">
            Nombre completo del estudiante
            <span className="text-red-500 ml-1">*</span>
          </span>
          <input
            type="text"
            value={form.studentName}
            onChange={e => setField('studentName', e.target.value)}
            className={inputClass('studentName')}
          />
          {fieldErrors.studentName && (
            <span className="text-red-600 text-xs mt-1">{fieldErrors.studentName}</span>
          )}
        </label>

        {/* certificateCode — columna derecha */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[#191919]">
            Código del certificado
            <span className="text-red-500 ml-1">*</span>
          </span>
          <input
            type="text"
            value={form.certificateCode}
            onChange={e => setField('certificateCode', e.target.value)}
            placeholder="AC-2026-001"
            className={`${inputClass('certificateCode')} fira-code-regular`}
          />
          {fieldErrors.certificateCode && (
            <span className="text-red-600 text-xs mt-1">{fieldErrors.certificateCode}</span>
          )}
        </label>

        {/* dni */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[#191919]">
            DNI
            <span className="text-red-500 ml-1">*</span>
          </span>
          <input
            type="text"
            value={form.dni}
            onChange={e => setField('dni', e.target.value)}
            className={inputClass('dni')}
          />
          {fieldErrors.dni && (
            <span className="text-red-600 text-xs mt-1">{fieldErrors.dni}</span>
          )}
        </label>

        {/* issueDate — columna derecha */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[#191919]">
            Fecha de emisión
            <span className="text-red-500 ml-1">*</span>
          </span>
          <input
            type="date"
            value={form.issueDate}
            onChange={e => setField('issueDate', e.target.value)}
            className={inputClass('issueDate')}
          />
          {fieldErrors.issueDate && (
            <span className="text-red-600 text-xs mt-1">{fieldErrors.issueDate}</span>
          )}
        </label>

        {/* university */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[#191919]">
            Universidad / Facultad
            <span className="text-red-500 ml-1">*</span>
          </span>
          <input
            type="text"
            value={form.university}
            onChange={e => setField('university', e.target.value)}
            className={inputClass('university')}
          />
          {fieldErrors.university && (
            <span className="text-red-600 text-xs mt-1">{fieldErrors.university}</span>
          )}
        </label>

        {/* startDate — columna derecha */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[#191919]">
            Inicio de la práctica
            <span className="text-red-500 ml-1">*</span>
          </span>
          <input
            type="date"
            value={form.startDate}
            onChange={e => setField('startDate', e.target.value)}
            className={inputClass('startDate')}
          />
          {fieldErrors.startDate && (
            <span className="text-red-600 text-xs mt-1">{fieldErrors.startDate}</span>
          )}
        </label>

        {/* degree */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[#191919]">
            Área de desempeño
            <span className="text-red-500 ml-1">*</span>
          </span>
          <input
            type="text"
            value={form.degree}
            onChange={e => setField('degree', e.target.value)}
            className={inputClass('degree')}
          />
          {fieldErrors.degree && (
            <span className="text-red-600 text-xs mt-1">{fieldErrors.degree}</span>
          )}
        </label>

        {/* endDate — columna derecha */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[#191919]">
            Fin de la práctica
            <span className="text-red-500 ml-1">*</span>
          </span>
          <input
            type="date"
            value={form.endDate}
            onChange={e => setField('endDate', e.target.value)}
            className={inputClass('endDate')}
          />
          {fieldErrors.endDate && (
            <span className="text-red-600 text-xs mt-1">{fieldErrors.endDate}</span>
          )}
        </label>

        {/* supervisorName */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[#191919]">
            Supervisor
            <span className="text-red-500 ml-1">*</span>
          </span>
          <input
            type="text"
            value={form.supervisorName}
            onChange={e => setField('supervisorName', e.target.value)}
            className={inputClass('supervisorName')}
          />
          {fieldErrors.supervisorName && (
            <span className="text-red-600 text-xs mt-1">{fieldErrors.supervisorName}</span>
          )}
        </label>

        {/* score — columna derecha (opcional) */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[#191919]">Calificación</span>
          <input
            type="number"
            value={form.score}
            onChange={e => setField('score', e.target.value)}
            min={0}
            max={10}
            step={0.1}
            placeholder="0 – 10"
            className={inputClass('score')}
          />
        </label>

        {/* description — ancho completo */}
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-sm font-medium text-[#191919]">Descripción de la práctica</span>
          <textarea
            value={form.description}
            onChange={e => setField('description', e.target.value)}
            rows={3}
            className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline focus:outline-2 focus:outline-[var(--color-primary)] transition w-full resize-y"
            style={{ minHeight: '80px' }}
          />
        </label>

        {/* technologies — ancho completo */}
        <div className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-sm font-medium text-[#191919]">Tecnologías utilizadas</span>
          <TagsInput
            value={form.technologies}
            onChange={tags => setField('technologies', tags)}
            placeholder="Escribí una tecnología y presioná Enter"
          />
        </div>

        {/* competencies — ancho completo */}
        <div className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-sm font-medium text-[#191919]">Competencias</span>
          <TagsInput
            value={form.competencies}
            onChange={tags => setField('competencies', tags)}
            placeholder="Escribí una competencia y presioná Enter"
          />
        </div>
      </div>

      {/* ─── Error general de guardado (encima del footer) ─── */}
      {saveError && (
        <div className="mx-6 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
          <FiAlertCircle size={16} className="flex-shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* ─── Footer con botones ─── */}
      <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary min-h-[44px] px-6 text-sm rounded-lg"
        >
          Cerrar sin guardar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary min-h-[44px] px-6 text-sm rounded-lg flex items-center justify-center gap-2"
          style={saving ? { opacity: 0.7 } : undefined}
        >
          {saving ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Guardando…
            </>
          ) : (
            'Guardar certificado'
          )}
        </button>
      </div>
    </form>
  );
}
