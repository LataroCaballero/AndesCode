// src/sections/admin/AdminCertificateDrawer.tsx
// Drawer deslizante desde la derecha para crear o editar un certificado.
// Usa framer-motion AnimatePresence para animación de entrada y salida.
// IMPORTANTE: importar de 'framer-motion' — el paquete instalado es framer-motion, no motion.
import { motion, AnimatePresence } from 'framer-motion';
import type { Certificate } from '../../types/certificate';
import AdminCertificateForm from './AdminCertificateForm';

interface AdminCertificateDrawerProps {
  open: boolean;
  mode: 'create' | 'edit';
  record: Certificate | null;
  initialCode?: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function AdminCertificateDrawer({
  open,
  mode,
  record,
  initialCode,
  onClose,
  onSaved,
}: AdminCertificateDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Fondo semitransparente — click cierra el drawer */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/30 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Panel del drawer — desliza desde la derecha */}
          <motion.div
            key="drawer"
            className="fixed right-0 top-0 h-full w-full max-w-[600px] bg-white shadow-2xl z-50 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
          >
            <AdminCertificateForm
              mode={mode}
              record={record}
              initialCode={initialCode}
              onClose={onClose}
              onSaved={onSaved}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
