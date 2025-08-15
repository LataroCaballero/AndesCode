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
      <section className="pt-20 py-20 dark:text-white">
        <h2 className="text-4xl font-bold fira-code-bold mb-2 mt-8">Nuestro trabajo</h2>
        <p className="text-[#191919] dark:text-white mb-12 max-w-xl mx-auto mt-5">
          Algunos de los proyectos que desarrollamos junto a nuestros clientes
        </p>

        {/* Grid de proyectos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {proyectos.map((proyecto, i) => (
            <div
              key={i}
              className="grid grid-cols-1 content-between relative border rounded-md p-6 text-center bg-white dark:bg-[#2A2A2A] hover:shadow-md transition"
            >
              {/* Etiqueta categoría */}
              <span className="absolute top-0 right-0 bg-[#191919] text-white dark:bg-white dark:text-[#191919] text-xs px-3 py-1 rounded-bl-md fira-code-regular">
                {proyecto.categoria}
              </span>

              {/* Imagen redonda */}
              <img
                src={proyecto.imagen}
                alt={proyecto.nombre}
                className="w-16 h-16 rounded-full object-cover mb-4 mt-3 place-self-center border-2 border-[#191919] dark:border-white"
              />

              {/* Nombre y descripción */}
              <h3 className="font-semibold text-lg mb-2">{proyecto.nombre}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{proyecto.descripcion}</p>

              {/* Botón */}
              <button className="border bg-[#191919] text-white dark-button px-4 py-1 text-sm rounded-md transition">
                Ver más
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Cierre CTA */}
        <section className="grid grid-cols-1 md:grid-cols-2 py-16 px-6 md:px-30">
          <h2 className="fira-code-medium text-xl md:text-2xl font-semibold mb-2 text-center md:text-left md:ml-10 dark:text-white">
            El cambio comienza hoy.
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-xl mx-auto">
            <Link to="/contacto" className="w-full md:w-64">
              <button className="w-full dark-button bg-black text-white px-6 py-2 rounded max-h-[60px]">
                Agendá una reunión
              </button>
            </Link>
            <Link to="/nosotros" className="w-full md:w-64">
              <button className="w-full border bg-white text-[#191919] !border-black dark:bg-[#191919] dark:text-[#ffffff] dark:!border-[#ffffff] px-6 py-2 rounded hover:text-ink max-h-[60px]">
                Conocé más sobre nosotros
              </button>
            </Link>
          </div>
        </section>
    </main>
  );
}
