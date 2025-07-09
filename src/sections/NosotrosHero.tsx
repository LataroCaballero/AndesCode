import ceo from "../assets/team/ceo.jpg"; // ajustá según tu ruta real
import hug from "../assets/hug.png";
import light from "../assets/bulb.png";
import handshake from "../assets/handshake.png";
import MouseParallaxCard from "../components/MouseParallaxCard";


export default function NosotrosHero() {
  const valores = [
  { nombre: "Cercanía", tipo: "imagen", contenido: hug },
  { nombre: "Compromiso", tipo: "imagen", contenido: handshake },
  { nombre: "Creatividad", tipo: "imagen", contenido: light },
];
  return (
    <main className="text-center px-4 text-ink font-sans">

      {/* Hero principal */}
      <section className="pt-30 py-20">
        <h2 className="fira-code-bold pb-10 text-4xl font-bold leading-snug">
          Tu equipo aliado para construir tecnología <br />
          con propósito
        </h2>
        <p className="max-w-xl mx-auto mt-6 text-ink text-base md:text-lg">
          En AndesCode creemos que la tecnología es una herramienta para transformar ideas en soluciones reales.
          Nacimos para acompañar a emprendedores y empresas en el desarrollo de productos digitales,
          combinando diseño, código y visión estratégica.
        </p>
      </section>

      {/* Valores que nos diferencian */}
      <section className="py-10">
        <h2 className="fira-code-semibold text-2xl font-semibold mb-10">Valores que nos diferencian</h2>
        <div className="flex justify-center gap-12">
          {valores.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full mb-2">
              {item.tipo === "imagen" ? (
                <img src={item.contenido} alt={item.nombre} className="w-full h-full object-cover" />
              ) : (
                item.contenido
              )}
              </div>
              <span className="text-sm font-medium">{item.nombre}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <MouseParallaxCard>
        <section className="py-16">
          <div className="max-w-lg mx-auto border p-6 rounded-md shadow-2xl bg-white">
            <p className="italic text-lg mb-6">"Conectar ideas con impacto real, eso es AndesCode."</p>
            <div className="flex flex-col items-center">
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
        <h2 className="fira-code-medium text-xl md:text-2xl font-semibold mb-6 text-left ">
          ¿Querés saber si somos el equipo <br />
           ideal para tu proyecto?
        </h2>
        <div className="grid grid-cols-2 md:flex-row gap-8 justify-center">
          <button className="bg-black text-white px-6 py-2 rounded max-h-15">
            Agendá una reunión
          </button>
          <button className="border border-black bg-white px-6 py-2 text-black rounded hover:text-ink max-h-15">
            Conocé más sobre nosotros
          </button>
        </div>
      </section>

    </main>
  );
}
