import React from "react";

export default function Hero() {
  return (
    <section className="text-center py-20 px-4">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Soluciones a medida para <br /> emprendedores modernos
      </h2>
      <p className="text-sm text-gray-600 max-w-xl mx-auto mb-6">
        Llevamos tus ideas al siguiente nivel con tecnología clara y sin complicaciones.
      </p>
      <button className="bg-black text-white px-6 py-2 text-sm font-medium rounded hover:opacity-90 transition">
        Conocé nuestro trabajo
      </button>

      <div className="bg-gray-900 text-green-400 text-left font-mono text-sm p-6 rounded-lg mt-10 max-w-2xl mx-auto">
        <p><span className="text-purple-400">›</span> andescode.dev start --project</p>
        <br />
        <p>› 1. Analizando tu idea...</p>
        <p>› 2. Planificando funcionalidades clave...</p>
        <p>› 3. Diseñando interfaz y experiencia de usuario...</p>
        <p>› 4. Programando con eficiencia y código limpio...</p>
        <p>› 5. Desplegando tu producto al mundo...</p>
        <br />
        <p>› Proyecto finalizado con éxito!</p>
        <p>› Pronto vas a tener clientes felices!</p>
      </div>
    </section>
  );
}