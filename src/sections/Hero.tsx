import { Link } from "react-router-dom";
import Typewriter from "typewriter-effect";
import { CAL_COM_URL, whatsappUrl, trackCta } from "../lib/cta";

const techStack = [
  "React", "Node.js", "TypeScript", "Python", "PostgreSQL", "AWS",
  "Docker", "Tailwind CSS", "OWASP", "Burp Suite", "nmap", "OpenAI",
];

export default function Hero() {
  const waHero = whatsappUrl("home-hero");
  const waPlan = whatsappUrl("home-plan");
  const waSuccess = whatsappUrl("home-success");

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative grid-bg text-center pt-36 pb-24 px-4 min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 bg-[#4342FF]/10 text-[#4342FF] text-xs font-medium px-4 py-1.5 rounded-full fira-code-medium tracking-wide">
            Software a medida · Auditorías de seguridad
          </span>
        </div>

        <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl leading-tight max-w-4xl mx-auto mb-6 text-[#191919]">
          Software a medida y auditorías de seguridad <br className="hidden md:block" />
          para empresas que necesitan resultados, no promesas
        </h1>

        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Construimos sistemas a medida desde USD 3.000 y auditamos la seguridad de los que ya tenés en producción. San Juan, Argentina. Trabajamos remoto.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
          <a
            href={CAL_COM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCta('cta_book_call', { source: 'hero' })}
            className="btn-primary fira-code-regular px-7 py-3 rounded-lg text-sm"
          >
            Agendá una llamada gratis
          </a>
          <a
            href={waHero}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCta('cta_whatsapp', { source: 'hero' })}
            className="btn-secondary fira-code-regular px-7 py-3 rounded-lg text-sm"
          >
            Escribinos por WhatsApp
          </a>
        </div>

        {/* Terminal */}
        <div className="bg-[#1e1e2e] rounded-xl overflow-hidden max-w-2xl mx-auto shadow-[0_8px_40px_rgba(67,66,255,0.18)] transition-all duration-500 hover:shadow-[0_12px_48px_rgba(67,66,255,0.28)]">
          <div className="bg-[#2a2a3e] h-9 flex items-center px-4 gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="ml-3 text-xs text-gray-400 fira-code-regular">andescode — terminal</span>
          </div>
          <div className="p-5 text-sm fira-code-regular text-green-400 text-left whitespace-pre-wrap min-h-[140px]">
            <Typewriter
              onInit={(typewriter) => {
                typewriter.typeString(`~ andescode discover --project\n\n~ Entendemos tu negocio y tu stack...\n~ Diseñamos el sistema (o el plan de auditoría)...\n~ Construimos y testeamos en sprints cortos...\n~ Entregamos con documentación y soporte...\n\n~ Listo: software que te suma + sistemas que no te exponen.`).start();
              }}
              options={{ delay: 20, cursor: '_' }}
            />
          </div>
        </div>
      </section>

      {/* ─── MARQUEE — TECH + SECURITY STACK ─── */}
      <section className="py-10 bg-gray-50 border-y border-gray-100 overflow-hidden">
        <p className="text-center text-xs text-gray-400 uppercase tracking-widest mb-6 fira-code-regular">
          Tecnologías y herramientas que usamos
        </p>
        <div className="overflow-hidden">
          <div className="marquee-track">
            {[...techStack, ...techStack].map((tech, i) => (
              <span
                key={i}
                className="inline-flex items-center mx-8 text-sm font-medium text-gray-500 whitespace-nowrap"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#4342FF]/40 mr-3 inline-block"></span>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DOS LÍNEAS DE TRABAJO ─── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-xs uppercase tracking-widest text-[#4342FF] font-semibold mb-3">Qué hacemos</span>
            <h2 className="font-bold text-3xl md:text-4xl text-[#191919]">
              Dos formas de trabajar con nosotros
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-xl bg-white border border-gray-100 transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_24px_rgba(67,66,255,0.07)] hover:shadow-[0_8px_32px_rgba(67,66,255,0.12)]">
              <div className="w-10 h-10 rounded-lg bg-[#4342FF]/10 flex items-center justify-center mb-4 text-xl">⚙️</div>
              <h3 className="font-semibold text-xl mb-2 text-[#191919]">Software a medida</h3>
              <p className="text-sm text-gray-600 mb-4">
                Sistemas web, dashboards internos, integraciones y automatizaciones para tu operación. Contratos típicos desde USD 3.000, entregas en sprints cortos.
              </p>
              <Link to="/servicios" className="text-sm fira-code-medium text-[#4342FF] hover:underline">
                Ver servicios →
              </Link>
            </div>
            <div className="p-8 rounded-xl bg-white border border-gray-100 transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_24px_rgba(67,66,255,0.07)] hover:shadow-[0_8px_32px_rgba(67,66,255,0.12)]">
              <div className="w-10 h-10 rounded-lg bg-[#48FF3E]/15 flex items-center justify-center mb-4 text-xl">🛡️</div>
              <h3 className="font-semibold text-xl mb-2 text-[#191919]">Auditorías de seguridad</h3>
              <p className="text-sm text-gray-600 mb-4">
                Revisamos tu web app, infra o código en busca de vulnerabilidades antes que alguien más las encuentre. Entregamos informe + remediación + retest.
              </p>
              <Link to="/auditorias" className="text-sm fira-code-medium text-[#4342FF] hover:underline">
                Ver auditorías →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── EL PLAN (3 PASOS) ─── */}
      <section className="py-20 px-4 text-center grid-bg">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block text-xs uppercase tracking-widest text-[#4342FF] font-semibold mb-3">El proceso</span>
          <h2 className="font-bold text-3xl md:text-4xl mb-12 text-[#191919]">
            Empezar es más fácil de lo que pensás
          </h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center mb-10">
            {[
              { n: "1", title: "Contanos tu problema", desc: "Agendá una llamada gratis de 30 minutos. Escuchamos tu situación y entendemos tu negocio." },
              { n: "2", title: "Diseñamos tu solución", desc: "Te proponemos alcance, tiempos y costos. Si es un proyecto a medida o una auditoría, lo definimos en esa llamada." },
              { n: "3", title: "La ejecutamos juntos", desc: "Desarrollamos, testeamos y entregamos. Vos seguís con tu negocio, nosotros nos encargamos de la parte técnica." },
            ].map((step, i) => (
              <div
                key={i}
                className="flex-1 p-6 rounded-xl bg-white border border-gray-100 text-center transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_24px_rgba(67,66,255,0.07)] hover:shadow-[0_8px_32px_rgba(67,66,255,0.12)]"
              >
                <div className="w-10 h-10 rounded-full bg-[#4342FF] text-white flex items-center justify-center mx-auto mb-4 text-lg fira-code-bold">
                  {step.n}
                </div>
                <h3 className="font-semibold text-base mb-2 text-[#191919]">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={CAL_COM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCta('cta_book_call', { source: 'plan' })}
              className="btn-primary fira-code-regular px-7 py-3 rounded-lg text-sm"
            >
              Agendá una llamada gratis
            </a>
            <a
              href={waPlan}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCta('cta_whatsapp', { source: 'plan' })}
              className="btn-secondary fira-code-regular px-7 py-3 rounded-lg text-sm"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ─── EL COSTO DE NO ACTUAR ─── */}
      <section className="py-20 px-4 text-center bg-white">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block text-xs uppercase tracking-widest text-[#4342FF] font-semibold mb-3">El costo de esperar</span>
          <h2 className="font-bold text-3xl md:text-4xl mb-10 text-[#191919]">
            Cada semana que pasa…
          </h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            {[
              { emoji: "⏰", text: "Tu equipo pierde horas en planillas y procesos manuales que un sistema a medida resolvería." },
              { emoji: "🐛", text: "Tu app web acumula bugs y deuda técnica que se vuelven vulnerabilidades de seguridad." },
              { emoji: "💸", text: "Cada incidente — caída, leak, dato perdido — te cuesta clientes y reputación." },
            ].map((item, i) => (
              <div
                key={i}
                className="flex-1 p-6 rounded-xl bg-white border border-gray-100 text-left transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_24px_rgba(67,66,255,0.07)] hover:shadow-[0_8px_32px_rgba(67,66,255,0.12)]"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-50 to-transparent flex items-center justify-center mb-4 text-xl">
                  {item.emoji}
                </div>
                <p className="text-sm text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EL RESULTADO ─── */}
      <section className="py-20 px-4 text-center grid-bg">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block text-xs uppercase tracking-widest text-[#4342FF] font-semibold mb-3">El resultado</span>
          <h2 className="font-bold text-3xl md:text-4xl mb-10 text-[#191919]">
            Imaginá llegar el lunes y que todo ya funcione
          </h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center mb-12">
            {[
              { emoji: "✅", text: "Software hecho para tu operación, no un SaaS genérico al que te tenés que adaptar." },
              { emoji: "✅", text: "Sistemas auditados antes de que el problema lo encuentre alguien que no querés." },
              { emoji: "✅", text: "Un equipo técnico al que le podés escribir por WhatsApp cuando algo no cierra." },
            ].map((item, i) => (
              <div
                key={i}
                className="flex-1 p-6 rounded-xl bg-white border border-gray-100 text-left transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_24px_rgba(67,66,255,0.07)] hover:shadow-[0_8px_32px_rgba(67,66,255,0.12)]"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-50 to-transparent flex items-center justify-center mb-4 text-xl">
                  {item.emoji}
                </div>
                <p className="text-sm text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="font-semibold text-xl mb-6 text-[#191919]">¿Empezamos por una llamada?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={CAL_COM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCta('cta_book_call', { source: 'success' })}
              className="btn-primary fira-code-regular px-7 py-3 rounded-lg text-sm"
            >
              Agendá una llamada gratis
            </a>
            <a
              href={waSuccess}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCta('cta_whatsapp', { source: 'success' })}
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
