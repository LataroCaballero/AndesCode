import { Link } from 'react-router-dom';
import { useRef } from 'react';
import desarrolloweb from '../assets/servicios/desarrolloweb.png';
import soporte from '../assets/servicios/soporte.png';
import automatizacion from '../assets/servicios/automatizacion.png';
import desarrolloamedida from '../assets/servicios/desarrolloamedida.png';
import desarrollowebbig from '../assets/servicios/desarrollowebbig.png';
import soportebig from '../assets/servicios/soportebig.png';
import automatizacionbig from '../assets/servicios/automatizacionbig.png';
import desarrolloamedidabig from '../assets/servicios/desarrolloamedidabig.png';

const servicios = [
  {
    titulo: 'Desarrollo Web y Mobile',
    cta: 'Quiero mi web a medida',
    descripcion: (
      <>
        <p className="mb-3 font-semibold text-[#191919]">
          Tu presencia digital, hecha a medida
        </p>
        <p className="mb-3 text-gray-700">
          No usamos plantillas. Cada sitio y app que desarrollamos está diseñado para TU negocio, TU cliente y TUS objetivos.
        </p>
        <ul className="list-disc list-inside text-left mb-4 space-y-2 text-gray-700">
          <li><span className="font-semibold">Diseño UX/UI</span> que convierte visitantes en clientes.</li>
          <li><span className="font-semibold">SEO integrado</span> desde el día uno.</li>
          <li><span className="font-semibold">E-commerce</span> con pasarelas de pago argentinas.</li>
          <li><span className="font-semibold">Apps nativas o híbridas</span> que funcionan de verdad.</li>
        </ul>
      </>
    ),
    id: 'web',
    img: desarrolloweb,
    imgbig: desarrollowebbig
  },
  {
    titulo: 'Sistemas a Medida',
    cta: 'Quiero mi sistema a medida',
    descripcion: (
      <>
        <p className="mb-3 font-semibold text-[#191919]">
          Un sistema que se adapta a vos, no al revés
        </p>
        <p className="mb-3 text-gray-700">
          Sabemos que cada negocio tiene procesos únicos. Por eso no vendemos software genérico: construimos plataformas que encajan perfecto con tu operación.
        </p>
        <ul className="list-disc list-inside text-left mb-4 space-y-2 text-gray-700">
          <li><span className="font-semibold">Relevamiento profundo</span> de tus procesos y necesidades.</li>
          <li><span className="font-semibold">Dashboards</span> con los datos que realmente importan.</li>
          <li><span className="font-semibold">Integración</span> con las herramientas que ya usás.</li>
          <li>Soluciones <span className="font-semibold">escalables</span>: crece con tu negocio.</li>
        </ul>
      </>
    ),
    id: 'sistemas',
    img: desarrolloamedida,
    imgbig: desarrolloamedidabig
  },
  {
    titulo: 'Automatización con Secretario Virtual (IA)',
    cta: 'Quiero mi Secretario Virtual',
    descripcion: (
      <>
        <p className="mb-3 text-gray-700">
          Ahorrá 3+ horas diarias. Dejá que nuestro Secretario Virtual
          por WhatsApp gestione tus turnos 24/7.
        </p>
        <ul className="list-disc list-inside text-left mb-4 space-y-2 text-gray-700">
          <li>
            <span className="font-semibold">Gestión Completa:</span> Reserva,
            cancela y reprograma turnos sin tu intervención.
          </li>
          <li>
            <span className="font-semibold">Reduce Ausentismo (60-70%):</span> Envía
            recordatorios automáticos 24hs antes.
          </li>
          <li>
            <span className="font-semibold">Disponibilidad 24/7:</span> Responde
            consultas básicas (horarios, precios) e integra todo con tu
            Google Calendar.
          </li>
        </ul>
        <p className="text-sm text-gray-600 mb-2">
          Ideal para: médicos, dentistas, psicólogos, abogados, estudios contables, peluquerías.
        </p>
        <p className="fira-code-medium text-[#191919]">
          Implementación en 48 horas.
        </p>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="fira-code-regular text-sm text-gray-700">Plan Mensual: $30.000/mes</p>
          <p className="fira-code-regular text-sm text-gray-700">Plan Anual: $240.000/año (Ahorrás $120.000)</p>
        </div>
      </>
    ),
    id: 'ia',
    img: automatizacion,
    imgbig: automatizacionbig
  },
  {
    titulo: 'Soporte y Mantenimiento',
    cta: 'Quiero soporte continuo',
    descripcion: (
      <>
        <p className="mb-3 font-semibold text-[#191919]">
          Tu tecnología, siempre funcionando
        </p>
        <p className="mb-3 text-gray-700">
          No te dejamos solos después de la entrega. Nos quedamos para que todo siga funcionando perfecto.
        </p>
        <ul className="list-disc list-inside text-left mb-4 space-y-2 text-gray-700">
          <li><span className="font-semibold">Monitoreo 24/7:</span> nos enteramos antes que vos si algo falla.</li>
          <li><span className="font-semibold">Backups automáticos:</span> tu información siempre segura.</li>
          <li><span className="font-semibold">Actualizaciones</span> de seguridad y rendimiento.</li>
          <li><span className="font-semibold">Bolsa de horas</span> para mejoras y consultoría.</li>
        </ul>
      </>
    ),
    id: 'soporte',
    img: soporte,
    imgbig: soportebig
  },
];

const Servicios = () => {
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollTo = (id: string) => {
    const section = refs.current[id];
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="text-[#191919]">
      {/* Header section */}
      <section className="relative grid-bg text-center pt-36 pb-16 px-4 overflow-hidden">
        <span className="inline-block text-xs uppercase tracking-widest text-[#4342FF] font-semibold mb-3">Lo que hacemos</span>
        <h1 className="font-bold text-3xl md:text-4xl mb-4 text-[#191919]">
          Soluciones que resuelven problemas reales
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-600">
          No importa si necesitás una web, un sistema completo o automatizar procesos: te acompañamos desde la idea hasta que esté funcionando.
        </p>
      </section>

      {/* Cards resumen — 2×2 grid */}
      <section className="bg-white py-16 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {servicios.map((servicio, index) => (
            <div
              key={index}
              className="flex flex-col rounded-xl overflow-hidden bg-white border border-gray-100 transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_24px_rgba(67,66,255,0.07)] hover:shadow-[0_8px_32px_rgba(67,66,255,0.14)] cursor-pointer"
              onClick={() => scrollTo(servicio.id)}
            >
              <div className="h-36 bg-gradient-to-br from-[#4342FF]/10 to-gray-50 flex items-center justify-center p-4">
                <img
                  src={servicio.img}
                  alt={servicio.titulo}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="flex flex-col justify-between flex-1 p-4">
                <h2 className="text-sm font-semibold mb-3 text-[#191919]">
                  {servicio.titulo}
                </h2>
                <button
                  onClick={(e) => { e.stopPropagation(); scrollTo(servicio.id); }}
                  className="text-xs text-[#4342FF] font-medium text-left border-none bg-transparent p-0 cursor-pointer hover:underline"
                >
                  Ver más →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Secciones ampliadas */}
      <section className="grid-bg py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 gap-8">
          {servicios.map((servicio) => (
            <div
              key={servicio.id}
              id={servicio.id}
              ref={(el: HTMLDivElement | null) => {
                if (el) refs.current[servicio.id] = el;
              }}
              className="flex flex-col md:flex-row rounded-xl overflow-hidden bg-white border border-gray-100 transition-all duration-300 hover:border-[#4342FF]/30 shadow-[0_4px_24px_rgba(67,66,255,0.07)] hover:shadow-[0_8px_32px_rgba(67,66,255,0.14)]"
            >
              {/* Image column */}
              <div className="h-48 md:h-auto md:w-1/3 bg-gradient-to-br from-[#4342FF]/10 to-gray-50 flex items-center justify-center p-6">
                <img
                  src={servicio.imgbig}
                  alt={servicio.titulo}
                  className="max-h-full max-w-full md:max-h-none md:w-full h-full object-contain rounded-md"
                />
              </div>

              {/* Content column */}
              <div className="flex-1 flex flex-col p-6 md:p-8 md:w-2/3">
                <h3 className="text-2xl font-bold mb-4 text-[#191919]">
                  {servicio.titulo}
                </h3>
                <div className="text-sm text-gray-700 mb-6">
                  {servicio.descripcion}
                </div>
                <div className="mt-auto">
                  <Link
                    to="/contacto"
                    className="inline-block btn-primary px-5 py-2.5 rounded-lg text-sm transition"
                  >
                    {servicio.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Servicios;
