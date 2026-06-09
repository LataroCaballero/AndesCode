import { CAL_COM_URL, whatsappUrl, trackCta } from "../lib/cta";

const scope = [
  { title: "Web apps", desc: "OWASP Top 10, auth, sesiones, IDOR, inyecciones, exposición de datos, configuración del frontend." },
  { title: "APIs y backends", desc: "Autorización, rate limiting, validación, manejo de secretos, dependencias vulnerables." },
  { title: "Infraestructura", desc: "Hardening de VPS/nginx, headers, TLS, exposición de servicios, backups, accesos SSH." },
  { title: "Code review", desc: "Revisión enfocada de PRs o branches críticos antes de mergear a producción." },
];

const deliverables = [
  "Informe en PDF con cada hallazgo, severidad CVSS y reproducción paso a paso.",
  "Recomendación concreta de remediación por hallazgo (no genérico — para tu stack).",
  "Llamada de remediación de 1 h para que el equipo entienda cómo corregir.",
  "Retest sin cargo dentro de 30 días para verificar que las correcciones cierren las vulnerabilidades.",
];

const faqs = [
  {
    q: "¿Cuánto cuesta?",
    a: "Depende del scope (cantidad de rutas, complejidad, si incluye infra). Lo definimos en la llamada inicial gratis. No publicamos precio fijo porque sería falso — una landing simple no cuesta lo mismo que un panel financiero.",
  },
  {
    q: "¿Cuánto tarda?",
    a: "Una auditoría web típica lleva entre 5 y 10 días hábiles desde que arrancamos, más el retest. Te damos fechas concretas antes de empezar.",
  },
  {
    q: "¿Pueden firmar un NDA?",
    a: "Sí, sin problema. Trabajamos con NDA en la mayoría de los proyectos de auditoría.",
  },
  {
    q: "¿Y si encuentran algo crítico?",
    a: "Te avisamos en el momento, no esperamos al informe final. Definimos juntos el plan de respuesta antes de seguir.",
  },
];

export default function AuditoriasHero() {
  const waHero = whatsappUrl("auditorias-hero");
  const waFinal = whatsappUrl("auditorias-final");

  return (
    <>
      <section className="relative grid-bg text-center pt-36 pb-24 px-4 min-h-[80vh] flex flex-col justify-center">
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 bg-[#48FF3E]/15 text-[#191919] text-xs font-medium px-4 py-1.5 rounded-full fira-code-medium tracking-wide">
            Auditorías de seguridad
          </span>
        </div>
        <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl leading-tight max-w-4xl mx-auto mb-6 text-[#191919]">
          Encontremos los problemas antes <br className="hidden md:block" />
          que los encuentre alguien que no querés
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Revisamos tu web app, API o infraestructura con metodología OWASP y herramientas estándar de la industria. Te entregamos un informe accionable, no un dump de scanner.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={CAL_COM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCta('cta_book_call', { source: 'auditorias-hero' })}
            className="btn-primary fira-code-regular px-7 py-3 rounded-lg text-sm"
          >
            Solicitá presupuesto
          </a>
          <a
            href={waHero}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCta('cta_whatsapp', { source: 'auditorias-hero' })}
            className="btn-secondary fira-code-regular px-7 py-3 rounded-lg text-sm"
          >
            Preguntá por WhatsApp
          </a>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-xs uppercase tracking-widest text-[#4342FF] font-semibold mb-3">Qué auditamos</span>
            <h2 className="font-bold text-3xl md:text-4xl text-[#191919]">Scope</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {scope.map((s) => (
              <div key={s.title} className="p-6 rounded-xl bg-white border border-gray-100 shadow-[0_4px_24px_rgba(67,66,255,0.07)]">
                <h3 className="font-semibold text-lg mb-2 text-[#191919]">{s.title}</h3>
                <p className="text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 grid-bg">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block text-xs uppercase tracking-widest text-[#4342FF] font-semibold mb-3">Qué te entregamos</span>
            <h2 className="font-bold text-3xl md:text-4xl text-[#191919]">Entregables</h2>
          </div>
          <ul className="space-y-4 max-w-2xl mx-auto">
            {deliverables.map((d) => (
              <li key={d} className="flex gap-3 items-start p-4 bg-white rounded-lg border border-gray-100">
                <span className="text-[#4342FF] fira-code-bold">✓</span>
                <span className="text-sm text-gray-700">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block text-xs uppercase tracking-widest text-[#4342FF] font-semibold mb-3">Preguntas frecuentes</span>
            <h2 className="font-bold text-3xl md:text-4xl text-[#191919]">FAQ</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="p-5 rounded-lg border border-gray-100 bg-white group">
                <summary className="cursor-pointer font-semibold text-base text-[#191919] list-none flex justify-between items-center">
                  {f.q}
                  <span className="text-[#4342FF] fira-code-bold group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-gray-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 text-center grid-bg">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-bold text-3xl md:text-4xl mb-6 text-[#191919]">
            ¿Lo arrancamos esta semana?
          </h2>
          <p className="text-base text-gray-600 mb-8">
            Una llamada de 30 min nos alcanza para entender el alcance y mandarte un presupuesto al día siguiente.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={CAL_COM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCta('cta_book_call', { source: 'auditorias-final' })}
              className="btn-primary fira-code-regular px-7 py-3 rounded-lg text-sm"
            >
              Agendá la llamada
            </a>
            <a
              href={waFinal}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCta('cta_whatsapp', { source: 'auditorias-final' })}
              className="btn-secondary fira-code-regular px-7 py-3 rounded-lg text-sm"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
