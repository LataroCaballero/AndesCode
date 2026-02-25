import ceo from "../assets/team/ceo.jpg";
import hug from "../assets/undraw_engineering-team_13ax.svg";
import light from "../assets/undraw_ideas_vn7a.svg";
import handshake from "../assets/undraw_business-deal_nx2n.svg";
import { Link } from "react-router-dom";

export default function NosotrosHero() {
  const valores = [
    {
      nombre: "Cercanía real",
      descripcion: "No somos una consultora lejana. Estamos en San Juan, hablamos tu idioma y entendemos tu contexto.",
      img: hug,
    },
    {
      nombre: "Obsesión por el resultado",
      descripcion: "No nos importa cuántas líneas de código escribimos. Nos importa que tu problema se resuelva.",
      img: handshake,
    },
    {
      nombre: "Soluciones que duran",
      descripcion: "No entregamos y desaparecemos. Te acompañamos para que tu tecnología siga funcionando.",
      img: light,
    },
  ];

  return (
    <main className="text-center text-[#191919] font-sans">

      {/* Hero principal */}
      <section className="relative grid-bg pt-36 pb-20 px-4 overflow-hidden">
        <span className="inline-block text-xs uppercase tracking-widest text-[#4342FF] font-semibold mb-3">Quiénes somos</span>
        <h1 className="font-bold text-4xl md:text-5xl leading-snug mb-6 text-[#191919]">
          No somos otra empresa de software. <br />
          Somos tu equipo de tecnología.
        </h1>
        <p className="max-w-xl mx-auto text-base md:text-lg text-gray-600">
          En AndesCode creemos que ninguna empresa debería perder tiempo en tareas que una máquina puede hacer mejor.
          Nacimos en San Juan para acompañar a emprendedores y empresas que quieren crecer con tecnología a medida, no con soluciones genéricas que no se adaptan.
        </p>
        <p className="max-w-xl mx-auto mt-4 text-base text-gray-600">
          No te vamos a vender algo que no necesitás. Primero escuchamos, después proponemos.
        </p>
      </section>

      {/* Valores */}
      <section className="bg-white py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <span className="inline-block text-xs uppercase tracking-widest text-[#4342FF] font-semibold mb-3">Nuestros valores</span>
          <h2 className="font-bold text-3xl mb-10 text-[#191919]">Valores que nos diferencian</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {valores.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-5 rounded-xl bg-white border border-gray-100 transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_24px_rgba(67,66,255,0.07)] hover:shadow-[0_8px_32px_rgba(67,66,255,0.12)]"
              >
                <div className="w-14 h-14 shrink-0 flex items-center justify-center bg-gradient-to-br from-[#4342FF]/10 to-transparent rounded-xl p-2">
                  <img src={item.img} alt={item.nombre} className="w-full h-full object-contain" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-semibold text-[#191919] block mb-1">{item.nombre}</span>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CEO Quote */}
      <section className="grid-bg py-16 px-4">
        <div className="max-w-xl mx-auto p-8 rounded-xl bg-white border border-gray-100 border-l-4 border-l-[#4342FF] shadow-[0_4px_24px_rgba(67,66,255,0.08)] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(67,66,255,0.14)] text-left">
          <p className="italic text-lg md:text-xl text-gray-700 mb-6 leading-relaxed">
            "Empecé AndesCode porque vi demasiadas empresas gastando fortunas en software que no les servía. Quise hacer algo distinto: escuchar primero, construir después."
          </p>
          <div className="flex items-center gap-4">
            <img
              src={ceo}
              alt="Lautaro Caballero"
              className="w-14 h-14 rounded-full object-cover border-2 border-[#4342FF]"
            />
            <div>
              <p className="font-semibold text-[#191919] fira-code-medium">Lautaro Caballero</p>
              <p className="text-sm text-gray-500">Fundador & CEO</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-white py-16 px-6 md:px-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <h2 className="font-semibold text-xl md:text-2xl text-[#191919] text-center md:text-left">
            ¿Querés saber si somos el equipo <br />
            ideal para tu proyecto?
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xl mx-auto">
            <Link to="/contacto" className="w-full md:w-auto">
              <button className="w-full btn-primary px-6 py-2.5 rounded-lg text-sm">
                Agendá tu consulta gratuita
              </button>
            </Link>
            <Link to="/trabajos" className="w-full md:w-auto">
              <button className="w-full btn-secondary px-6 py-2.5 rounded-lg text-sm">
                Mirá nuestros trabajos
              </button>
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
