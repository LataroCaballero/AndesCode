import project1 from "../assets/projects/mocion.jpg";
import project2 from "../assets/projects/sbcuyo.jpg";
import project3 from "../assets/projects/motivationnau.jpg";
import project4 from "../assets/projects/cinetika.jpg";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import mocion from "../assets/projects/mocion.jpg"
import sbcuyo from "../assets/projects/sbcuyo.jpg"
import motivationnau from "../assets/projects/motivationnau.jpg"
import cinetika from "../assets/projects/cinetika.jpg"

type Proyecto = {
  id: string;
  titulo: string;
  descripcion: string;
  badge: string;
  logo: string;        // url o import de la imagen
  detalle: {
    resumen: string;
    stack?: string[];
    entregables?: string[];
    link?: string;     // opcional
  };
};

const proyectos: Proyecto[] = [
    {
        id: "mocion",
        titulo: "Moción NAU",
        descripcion: "Plataforma de peticiones ciudadanas con enfoque social.",
        badge: "App Web",
        logo: mocion,
        detalle: {
          resumen:
            "Plataforma web para crear, firmar y gestionar peticiones ciudadanas, desarrollada con enfoque social. Incluye diseño UX, desarrollo backend y frontend, autenticación de usuarios y panel de administración.",
          stack: ["React", "Node.js", "Express", "PostgreSQL", "Tailwind CSS", "Vercel"],
          entregables: [
            "Diseño UX/UI adaptado a accesibilidad",
            "Frontend responsivo",
            "API REST segura",
            "Sistema de firmas digitales",
            "Panel de administración"
          ],
          link: "https://mocionnau.example",
        }
      },
      {
        id: "sbcuyo",
        titulo: "SBCuyo",
        descripcion: "Sitio institucional optimizado y mantenido por AndesCode.",
        badge: "Mantenimiento Web",
        logo: sbcuyo,
        detalle: {
          resumen:
            "Mantenimiento web de la Sociedad Biológica de Cuyo: optimización de rendimiento, actualización de contenidos y soporte técnico continuo. Mejora de velocidad y posicionamiento SEO.",
          stack: ["WordPress", "PHP", "MySQL", "Elementor", "SEO Tools"],
          entregables: [
            "Optimización de carga",
            "Actualización de contenidos",
            "Mejora SEO",
            "Backups y seguridad",
            "Soporte mensual"
          ],
          link: "https://sbcuyo.org.ar/"
        }
      },
      {
        id: "motivationnau",
        titulo: "MotivationNAU",
        descripcion: "Plataforma web de IA para videos motivacionales personalizados.",
        badge: "SaaS IA",
        logo: motivationnau,
        detalle: {
          resumen:
            "SaaS que permite a los usuarios generar videos motivacionales personalizados usando IA. Combina fotos y descripciones de objetivos para producir visualizaciones realistas de logros futuros.",
          stack: ["Next.js", "Node.js", "OpenAI API", "Cloudinary", "Tailwind CSS"],
          entregables: [
            "Generador de videos IA",
            "Carga de fotos y voz",
            "Sistema freemium",
            "Dashboard de usuario",
            "Integración con API de video"
          ],
          link: "https://motivationnau.example"
        }
      },
      {
        id: "cinetika",
        titulo: "Cinetika",
        descripcion: "Dashboard para centro de rendimiento deportivo.",
        badge: "Sistema a Medida",
        logo: cinetika,
        detalle: {
          resumen:
            "Aplicación web para visualizar y analizar datos de mediciones deportivas y de rehabilitación. Permite comparar resultados de pacientes mediante gráficos y tablas intuitivas.",
          stack: ["React", "Node.js", "Express", "PostgreSQL", "Chart.js", "Tailwind CSS"],
          entregables: [
            "Carga y procesamiento de datos",
            "Dashboard de métricas",
            "Comparativa entre mediciones",
            "Visualización gráfica",
            "Exportación de resultados"
          ],
          link: "https://cinetika.example"
        }
      }
];

const proyecto = [
  {
    nombre: "Moción NAU",
    descripcion: "Plataforma de peticiones ciudadanas, desarrollada con enfoque social. Desde diseño UX hasta desarrollo backend.",
    categoria: "App Web",
    imagen: project1,
  },
  {
    nombre: "SBCuyo",
    descripcion: "Sitio institucional optimizado, mantenido y actualizado por AndesCode. Velocidad + contenido clave.",
    categoria: "Mantenimiento Web",
    imagen: project2,
  },
  {
    nombre: "MotivationNAU",
    descripcion: "Plataforma web de IA que permite a los usuarios videos motivacionales personalizados.",
    categoria: "SaaS IA",
    imagen: project3,
  },
  {
    nombre: "Cinetika",
    descripcion: "Dashboard para un centro de rendimiento deportivo. Visualización de datos de pacientes en gráficos.",
    categoria: "Sistema a Medida",
    imagen: project4,
  },
];

export default function ProjectsGrid() {
  const [abierto, setAbierto] = useState<Proyecto | null>(null);

  // Cerrar con ESC y bloquear scroll del body
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(null);
    if (abierto) {
      document.addEventListener("keydown", onKey);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = prev;
      };
    }
  }, [abierto]);

  return (
    <main className="text-center px-4 text-ink">
      
      {/* Título principal */}
      <section className="pt-20 py-20 dark:text-white">
        <h2 className="text-4xl font-bold fira-code-bold mb-2 mt-8">Nuestro trabajo</h2>
        <p className="text-[#191919] dark:text-white mb-12 max-w-xl mx-auto mt-5">
          Algunos de los proyectos que desarrollamos junto a nuestros clientes
        </p>

        {/* Grid de proyectos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {proyectos.map((p, i) => (
            <div
              key={i}
              className="grid grid-cols-1 content-between relative border rounded-md p-6 text-center bg-white dark:bg-[#2a2a2a] transition-all duration-300 ease-in-out hover:scale-[1.03] dark:border-gray-700 shadow-[#4342FF]/20 dark:shadow-[#4342FF]/30 shadow-[0_0_20px_0px_var(--tw-shadow-color)] hover:shadow-[#4342FF]/40"
            >
              {/* Etiqueta categoría */}
              <span className="absolute top-0 right-0 bg-[#191919] text-white dark:bg-white dark:text-[#191919] text-xs px-3 py-1 rounded-bl-md fira-code-regular">
                {p.badge}
              </span>

              {/* Imagen redonda */}
              <img
                src={p.logo}
                alt={p.titulo}
                className="w-16 h-16 rounded-full object-cover mb-4 mt-3 place-self-center border-2 border-[#191919] dark:border-white"
              />

              {/* Nombre y descripción */}
              <h3 className="font-semibold text-lg mb-2">{p.titulo}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{p.descripcion}</p>

              {/* Botón */}
              <button
                type="button"
                onClick={() => setAbierto(p)}
                className="rounded-xl border border-white/20 px-5 py-2 text-sm font-medium hover:bg-white/10 active:scale-[.98] transition"
              >
                Ver más
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Cierre CTA */}
        <section className="grid grid-cols-1 md:grid-cols-2 py-16 px-6 md:px-30">
          <h2 className="fira-code-medium text-xl md:text-2xl font-semibold mb-2 text-center md:text-left md:ml-10 dark:text-white">
            El cambio comienza hoy.
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-xl mx-auto">
            <Link to="/contacto" className="w-full md:w-64">
              <button className="w-full dark-button bg-black text-white px-6 py-2 rounded max-h-[60px]">
                Agendá una reunión
              </button>
            </Link>
            <Link to="/nosotros" className="w-full md:w-64">
              <button className="w-full border bg-white text-[#191919] !border-black dark:bg-[#191919] dark:text-[#ffffff] dark:!border-[#ffffff] px-6 py-2 rounded hover:text-ink max-h-[60px]">
                Conocé más sobre nosotros
              </button>
            </Link>
          </div>

        {/* MODAL */}
        {abierto && (
          <div
            className="fixed inset-0 z-50"
            aria-labelledby="dialog-title"
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-100 fade-in"
              onClick={() => setAbierto(null)}
            />
            {/* Card */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-lg translate-y-0 slide-up rounded-2xl borderborder-white/15 bg-ink p-6 shadow-2xl bg-[#191919]">
                <div className="flex items-start gap-4">
                  <img
                    src={abierto.logo}
                    alt={abierto.titulo}
                    className="h-12 w-12 rounded-lg object-contain"
                  />
                  <div className="flex-1">
                    <h2 id="dialog-title" className="text-3xl font-semibold text-[#ffffff]">
                      {abierto.titulo}
                    </h2>
                    <p className="mt-1 text-l text-white">{abierto.badge}</p>
                  </div>
                  <button
                    onClick={() => setAbierto(null)}
                    className="rounded-lg p-2 text-white hover:bg-white/10"
                    aria-label="Cerrar"
                  >
                    ✕
                  </button>
                </div>

                <p className="mt-4 text-m leading-relaxed text-white/80">
                  {abierto.detalle.resumen}
                </p>

                {abierto.detalle.stack && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-white">Stack</h4>
                    <ul className="mt-2 flex flex-wrap gap-2 text-xs text-white">
                      {abierto.detalle.stack.map((s) => (
                        <li
                          key={s}
                          className="rounded-md border border-black dark:border-white/15 px-2 py-1"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {abierto.detalle.entregables && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-white">Entregables</h4>
                    <ul className="mt-2 list-disc pl-0 list-inside space-y-1 text-sm text-white/80">
                      {abierto.detalle.entregables.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}

                
              </div>
            </div>
          </div>
        )}

        </section>
    </main>
  );
}
