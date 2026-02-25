import { Link } from "react-router-dom";
import Typewriter from "typewriter-effect";

const techStack = [
  "React", "Node.js", "TypeScript", "Python", "n8n", "OpenAI",
  "AWS", "PostgreSQL", "Tailwind CSS", "WhatsApp API", "Supabase", "Docker",
];

export default function Hero() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative grid-bg text-center pt-36 pb-24 px-4 min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 bg-[#4342FF]/10 text-[#4342FF] text-xs font-medium px-4 py-1.5 rounded-full fira-code-medium tracking-wide">
            Software a medida · Automatizaciones · IA
          </span>
        </div>

        <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl leading-tight max-w-4xl mx-auto mb-6 text-[#191919]">
          Dejá de perder horas en tareas <br className="hidden md:block" />
          que una máquina puede hacer por vos
        </h1>

        <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto mb-10">
          Desarrollamos software a medida y automatizaciones para empresas que quieren crecer sin ahogarse en procesos manuales.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
          <Link to="/contacto">
            <button className="btn-primary fira-code-regular px-7 py-3 rounded-lg text-sm">
              Agendá tu consulta gratuita
            </button>
          </Link>
          <Link to="/servicios">
            <button className="btn-secondary fira-code-regular px-7 py-3 rounded-lg text-sm">
              Ver nuestros servicios
            </button>
          </Link>
        </div>

        {/* Terminal */}
        <div className="bg-[#1e1e2e] rounded-xl overflow-hidden max-w-2xl mx-auto shadow-[0_8px_40px_rgba(67,66,255,0.18)] transition-all duration-500 hover:shadow-[0_12px_48px_rgba(67,66,255,0.28)]">
          <div className="bg-[#2a2a3e] h-9 flex items-center px-4 gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="ml-3 text-xs text-gray-400 fira-code-regular">andescode.dev — terminal</span>
          </div>
          <div className="p-5 text-sm fira-code-regular text-green-400 text-left whitespace-pre-wrap min-h-[140px]">
            <Typewriter
              onInit={(typewriter) => {
                typewriter.typeString(`~ andescode.dev start --project\n\n~ Analizando tu idea...\n~ Planificando funcionalidades clave...\n~ Diseñando interfaz y experiencia de usuario...\n~ Programando con eficiencia y código limpio...\n~ Desplegando tu producto al mundo...\n\n~ Proyecto finalizado con éxito!\n~ Pronto vas a tener clientes felices!`).start();
              }}
              options={{ delay: 20, cursor: '_' }}
            />
          </div>
        </div>
      </section>

      {/* ─── MARQUEE — TECH STACK ─── */}
      <section className="py-10 bg-gray-50 border-y border-gray-100 overflow-hidden">
        <p className="text-center text-xs text-gray-400 uppercase tracking-widest mb-6 fira-code-regular">
          Tecnologías que usamos
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

      {/* ─── ¿TE SUENA FAMILIAR? ─── */}
      <section className="py-20 px-4 text-center bg-white">
        <div className="max-w-5xl mx-auto">
          <span className="inline-block text-xs uppercase tracking-widest text-[#4342FF] font-semibold mb-3">El problema</span>
          <h2 className="font-bold text-3xl md:text-4xl mb-12 text-[#191919]">
            ¿Te suena familiar?
          </h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center mb-10">
            {[
              { emoji: "😩", bold: '"Paso horas haciendo tareas repetitivas', rest: ' que me sacan tiempo de lo importante."' },
              { emoji: "😤", bold: '"Mi sistema actual no se adapta', rest: ' a cómo realmente funciona mi negocio."' },
              { emoji: "😰", bold: '"Siento que mi competencia avanza con tecnología', rest: ' y yo me estoy quedando atrás."' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex-1 p-6 rounded-xl bg-white border border-gray-100 text-left transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_24px_rgba(67,66,255,0.07)] hover:shadow-[0_8px_32px_rgba(67,66,255,0.12)]"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#4342FF]/15 to-transparent flex items-center justify-center mb-4 text-xl">
                  {item.emoji}
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-[#191919]">{item.bold}</span>{item.rest}
                </p>
              </div>
            ))}
          </div>
          <p className="text-base text-gray-600 max-w-xl mx-auto">
            Si alguno de estos te suena, no estás solo. Y hay una solución.
          </p>
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
              { n: "1", title: "Contanos tu problema", desc: "Agendá una consulta gratuita de 30 minutos. Escuchamos tu situación y entendemos tu negocio." },
              { n: "2", title: "Diseñamos tu solución", desc: "Te presentamos una propuesta clara con alcance, tiempos y costos. Sin sorpresas." },
              { n: "3", title: "La implementamos juntos", desc: "Desarrollamos, testeamos y entregamos. Vos seguís con tu negocio, nosotros nos encargamos de la tecnología." },
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
          <Link to="/contacto">
            <button className="btn-primary fira-code-regular px-7 py-3 rounded-lg text-sm">
              Agendá tu consulta gratuita
            </button>
          </Link>
        </div>
      </section>

      {/* ─── LO QUE ESTÁ EN JUEGO ─── */}
      <section className="py-20 px-4 text-center bg-white">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block text-xs uppercase tracking-widest text-[#4342FF] font-semibold mb-3">El costo de esperar</span>
          <h2 className="font-bold text-3xl md:text-4xl mb-10 text-[#191919]">
            Cada semana que pasa sin automatizar...
          </h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            {[
              { emoji: "⏰", text: "Tu equipo pierde horas en tareas que una máquina haría en segundos." },
              { emoji: "📉", text: "Tu competencia avanza con tecnología mientras vos seguís haciendo todo a mano." },
              { emoji: "💸", text: "Cada error manual te cuesta dinero, clientes y reputación." },
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

      {/* ─── EL ÉXITO ─── */}
      <section className="py-20 px-4 text-center grid-bg">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block text-xs uppercase tracking-widest text-[#4342FF] font-semibold mb-3">El resultado</span>
          <h2 className="font-bold text-3xl md:text-4xl mb-10 text-[#191919]">
            Imaginá llegar el lunes y que todo ya funcione
          </h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center mb-12">
            {[
              { emoji: "✅", text: "Tu equipo enfocado en lo que importa: hacer crecer el negocio, no en tareas repetitivas." },
              { emoji: "✅", text: "Un sistema que se adapta a VOS, no al revés. Hecho a medida para tu operación." },
              { emoji: "✅", text: "Tranquilidad: todo funciona, se monitorea y se actualiza. Vos dormís tranquilo." },
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
          <p className="font-semibold text-xl mb-6 text-[#191919]">¿Listo para dejar de perder tiempo?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contacto">
              <button className="btn-primary fira-code-regular px-7 py-3 rounded-lg text-sm">
                Agendá tu consulta gratuita
              </button>
            </Link>
            <Link to="/trabajos">
              <button className="btn-secondary fira-code-regular px-7 py-3 rounded-lg text-sm">
                Ver nuestros trabajos
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
