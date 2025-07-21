import ceo from "../assets/team/ceo.jpg"; // ajustá según tu ruta real
import hug from "../assets/undraw_engineering-team_13ax.svg";
import light from "../assets/undraw_ideas_vn7a.svg";
import handshake from "../assets/undraw_business-deal_nx2n.svg";
import MouseParallaxCard from "../components/MouseParallaxCard";
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
        <div className="flex flex-wrap justify-center gap-40">
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

      {/* Testimonial */}
      <MouseParallaxCard>
        <section className="py-16">
          <div className="max-w-lg mx-auto border p-6 rounded-md shadow-2xl dark:shadow-gray-900 bg-white dark:bg-[#2A2A2A]">
            <p className="italic text-lg mb-6 dark:text-white">"Conectar ideas con impacto real, eso es AndesCode."</p>
            <div className="flex flex-col items-center dark:text-white">
              <img
                src={ceo}
                alt="Lautaro Caballero"
                className="w-16 h-16 rounded-full object-cover mb-2"></img>
              <p className="text-sm font-semibold">Lautaro Caballero</p>
              <p className="text-xs text-gray-500">Fundador & CEO</p>
            </div>
          </div>
        </section>
      </MouseParallaxCard>

      {/* Call to Action */}
      <section className="grid grid-cols-2 py-16 px-30">
        <h2 className="fira-code-medium text-xl md:text-2xl dark:text-white font-semibold mb-2 ml-10 text-left ">
          ¿Querés saber si somos el equipo <br />
          ideal para tu proyecto?
        </h2>

        <div className="flex gap-4 justify-center items-start">
          <Link to="/contacto" className="w-full md:w-64">
            <button className="w-full dark-button bg-black text-white py-2 rounded max-h-[60px]">
              Agendá una reunión
            </button>
          </Link>
          <Link to="/trabajos" className="w-full md:w-64">
            <button className="w-full border !border-black bg-white text-black dark:bg-[#191919] dark:text-white dark:!border-white  px-6 py-2 rounded hover:text-ink max-h-[60px]">
              Conocé más sobre nosotros
            </button>
          </Link>
        </div>
      </section>

    </main>
  );
}
