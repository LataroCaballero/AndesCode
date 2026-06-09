import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { CAL_COM_URL, trackCta } from '../lib/cta';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed bg-white top-0 h-20 w-full z-50 flex justify-between items-center py-4 px-6 md:px-10 border-b border-gray-100 shadow-sm">
      <a href="/" className="logo text-2xl fira-code-bold text-[#191919]">ANDESCODE</a>
      <nav
        className={`${
          open
            ? 'flex fixed inset-0 top-20 left-0 w-full h-[calc(100%-5rem)] z-40 bg-white'
            : 'hidden'
        } flex-col items-center gap-6 py-6 md:py-0 md:absolute md:left-1/2 md:-translate-x-1/2 md:bg-transparent md:flex md:flex-row md:gap-10 text-sm`}
      >
        <Link to="/servicios" className="nav-link" onClick={() => setOpen(false)}>Servicios</Link>
        <Link to="/auditorias" className="nav-link" onClick={() => setOpen(false)}>Auditorías</Link>
        <Link to="/trabajos" className="nav-link" onClick={() => setOpen(false)}>Trabajos</Link>
        <Link to="/nosotros" className="nav-link" onClick={() => setOpen(false)}>Nosotros</Link>
        <Link to="/contacto" className="nav-link" onClick={() => setOpen(false)}>Contacto</Link>
      </nav>
      <div className="flex items-center gap-3">
        <a
          href={CAL_COM_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackCta('cta_book_call', { source: 'header' })}
          className="hidden md:inline-block btn-primary fira-code-medium px-5 py-2 rounded-lg text-sm transition"
        >
          Agendá una llamada
        </a>
        <button className="md:hidden text-2xl text-[#191919] border-none" onClick={() => setOpen(!open)}>
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </header>
  );
}
