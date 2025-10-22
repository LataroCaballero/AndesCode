import ceo from "../assets/team/ceo.jpg"; // ajustá según tu ruta real
import hug from "../assets/undraw_engineering-team_13ax.svg";
import light from "../assets/undraw_ideas_vn7a.svg";
import handshake from "../assets/undraw_business-deal_nx2n.svg";
import { Link } from "react-router-dom";


export default function NosotrosHero() {
  const valores = [
  { nombre: "Cercanía",
    tipo: "imagen",
    contenido: hug,
    clase: "w-40 h-20" },
  { nombre: "Compromiso",
    tipo: "imagen",
    contenido: handshake,
    clase: "w-20 h-50"},
  { nombre: "Creatividad",
    tipo: "imagen",
    contenido: light,
    clase:"w-50 h-50"},
];
  return (
    <main className="text-center px-4 text-ink font-sans">

      {/* Hero principal */}
      <section className="pt-30 py-20 dark:text-white">
        <h2 className="fira-code-bold pb-10 text-4xl font-bold  leading-snug">
          Tu equipo aliado para construir tecnología <br />
          con propósito
        </h2>
        <p className="max-w-xl mx-auto mt-6 text-[#191919] text-base md:text-lg dark:text-white">
          En AndesCode creemos que la tecnología es una herramienta para transformar ideas en soluciones reales.
          Nacimos para acompañar a emprendedores y empresas en el desarrollo de productos digitales,
          combinando diseño, código y visión estratégica.
        </p>
      </section>

      {/* Valores que nos diferencian */}
        <section className="py-10">
          <h2 className="fira-code-semibold text-3xl font-semibold mb-10 dark:text-white">Valores que nos diferencian</h2>
          <div className="flex flex-wrap justify-center gap-10 md:gap-40">
            {valores.map((item, i) => (
              <div key={i} className="flex flex-col items-center w-40">
                <div className="w-50 h-50 flex items-center justify-center mb-4">
                  {item.tipo === "imagen" ? (
                    <img
                      src={item.contenido}
                      alt={item.nombre}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    item.contenido
                  )}
                </div>
                <span className="text-lg font-medium text-center dark:text-white">{item.nombre}</span>
              </div>
            ))}
          </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-xl mx-auto p-8 rounded-lg bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 shadow-[#4342FF]/20 dark:shadow-[#4342FF]/30 shadow-[0_0_30px_0px_var(--tw-shadow-color)] transition-all duration-300 ease-in-out hover:shadow-[#4342FF]/40">
          <p className="italic text-lg md:text-xl text-center mb-6 dark:text-gray-300">
            "Conectar ideas con impacto real, eso es AndesCode."
          </p>
          <div className="flex flex-col items-center dark:text-white">
            <img
              src={ceo}
              alt="Lautaro Caballero"
              className="w-20 h-20 rounded-full object-cover mb-4 border-2 border-primary dark:border-accent"
            />
            <p className="text-md font-semibold fira-code-medium">Lautaro Caballero</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fundador & CEO</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
        <section className="grid grid-cols-1 md:grid-cols-2 py-16 px-6 md:px-30">
          <h2 className="fira-code-medium text-xl md:text-2xl dark:text-white font-semibold mb-2 text-center md:text-left md:ml-10">
            ¿Querés saber si somos el equipo <br />
            ideal para tu proyecto?
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-xl mx-auto">
            <Link to="/contacto" className="w-full md:w-64">
              <button className="w-full dark-button bg-black text-white px-6 py-2 rounded max-h-[60px]">
                Agendá una reunión
              </button>
            </Link>
            <Link to="/trabajos" className="w-full md:w-64">
              <button className="w-full border !border-black bg-white text-black dark:bg-[#191919] dark:text-white dark:!border-white px-6 py-2 rounded hover:text-ink max-h-[60px]">
                Conocé más sobre nosotros
              </button>
            </Link>
          </div>
        </section>

    </main>
  );
}
