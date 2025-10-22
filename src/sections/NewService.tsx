import { Link } from "react-router-dom";

export default function NewService() {
  return (
    <div className="max-w-2xl mx-auto mt-16 p-6 rounded-lg bg-gray-100 dark:bg-inkContrast shadow-lg text-left dark:text-white">
        <h4 className="fira-code-semibold text-lg text-primary dark:text-accent mb-2">
          Nuevo Servicio Destacado
        </h4>
        <h3 className="text-2xl font-bold mb-3">
          Secretario Virtual por WhatsApp
        </h3>
        <p className="text-sm dark:text-gray-300 mb-5">
          Automatizá tu agenda 24/7. Nuestro bot gestiona tus turnos, 
          envía recordatorios automáticos y se integra con tu Google Calendar. 
          Liberá 3+ horas de tu día.
        </p>
        <Link to="/servicios" onClick={() => {
            // Esto navega a /servicios y scrollea hasta la sección 'ia'
            setTimeout(() => {
              document.getElementById('ia')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}>
          <button className="fira-code-regular bg-primary text-white px-5 py-2 rounded transition hover:bg-primary/90">
            Conocer más
          </button>
        </Link>
      </div>
  );
}