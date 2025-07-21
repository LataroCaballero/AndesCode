import { Link } from 'react-router-dom';
import { useRef } from 'react';

const servicios = [
  {
    titulo: 'Desarrollo Web y Mobile',
    descripcion:
      'Diseñamos y desarrollamos sitios web y aplicaciones móviles responsivas, veloces y listas para escalar. Desde una landing hasta un sistema completo.',
      id: 'web',
  },
  {
    titulo: 'Sistemas a Medida',
    descripcion:
      'Creamos plataformas únicas adaptadas a procesos específicos: desde gestión interna hasta herramientas de uso masivo, pensadas para optimizar tu negocio.',
      id: 'sistemas',
  },
  {
    titulo: 'Automatización de Procesos con IA',
    descripcion:
      'Optimizamos tu negocio implementando soluciones inteligentes basadas en inteligencia artificial. Desde bots automatizados, flujos de trabajo inteligentes hasta sistemas que aprenden y mejoran con el tiempo, te ayudamos a reducir tareas manuales, aumentar la eficiencia y tomar decisiones basadas en datos reales.',
      id: 'ia',
  },
  {
    titulo: 'Soporte y Mantenimiento',
    descripcion:
      'Acompañamos a largo plazo con mejoras, corrección de errores, backups, monitoreo y asistencia técnica continua.',
    id: 'soporte',
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
              <div className="w-12 h-12 rounded-md" />
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
            <div className="w-64 h-64 bg-ink rounded-md" />
            
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