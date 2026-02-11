import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

// Logos
import clinicalLogo from "../assets/projects/clinical-logo.png";
import galeriaLogo from "../assets/projects/galeria-logo.png";
import secretarioLogo from "../assets/projects/secretario-logo.png";

// Screenshots / previews
import clinicalImg from "../assets/projects/clinical-preview.png";
import galeriaImg from "../assets/projects/galeria-preview.png";
import secretarioImg from "../assets/projects/secretario-preview.png";

// Mockups
import galeriaMockup from "../assets/projects/galeria-mockup.png";

// Videos
import clinicalCarousel from "../assets/projects/clinical-carousel.mp4";
import clinicalDemo from "../assets/projects/clinical-social.mp4";
import galeriaDemo from "../assets/projects/GaleriaEstudio.mp4";

type Proyecto = {
  id: string;
  titulo: string;
  descripcion: string;
  badge: string;
  logo: string;
  imagen?: string;
  previewVideo?: string;
  demoVideo?: string;
  featured?: boolean;
  detalle: {
    resumen: string;
    stack?: string[];
    entregables?: string[];
    link?: string;
  };
};

const proyectos: Proyecto[] = [
  {
    id: "clinical",
    titulo: "CLINICAL",
    descripcion:
      "Sistema integral de gestión clínica diseñado para optimizar la operación diaria de consultorios y centros de salud.",
    badge: "Sistema a Medida",
    logo: clinicalLogo,
    imagen: clinicalImg,
    previewVideo: clinicalCarousel,
    demoVideo: clinicalDemo,
    featured: true,
    detalle: {
      resumen:
        "Plataforma web completa para la gestión de turnos, historias clínicas, facturación y seguimiento de pacientes. Pensada para que profesionales de la salud digitalicen su práctica sin fricciones, con una interfaz clara y flujos de trabajo intuitivos.",
      stack: [
        "React",
        "TypeScript",
        "Node.js",
        "Express",
        "PostgreSQL",
        "Tailwind CSS",
      ],
      entregables: [
        "Panel de administración y dashboard de métricas",
        "Gestión de turnos con calendario interactivo",
        "Historias clínicas digitales",
        "Módulo de facturación y reportes",
        "Sistema de roles y permisos",
      ],
    },
  },
  {
    id: "galeria-estudio",
    titulo: "Galeria Estudio",
    descripcion:
      "Landing page y e-commerce para estudio de diseño e interiorismo, con panel de administración a medida para gestionar productos.",
    badge: "Desarrollo Web",
    logo: galeriaLogo,
    imagen: galeriaMockup,
    demoVideo: galeriaDemo,
    detalle: {
      resumen:
        "Diseño y desarrollo de una plataforma web completa para un estudio de diseño e interiorismo. Incluye una landing page moderna con secciones de proyectos, servicios y propuestas, junto con una sección Shop con catálogo de productos. Cuenta con un panel de administración desarrollado totalmente a medida que permite subir, editar y eliminar productos con sus imágenes, gestionando todo el contenido de forma autónoma.",
      stack: ["React", "Astro", "Tailwind CSS", "Supabase", "Cloudinary"],
      entregables: [
        "Landing page responsiva y optimizada",
        "Sección Shop con catálogo de productos",
        "Panel de administración a medida para gestión de productos",
        "Carga y optimización de imágenes con Cloudinary",
        "Base de datos y backend con Supabase",
        "Galería de proyectos con navegación fluida",
        "Optimización SEO y performance",
        "Integración con redes sociales",
        "Formulario de contacto funcional",
      ],
      link: "https://galeriaestudio.com.ar/",
    },
  },
  {
    id: "secretario-virtual",
    titulo: "Secretario Virtual",
    descripcion:
      "Bot inteligente de WhatsApp que automatiza la atención y gestión de turnos para profesionales.",
    badge: "Automatización IA",
    logo: secretarioLogo,
    imagen: secretarioImg,
    detalle: {
      resumen:
        "Asistente virtual para WhatsApp que gestiona turnos, responde consultas frecuentes y envía recordatorios automáticos. Diseñado para profesionales que necesitan optimizar la comunicación con sus pacientes o clientes sin perder el toque humano.",
      stack: [
        "Node.js",
        "WhatsApp Business API",
        "OpenAI API",
        "PostgreSQL",
        "Redis",
      ],
      entregables: [
        "Bot conversacional con IA generativa",
        "Gestión automática de turnos",
        "Recordatorios y confirmaciones automáticas",
        "Panel de configuración para el profesional",
        "Integración con calendario existente",
      ],
    },
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

  const featured = proyectos.find((p) => p.featured);
  const secondary = proyectos.filter((p) => !p.featured);

  return (
    <main className="text-center px-4 text-ink">
      {/* Título principal */}
      <section className="pt-20 py-20 dark:text-white">
        <h2 className="text-4xl font-bold fira-code-bold mb-2 mt-8">
          Nuestro trabajo
        </h2>
        <p className="text-[#191919] dark:text-white mb-12 max-w-xl mx-auto mt-5">
          Algunos de los proyectos que desarrollamos junto a nuestros clientes
        </p>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Featured project — hero card */}
          {featured && (
            <div className="relative border rounded-md overflow-hidden bg-white dark:bg-[#2a2a2a] transition-all duration-300 ease-in-out hover:scale-[1.01] dark:border-gray-700 shadow-[#4342FF]/30 dark:shadow-[#4342FF]/40 shadow-[0_0_30px_2px_var(--tw-shadow-color)]">
              <div className="flex flex-col lg:flex-row">
                {/* Preview */}
                <div className="lg:w-1/2">
                  {featured.previewVideo ? (
                    <video
                      src={featured.previewVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-64 lg:h-full object-cover"
                    />
                  ) : (
                    <img
                      src={featured.imagen}
                      alt={featured.titulo}
                      className="w-full h-64 lg:h-full object-cover"
                    />
                  )}
                </div>

                {/* Contenido */}
                <div className="lg:w-1/2 p-6 lg:p-10 flex flex-col justify-center text-left relative">
                  <span className="absolute top-0 right-0 bg-[#191919] text-white dark:bg-white dark:text-[#191919] text-xs px-3 py-1 rounded-bl-md fira-code-regular">
                    {featured.badge}
                  </span>

                  <img
                    src={featured.logo}
                    alt={`${featured.titulo} logo`}
                    className="w-14 h-14 rounded-full object-cover mb-4 border-2 border-[#191919] dark:border-white"
                  />

                  <h3 className="font-bold text-3xl lg:text-4xl mb-3 fira-code-bold">
                    {featured.titulo}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-base lg:text-lg">
                    {featured.descripcion}
                  </p>

                  <button
                    type="button"
                    onClick={() => setAbierto(featured)}
                    className="w-fit rounded-xl bg-[#4342FF] text-white px-6 py-2.5 text-sm font-medium hover:bg-[#3534cc] active:scale-[.98] transition"
                  >
                    {featured.demoVideo ? "Ver demo" : "Ver más"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Secondary projects — 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {secondary.map((p) => (
              <div
                key={p.id}
                className="relative border rounded-md overflow-hidden bg-white dark:bg-[#2a2a2a] transition-all duration-300 ease-in-out hover:scale-[1.03] dark:border-gray-700 shadow-[#4342FF]/20 dark:shadow-[#4342FF]/30 shadow-[0_0_20px_0px_var(--tw-shadow-color)] text-left"
              >
                {/* Imagen */}
                <div className="relative">
                  <img
                    src={p.imagen}
                    alt={p.titulo}
                    className="w-full h-48 lg:h-56 object-cover"
                  />
                  {/* Logo superpuesto */}
                  <img
                    src={p.logo}
                    alt={`${p.titulo} logo`}
                    className="absolute bottom-0 right-4 translate-y-1/2 w-12 h-12 rounded-full object-cover border-2 border-[#191919] dark:border-white bg-white dark:bg-[#2a2a2a]"
                  />
                </div>

                {/* Contenido */}
                <div className="p-6 pt-8">
                  <span className="absolute top-0 right-0 bg-[#191919] text-white dark:bg-white dark:text-[#191919] text-xs px-3 py-1 rounded-bl-md fira-code-regular">
                    {p.badge}
                  </span>

                  <h3 className="font-semibold text-lg mb-2">{p.titulo}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {p.descripcion}
                  </p>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setAbierto(p)}
                      className="rounded-xl border border-[#191919] dark:border-white/20 px-5 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 active:scale-[.98] transition"
                    >
                      {p.demoVideo ? "Ver demo" : "Ver más"}
                    </button>

                    {p.detalle.link && (
                      <a
                        href={p.detalle.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#4342FF] text-white px-5 py-2 text-sm font-medium hover:bg-[#3534cc] active:scale-[.98] transition"
                      >
                        Visitar sitio
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 010-1.06l7.22-7.22H5.75a.75.75 0 010-1.5h8.5a.75.75 0 01.75.75v8.5a.75.75 0 01-1.5 0V6.56l-7.22 7.22a.75.75 0 01-1.06 0z" clipRule="evenodd" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
              <div className={`w-full ${abierto.demoVideo ? "max-w-2xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto translate-y-0 slide-up rounded-2xl border border-white/15 bg-ink p-6 shadow-2xl bg-[#191919]`}>
                <div className="flex items-start gap-4">
                  <img
                    src={abierto.logo}
                    alt={abierto.titulo}
                    className="h-12 w-12 rounded-lg object-contain"
                  />
                  <div className="flex-1">
                    <h2
                      id="dialog-title"
                      className="text-3xl font-semibold text-[#ffffff]"
                    >
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

                {abierto.demoVideo && (
                  <div className="mt-4 rounded-lg overflow-hidden">
                    <video
                      src={abierto.demoVideo}
                      controls
                      playsInline
                      className="w-full rounded-lg"
                    />
                  </div>
                )}

                <p className="mt-4 text-m leading-relaxed text-white/80">
                  {abierto.detalle.resumen}
                </p>

                {abierto.detalle.stack && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-white">Stack</h4>
                    <ul className="mt-2 flex flex-wrap justify-center gap-2 text-xs text-white">
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
                    <h4 className="text-sm font-medium text-white">
                      Entregables
                    </h4>
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
