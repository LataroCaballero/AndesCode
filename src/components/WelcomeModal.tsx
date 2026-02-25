// src/components/WelcomeModal.tsx
import { Link } from 'react-router-dom';

type WelcomeModalProps = {
  onClose: () => void;
};

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
  const handleNavigate = () => {
    onClose();
    setTimeout(() => {
      document.getElementById('ia')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm fade-in"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-lg p-6 rounded-xl bg-white border border-gray-100 slide-up text-left shadow-[0_8px_40px_rgba(67,66,255,0.18)]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-gray-400 hover:bg-gray-100 rounded-full border-none"
          aria-label="Cerrar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h4 className="text-xs uppercase tracking-widest text-[#4342FF] font-semibold mb-2">
          Nuevo Servicio Destacado
        </h4>
        <h3 className="text-2xl font-bold mb-3 text-[#191919]">
          Secretario Virtual por WhatsApp
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Automatizá tu agenda 24/7. Nuestro bot gestiona tus turnos, envía
          recordatorios automáticos y se integra con tu Google Calendar. Liberá
          3+ horas de tu día.
        </p>

        <Link to="/servicios" onClick={handleNavigate}>
          <button className="btn-primary fira-code-regular px-5 py-2.5 rounded-lg text-sm transition">
            Conocer más
          </button>
        </Link>
      </div>
    </div>
  );
}
