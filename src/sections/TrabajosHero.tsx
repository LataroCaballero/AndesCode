import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

// Logos
import clinicalLogo from "../assets/projects/clinical-logo.png";
import galeriaLogo from "../assets/projects/galeria-logo.png";
import secretarioLogo from "../assets/projects/secretario-logo.png";

// Screenshots / previews
import clinicalImg from "../assets/projects/clinical-preview.png";
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
      "Consultorios manejando turnos en papel, historias clínicas en carpetas, facturación manual. Construimos un sistema integral que centraliza pacientes, turnos, historias clínicas y facturación en un solo lugar.",
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
      "Estudio de diseño sin presencia digital ni forma de mostrar ni vender su trabajo online. Desarrollamos su sitio web completo con landing, e-commerce y panel de administración a medida.",
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
      "Profesionales perdiendo horas gestionando turnos por WhatsApp de forma manual. Automatizamos la atención completa: reservas, recordatorios y confirmaciones sin intervención humana.",
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
    <main className="text-center px-4 text-[#191919]">
      {/* Header */}
      <section className="relative grid-bg pt-36 pb-20 px-4 overflow-hidden">
        <span className="inline-block text-xs uppercase tracking-widest text-[#4342FF] font-semibold mb-3">Nuestros trabajos</span>
        <h1 className="text-4xl font-bold mb-4 text-[#191919]">
          Problemas reales, soluciones reales
        </h1>
        <p className="text-gray-600 mb-4 max-w-xl mx-auto">
          Cada proyecto empieza con un problema. Así es como los resolvimos.
        </p>
      </section>

      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Featured project */}
          {featured && (
            <div className="relative rounded-xl overflow-hidden bg-white border border-gray-100 transition-all duration-300 hover:-translate-y-0.5 shadow-[0_4px_32px_rgba(67,66,255,0.10)] hover:shadow-[0_8px_48px_rgba(67,66,255,0.18)]">
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

                {/* Content */}
                <div className="lg:w-1/2 p-6 lg:p-10 flex flex-col justify-center text-left relative">
                  <span className="absolute top-0 right-0 bg-[#4342FF] text-white text-xs px-3 py-1 rounded-bl-lg fira-code-regular">
                    {featured.badge}
                  </span>

                  <img
                    src={featured.logo}
                    alt={`${featured.titulo} logo`}
                    className="w-14 h-14 rounded-xl object-cover mb-4 border border-gray-200"
                  />

                  <h3 className="font-bold text-3xl lg:text-4xl mb-3 fira-code-bold text-[#191919]">
                    {featured.titulo}
                  </h3>
                  <p className="text-gray-600 mb-6 text-base lg:text-lg">
                    {featured.descripcion}
                  </p>

                  <button
                    type="button"
                    onClick={() => setAbierto(featured)}
                    className="w-fit btn-primary rounded-xl px-6 py-2.5 text-sm font-medium transition"
                  >
                    {featured.demoVideo ? "Ver demo" : "Ver más"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Secondary projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {secondary.map((p) => (
              <div
                key={p.id}
                className="relative rounded-xl overflow-hidden bg-white border border-gray-100 transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_24px_rgba(67,66,255,0.08)] hover:shadow-[0_8px_32px_rgba(67,66,255,0.16)] text-left"
              >
                {/* Image */}
                <div className="relative">
                  <img
                    src={p.imagen}
                    alt={p.titulo}
                    className="w-full h-48 lg:h-56 object-cover"
                  />
                  <img
                    src={p.logo}
                    alt={`${p.titulo} logo`}
                    className="absolute bottom-0 right-4 translate-y-1/2 w-12 h-12 rounded-xl object-cover border-2 border-white bg-white shadow-md"
                  />
                </div>

                {/* Content */}
                <div className="p-6 pt-8">
                  <span className="absolute top-0 right-0 bg-[#4342FF] text-white text-xs px-3 py-1 rounded-bl-lg fira-code-regular">
                    {p.badge}
                  </span>

                  <h3 className="font-semibold text-lg mb-2 text-[#191919]">{p.titulo}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {p.descripcion}
                  </p>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setAbierto(p)}
                      className="btn-secondary rounded-xl px-5 py-2 text-sm font-medium transition"
                    >
                      {p.demoVideo ? "Ver demo" : "Ver más"}
                    </button>

                    {p.detalle.link && (
                      <a
                        href={p.detalle.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 btn-primary rounded-xl px-5 py-2 text-sm font-medium transition"
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

      {/* CTA footer */}
      <section className="grid-bg py-16 px-6 md:px-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <h2 className="font-semibold text-xl md:text-2xl text-[#191919] text-center md:text-left">
            ¿Tenés un problema similar?
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xl mx-auto">
            <Link to="/contacto" className="w-full md:w-auto">
              <button className="w-full btn-primary px-6 py-2.5 rounded-lg text-sm">
                Contanos tu proyecto
              </button>
            </Link>
            <Link to="/servicios" className="w-full md:w-auto">
              <button className="w-full btn-secondary px-6 py-2.5 rounded-lg text-sm">
                Mirá nuestros servicios
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* MODAL */}
      {abierto && (
        <div
          className="fixed inset-0 z-50"
          aria-labelledby="dialog-title"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm fade-in"
            onClick={() => setAbierto(null)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className={`w-full ${abierto.demoVideo ? "max-w-2xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto slide-up rounded-2xl bg-white border border-gray-100 shadow-[0_24px_64px_rgba(67,66,255,0.16)] p-6`}>

              {/* Header */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl border border-gray-100 shadow-sm overflow-hidden shrink-0">
                  <img
                    src={abierto.logo}
                    alt={abierto.titulo}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <span className="inline-block text-xs uppercase tracking-widest text-[#4342FF] font-semibold mb-1">
                    {abierto.badge}
                  </span>
                  <h2
                    id="dialog-title"
                    className="text-2xl font-bold text-[#191919] leading-tight"
                  >
                    {abierto.titulo}
                  </h2>
                </div>
                <button
                  onClick={() => setAbierto(null)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 border-none transition shrink-0"
                  aria-label="Cerrar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Video */}
              {abierto.demoVideo && (
                <div className="rounded-xl overflow-hidden border border-gray-100 mb-5">
                  <video
                    src={abierto.demoVideo}
                    controls
                    playsInline
                    className="w-full"
                  />
                </div>
              )}

              {/* Resumen */}
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                {abierto.detalle.resumen}
              </p>

              {/* Stack */}
              {abierto.detalle.stack && (
                <div className="mb-5">
                  <h4 className="text-xs uppercase tracking-widest text-[#4342FF] font-semibold mb-2">Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {abierto.detalle.stack.map((s) => (
                      <span
                        key={s}
                        className="rounded-lg bg-[#4342FF]/8 border border-[#4342FF]/15 text-[#4342FF] text-xs font-medium px-3 py-1"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Entregables */}
              {abierto.detalle.entregables && (
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#4342FF] font-semibold mb-2">Entregables</h4>
                  <ul className="space-y-1.5">
                    {abierto.detalle.entregables.map((e) => (
                      <li key={e} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="mt-0.5 w-4 h-4 rounded-full bg-[#4342FF]/10 text-[#4342FF] flex items-center justify-center shrink-0 text-xs">✓</span>
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Link */}
              {abierto.detalle.link && (
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <a
                    href={abierto.detalle.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 btn-primary rounded-xl px-5 py-2.5 text-sm font-medium transition"
                  >
                    Visitar sitio
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 010-1.06l7.22-7.22H5.75a.75.75 0 010-1.5h8.5a.75.75 0 01.75.75v8.5a.75.75 0 01-1.5 0V6.56l-7.22 7.22a.75.75 0 01-1.06 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
