import project1 from "../assets/projects/mocion.jpg";
import project2 from "../assets/projects/sbcuyo.jpg";
import project3 from "../assets/projects/motivationnau.jpg";
import project4 from "../assets/projects/cinetika.jpg";
import { Link } from "react-router-dom";

const proyectos = [
  {
    nombre: "Moción NAU",
    descripcion: "Plataforma de peticiones ciudadanas, desarrollada con enfoque social. Desde diseño UX hasta desarrollo backend.",
    categoria: "App Web",
    imagen: project1,
  },
  {
    nombre: "SBCuyo",
    descripcion: "Sitio institucional optimizado, mantenido y actualizado por AndesCode. Velocidad + contenido clave.",
    categoria: "Mantenimiento Web",
    imagen: project2,
  },
  {
    nombre: "MotivationNAU",
    descripcion: "Plataforma web de IA que permite a los usuarios videos motivacionales personalizados.",
    categoria: "SaaS IA",
    imagen: project3,
  },
  {
    nombre: "Cinetika",
    descripcion: "Dashboard para un centro de rendimiento deportivo. Visualización de datos de pacientes en gráficos.",
    categoria: "Sistema a Medida",
    imagen: project4,
  },
];

export default function NuestroTrabajo() {
  return (
    <main className="text-center px-4 text-ink">
      
      {/* Título principal */}
      <section className="pt-20 py-20">
        <h2 className="text-4xl font-bold fira-code-bold mb-2 mt-8">Nuestro trabajo</h2>
        <p className="text-ink mb-12 max-w-xl mx-auto mt-5">
          Algunos de los proyectos que desarrollamos junto a nuestros clientes
        </p>

        {/* Grid de proyectos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {proyectos.map((proyecto, i) => (
            <div
              key={i}
              className="grid grid-cols-1 content-between relative border rounded-md p-6 text-center bg-white hover:shadow-md transition"
            >
              {/* Etiqueta categoría */}
              <span className="absolute top-0 right-0 bg-black text-white text-xs px-3 py-1 rounded-bl-md fira-code-regular">
                {proyecto.categoria}
              </span>

              {/* Imagen redonda */}
              <img
                src={proyecto.imagen}
                alt={proyecto.nombre}
                className="w-16 h-16 rounded-full object-cover mb-4 mt-3 place-self-center"
              />

              {/* Nombre y descripción */}
              <h3 className="font-semibold text-lg mb-2">{proyecto.nombre}</h3>
              <p className="text-sm text-gray-600 mb-4">{proyecto.descripcion}</p>

              {/* Botón */}
              <button className="border px-4 py-1 text-sm bg-white rounded-md hover:bg-gray-100 transition">
                Ver más
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Cierre CTA */}
      <section className="grid grid-cols-2 py-16 px-30">
        <h2 className="fira-code-medium text-xl md:text-2xl font-semibold mb-2 ml-10 text-left">
          El cambio comienza hoy.
        </h2>

        <div className="flex gap-4 justify-center items-start">
          <Link to="/contacto" className="w-full md:w-64">
            <button className="w-full bg-black text-white py-2 rounded max-h-[60px]">
              Agendá una reunión
            </button>
          </Link>
          <Link to="/Nosotros" className="w-full md:w-64">
            <button className="w-full border border-black bg-white px-6 py-2 text-black rounded hover:text-ink max-h-[60px]">
              Conocé más sobre nosotros
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
