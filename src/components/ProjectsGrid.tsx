// ProjectsGrid.tsx
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
          link: "https://mocionnau.example"
        }
      },
      {
        id: "sbcuyo",
        titulo: "SBCuyo",
        descripcion: "Sitio institucional optimizado y mantenido por AndesCode.",
        badge: "Mantenimiento Web",
        logo: "/logos/sbcuyo.png",
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
          link: "https://sociedadbiologicacuyo.org"
        }
      },
      {
        id: "motivationnau",
        titulo: "MotivationNAU",
        descripcion: "Plataforma web de IA para videos motivacionales personalizados.",
        badge: "SaaS IA",
        logo: "/logos/motivationnau.png",
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
        logo: "/logos/cinetika.png",
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
    <section className="mx-auto max-w-6xl px-4">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {proyectos.map((p) => (
          <article
            key={p.id}
            className="rounded-2xl border border-white/10 bg-ink/40 p-6 shadow-lg"
          >
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="rounded-md bg-white/10 px-2 py-1">{p.badge}</span>
            </div>

            <div className="mb-4 flex h-20 items-center justify-center">
              <img
                src={p.logo}
                alt={p.titulo}
                className="h-full w-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>

            <h3 className="text-center text-lg font-semibold">{p.titulo}</h3>
            <p className="mt-2 text-center text-sm text-white/70">
              {p.descripcion}
            </p>

            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => setAbierto(p)}
                className="rounded-xl border border-white/20 px-5 py-2 text-sm font-medium hover:bg-white/10 active:scale-[.98] transition"
              >
                Ver más
              </button>
            </div>
          </article>
        ))}
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
            className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-100 animate-fadeIn"
            onClick={() => setAbierto(null)}
          />
          {/* Card */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-lg translate-y-0 animate-slideUp rounded-2xl border border-white/15 bg-ink p-6 shadow-2xl">
              <div className="flex items-start gap-4">
                <img
                  src={abierto.logo}
                  alt={abierto.titulo}
                  className="h-12 w-12 rounded-lg object-contain"
                />
                <div className="flex-1">
                  <h2 id="dialog-title" className="text-xl font-semibold">
                    {abierto.titulo}
                  </h2>
                  <p className="mt-1 text-xs text-white/60">{abierto.badge}</p>
                </div>
                <button
                  onClick={() => setAbierto(null)}
                  className="rounded-lg p-2 text-white/70 hover:bg-white/10"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-white/80">
                {abierto.detalle.resumen}
              </p>

              {abierto.detalle.stack && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium">Stack</h4>
                  <ul className="mt-2 flex flex-wrap gap-2 text-xs">
                    {abierto.detalle.stack.map((s) => (
                      <li
                        key={s}
                        className="rounded-md border border-white/15 px-2 py-1"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {abierto.detalle.entregables && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium">Entregables</h4>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">
                    {abierto.detalle.entregables.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                {abierto.detalle.link && (
                  <a
                    href={abierto.detalle.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
                  >
                    Visitar proyecto
                  </a>
                )}
                <button
                  onClick={() => setAbierto(null)}
                  className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* Tailwind keyframes (opcional, pero queda lindo)
   Agregá esto en tailwind.config.js -> theme.extend.animation/keyframes
   y luego las clases animate-fadeIn y animate-slideUp ya funcionan.
*/
// tailwind.config.js (fragmento)
/*
extend: {
  keyframes: {
    fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
    slideUp: {
      '0%': { opacity: 0, transform: 'translateY(12px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' },
    },
  },
  animation: {
    fadeIn: 'fadeIn .18s ease-out',
    slideUp: 'slideUp .22s ease-out',
  },
}
*/
