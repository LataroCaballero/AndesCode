// src/components/WelcomeModal.tsx
import { Link } from 'react-router-dom';

// Definimos las props que recibirá el componente, incluida la función para cerrarlo
type WelcomeModalProps = {
  onClose: () => void;
};

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
  
  // Función para manejar el clic en el botón "Conocer más"
  const handleNavigate = () => {
    onClose(); // Cierra el modal
    
    // Navega a /servicios y scrollea a la sección 'ia' después de un breve delay
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
      {/* Fondo (Backdrop) */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose} // Cierra el modal al hacer clic fuera
      />

      {/* Contenido del Modal */}
      <div className="relative z-10 w-full max-w-lg p-6 rounded-lg bg-white dark:bg-[#2a2a2a] animate-slideUp text-left dark:text-white  shadow-[#4342FF]/20 dark:shadow-[#4342FF]/30 shadow-[0_0_30px_0px_var(--tw-shadow-color)]">
        
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          aria-label="Cerrar"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {/* ====================================================== */}
        
        {/* Contenido del servicio */}
        <h4 className="fira-code-semibold text-lg text-primary dark:text-accent mb-2">
          Nuevo Servicio Destacado
        </h4>
        <h3 className="text-2xl font-bold mb-3">
          Secretario Virtual por WhatsApp
        </h3>
        <p className="text-sm dark:text-gray-300 mb-6">
          Automatizá tu agenda 24/7. Nuestro bot gestiona tus turnos, envía
          recordatorios automáticos y se integra con tu Google Calendar. Liberá
          3+ horas de tu día.
        </p>
        
        {/* Botón de acción */}
        <Link to="/servicios" onClick={handleNavigate}>
          <button className="fira-code-regular bg-primary px-5 py-2 rounded transition hover:bg-primary/90 dark:border-white">
            Conocer más
          </button>
        </Link>
      </div>
    </div>
  );
}