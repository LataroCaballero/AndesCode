import { Link } from "react-router-dom";
import Typewriter from "typewriter-effect";
import { useState, useEffect } from "react";
import WelcomeModal from "../components/WelcomeModal";

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem('andescodeModalSeen');
    
    if (!hasSeenModal) {
      setIsModalOpen(true);
      sessionStorage.setItem('andescodeModalSeen', 'true');
    }
  }, []);

  return (
    <section className="text-center pt-30 py-20 px-4 min-h-screen">
      
      {/* --- AÑADIR ESTA LÍNEA PARA RENDERIZAR EL MODAL --- */}
      {isModalOpen && <WelcomeModal onClose={() => setIsModalOpen(false)} />}
      <h2 className="fira-code-bold text-3xl md:text-4xl mb-4">
        Soluciones a medida para <br /> emprendedores modernos
      </h2>
      <p className="text-sm max-w-xl mx-auto mb-6">
        Llevamos tus ideas al siguiente nivel con tecnología clara y sin complicaciones.
      </p>
      <Link to="/trabajos">
        <button className="fira-code-regular bg-[#191919] text-white px-6 py-2 rounded dark-button">
          Conocé nuestro trabajo
        </button>
      </Link>

  <div className="bg-zinc-800 rounded-lg overflow-hidden shadow-lg mt-10 max-w-2xl mx-auto">
  {/* Barra superior estilo mac */}
  <div className="bg-zinc-700 h-8 flex items-center px-3 space-x-2">
    <span className="w-3 h-3 rounded-full bg-red-500"></span>
    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
    <span className="w-3 h-3 rounded-full bg-green-500"></span>
  </div>

  {/* Contenido del "terminal" */}
  <div className="p-4 text-sm fira-code-regular text-white text-left whitespace-pre-wrap">
    <Typewriter
    onInit={(typewriter) => {typewriter.typeString(`~ andescode.dev start --project

~ Analizando tu idea...
~ Planificando funcionalidades clave...
~ Diseñando interfaz y experiencia de usuario...
~ Programando con eficiencia y código limpio...
~ Desplegando tu producto al mundo...

~ Proyecto finalizado con éxito!
~ Pronto vas a tener clientes felices!`).start();
        }}
        options={{
          delay: 20,
          cursor: '_'
        }}
    />
  </div>
  </div>


      {/*<div className="bg-ink text-white text-left fira-code-regular p-6 rounded-lg mt-10 max-w-2xl mx-auto">
        <p><span className="text-accent">›</span> andescode.dev start --project</p>
        <br />
        <p>› 1. Analizando tu idea...</p>
        <p>› 2. Planificando funcionalidades clave...</p>
        <p>› 3. Diseñando interfaz y experiencia de usuario...</p>
        <p>› 4. Programando con eficiencia y código limpio...</p>
        <p>› 5. Desplegando tu producto al mundo...</p>
        <br />
        <p>› Proyecto finalizado con éxito!</p>
        <p>› Pronto vas a tener clientes felices!</p>
      </div>*/}
    </section>
  );
}