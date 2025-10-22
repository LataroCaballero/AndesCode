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
    descripcion: 'Diseñamos y desarrollamos sitios web y aplicaciones móviles responsivas, veloces y listas para escalar. Desde una landing hasta un sistema completo.',
    id: 'web',
    img: desarrolloweb,
    imgbig: desarrollowebbig
  },
  {
    titulo: 'Sistemas a Medida',
    descripcion: 'Creamos plataformas únicas adaptadas a procesos específicos: desde gestión interna hasta herramientas de uso masivo, pensadas para optimizar tu negocio.',
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
    descripcion: 'Acompañamos a largo plazo con mejoras, corrección de errores, backups, monitoreo y asistencia técnica continua.',
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
            className="w-64 h-[300px] flex flex-col rounded-md overflow-hidden shadow-md bg-[#f4f4f4] dark:bg-[#2A2A2A]"
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
      {servicios.map((servicio, index) => (
        <div
          key={index}
          ref={(el: HTMLDivElement | null) => {
            if (el) {
              refs.current[servicio.id] = el;
            }
          }}
          className={`flex flex-col md:flex-row ${
            index % 2 !== 0 ? 'md:flex-row-reverse' : ''
          } ${index % 2 === 0 ? 'bg-white dark:bg-[#191919]' : 'bg-[#f4f4f4] dark:bg-[#2A2A2A]'} 
          text-ink items-center justify-center py-20 px-6 gap-8`}
        >
            {/* Imagen placeholder */}
            <div className="w-64 h-64 bg-ink rounded-md">
              <img
                  src={servicio.imgbig}
                  alt={servicio.titulo}
                  className="max-h-full max-w-full object-contain rounded-2xl"
                />
            </div>
            
            {/* Texto */}
            <div className="max-w-md">
            <h3 className="text-xl font-mono font-bold mb-4 dark:text-white">{servicio.titulo}</h3>
            <p className="mb-4 dark:text-white">{servicio.descripcion}</p>
            <Link
              to="/contacto"
              className={`inline-block px-4 py-2 border border-ink rounded-md  hover:scale-105 transform transition-transform duration-200 ease-in-out
 ${
                index % 2 === 0 ? 'bg-white dark:bg-[#2A2A2A]' : 'bg-[#f4f4f4] dark:bg-[#191919]'
               }dark:text-white`}
              >
                Contactate!
              </Link>

            </div>
        </div>
        ))}
    </main>
  );
};

export default Servicios;