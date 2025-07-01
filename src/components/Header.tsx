import React from "react";

export default function Header() {
  return (
    <header className="flex justify-between items-center py-6 px-8 border-b border-gray-200">
      <h1 className="text-sm fira-code-bold">ANDESCODE</h1>
      <nav className="hidden md:flex gap-6 text-sm">
        <a href="#servicios" className="hover:underline">Servicios</a>
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