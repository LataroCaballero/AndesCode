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
    descripcion: (
      <>
        <p className="mb-3 dark:text-white">
          Diseñamos y desarrollamos sitios web y apps m&oacute;viles responsivas, veloces y listas para escalar.
        </p>
        <ul className="list-disc list-inside text-left mb-4 space-y-2 dark:text-white">
          <li><span className="font-semibold">Diseño UX/UI</span> centrado en el usuario.</li>
          <li><span className="font-semibold">Optimización SEO</span> para mejor visibilidad.</li>
          <li><span className="font-semibold">Integración</span> con E-commerce y pasarelas de pago.</li>
          <li><span className="font-semibold">Desarrollo M&oacute;vil</span> Nativo o Híbrido.</li>
        </ul>
      </>
    ),
    id: 'web',
    img: desarrolloweb,
    imgbig: desarrollowebbig
  },
  {
    titulo: 'Sistemas a Medida',
    descripcion: (
      <>
        <p className="mb-3 dark:text-white">
          Creamos plataformas &uacute;nicas adaptadas a tus procesos espec&iacute;ficos para optimizar tu negocio.
        </p>
        <ul className="list-disc list-inside text-left mb-4 space-y-2 dark:text-white">
          <li><span className="font-semibold">An&aacute;lisis</span> de requerimientos y flujos de trabajo.</li>
          <li><span className="font-semibold">Dashboards</span> de gesti&oacute;n y reportes.</li>
          <li><span className="font-semibold">Integraci&oacute;n</span> con APIs y servicios de terceros.</li>
          <li>Soluciones <span className="font-semibold">Escalables</span> y seguras.</li>
        </ul>
      </>
    ),
    id: 'sistemas',
    img: desarrolloamedida,
    imgbig: desarrolloamedidabig
  },
  {
    titulo: 'Automatización con Secretario Virtual (IA)',
    descripcion: (
      <>
        <p className="mb-3 dark:text-white">
          Ahorrá 3+ horas diarias. Dejá que nuestro Secretario Virtual
          por WhatsApp gestione tus turnos 24/7.
        </p>
        <ul className="list-disc list-inside text-left mb-4 space-y-2 dark:text-white">
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
        <p className="fira-code-medium dark:text-white">
          Implementación en 48 horas.
        </p>
        {/* Sección de Precios (basado en tu PDF) */}
        <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
          <p className="fira-code-regular text-sm dark:text-white">Plan Mensual: $30.000/mes</p>
          <p className="fira-code-regular text-sm dark:text-white">Plan Anual: $240.000/año (Ahorrás $120.000)</p>
        </div>
      </>
    ),
    id: 'ia',
    img: automatizacion,
    imgbig: automatizacionbig
  },
  {
    titulo: 'Soporte y Mantenimiento',
    descripcion: (
      <>
        <p className="mb-3 dark:text-white">
          Te acompa&ntilde;amos a largo plazo con mejoras, correcci&oacute;n de errores y asistencia t&eacute;cnica continua.
        </p>
        <ul className="list-disc list-inside text-left mb-4 space-y-2 dark:text-white">
          <li><span className="font-semibold">Monitoreo 24/7</span> y alertas proactivas.</li>
          <li><span className="font-semibold">Backups</span> y recuperaci&oacute;n de desastres.</li>
          <li><span className="font-semibold">Actualizaciones</span> de seguridad y performance.</li>
          <li><span className="font-semibold">Bolsa de horas</span> para consultor&iacute;a y mejoras.</li>
        </ul>
      </>
    ),
    id: 'soporte',
    img: soporte,
    imgbig: soportebig
  },
];

const Servicios = () => {
    // Crear refs dinámicos por id
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollTo = (id: string) => {
    const section = refs.current[id];
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <main className="text-ink">
      <section className="text-center pt-30 py-16 px-4 dark:text-white">
        <h2 className="fira-code-bold text-3xl md:text-4xl mb-4">
        Servicios que impulsan tu negocio
        </h2>
        <p className="max-w-2xl mx-auto text-lg">
          Desde el diseño hasta el despliegue, AndesCode te acompaña en todo el<br/>proceso de construcción de tu producto digital.
        </p>
      </section>

      {/* Cards resumen */}
      <section className="flex flex-wrap justify-center gap-6 px-4 pb-16 dark:text-white">
        {servicios.map((servicio, index) => (
          <div
            key={index}
            className="w-64 h-[300px] flex flex-col rounded-md overflow-hidden shadow-md bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out hover:scale-[1.03] hover:shadow-xl"
          >
            <div className="h-36 bg-ink flex items-center justify-center">
              <img
                src={servicio.img}
                alt={servicio.titulo}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex flex-col justify-between h-44 p-4">
              <h2 className="text-md fira-code-medium mb-2">
                {servicio.titulo}
              </h2>
              <button
                onClick={() => scrollTo(servicio.id)}
                className="text-sm fira-code-semibold dark:text-white"
              >
                Ver más ›
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Secciones ampliadas */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        
        {/* 1. Cambiamos a 'grid-cols-1' para que las cards horizontales se apilen */}
        <div className="grid grid-cols-1 gap-10"> 
          
          {servicios.map((servicio) => (
            <div
              key={servicio.id}
              id={servicio.id} // El ID para el scroll-to
              ref={(el: HTMLDivElement | null) => {
                if (el) {
                  refs.current[servicio.id] = el;
                }
              }}
              // 2. Esta es la magia: 'flex-col' en móvil, 'md:flex-row' en desktop
              className="flex flex-col md:flex-row rounded-lg overflow-hidden bg-white dark:bg-[#2A2A2A] shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-primary dark:hover:border-accent"
            >
              {/* 3. Columna de Imagen (1/3 de ancho en desktop) */}
              <div className="h-48 md:h-auto md:w-1/3 bg-ink flex items-center justify-center p-4">
                <img
                  src={servicio.imgbig} // Usamos la imagen "big"
                  alt={servicio.titulo}
                  className="max-h-full max-w-full md:max-h-none md:w-full h-full object-contain rounded-md"
                />
              </div>
              
              {/* 4. Columna de Contenido (2/3 de ancho en desktop) */}
              <div className="flex-1 flex flex-col p-6 md:w-2/3">
                <h3 className="text-2xl fira-code-semibold mb-4 dark:text-white">
                  {servicio.titulo}
                </h3>
                {/* Renderiza el JSX de la descripción */}
                <div className="text-sm text-ink dark:text-gray-300 mb-6">
                  {servicio.descripcion}
                </div>
                
                {/* 5. Botón CTA (se queda abajo) */}
                <div className="mt-auto">
                  <Link
                    to="/contacto"
                    className="fira-code-regular inline-block bg-primary text-white px-5 py-2 rounded transition hover:bg-primary/90"
                  >
                    Me interesa
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