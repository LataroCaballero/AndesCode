import React from "react";

export default function Header() {
  return (
    <header className="flex gap-20 justify-between items-center py-4 border-b border-gray-200 w-full">
      <h2 className="text-2xl fira-code-bold">ANDESCODE</h2>
      <nav className="hidden md:flex gap-8 text-sm">
        <a href="#servicios" className="hover:underline text-black">Servicios</a>
        <a href="#nosotros" className="hover:underline">Nosotros</a>
        <a href="#trabajos" className="hover:underline">Trabajos</a>
        <a href="#contacto" className="hover:underline">Contacto</a>
      </nav>
      <button className="border border-black text-sm px-4 py-2 hover:bg-black hover:text-white transition">
        Agendá una reunión
      </button>
    </header>
  );
}