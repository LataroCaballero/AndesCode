import React from "react";

export default function Header() {
  return (
    <header className="fixed top-0 h-20 w-full z-50 flex gap-20 justify-between items-center py-4 px-10 border-b border-gray-200">
        <a href="index.html" className="logo text-2xl fira-code-bold">ANDESCODE</a>
        <nav className="hidden md:flex gap-14 text-sm">
          <a href="#servicios" className="nav-link">Servicios</a>
          <a href="#nosotros" className="nav-link">Nosotros</a>
          <a href="#trabajos" className="nav-link">Trabajos</a>
          <a href="#contacto" className="nav-link">Contacto</a>
        </nav>
        <button className="fira-code-regular text-white px-4 py-2">
        Agendá una reunión
        </button>
    </header>
  );
}