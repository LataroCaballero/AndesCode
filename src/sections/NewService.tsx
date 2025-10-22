import { Link } from "react-router-dom";

export default function NewService() {
  return (
    <section className="text-center px-4 min-h-screen;">
        <div className="bg-[#191919] dark:bg-white rounded-lg p-6 max-w-3xl">
      <h2 className="text-white dark:text-[#191919] fira-code-bold text-3xl md:text-4xl mb-4">
        Conocé nuestro nuevo servicio
      </h2>
      <p className="text-sm text-white dark:text-[#191919] max-w-xl mx-auto mb-6">
      Automatizá la gestión de tu agenda. Nuestro bot gestiona tus turnos 24/7, envía recordatorios automáticos y se integra con tu Google Calendar. Liberá 3+ horas de tu día y reducí el ausentismo drásticamente.
      </p>
      <Link to="/trabajos">
        <button className="fira-code-regular bg-[#191919] text-white px-6 py-2 rounded dark-button">
        Conocer más sobre el Secretario Virtual
        </button>
      </Link>
      </div>
    </section>
  );
}