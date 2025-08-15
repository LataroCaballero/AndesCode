import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed bg-white/80 dark:bg-[#191919]/80  top-0 h-20 w-full z-50 flex justify-between items-center py-4 px-6 md:px-10 border-b border-gray-200">
      <a href="/" className="logo text-2xl fira-code-bold">ANDESCODE</a>
      <nav
  className={`${
    open
      ? 'flex fixed inset-0 top-20 left-0 w-full h-[calc(100%-5rem)] z-40 backdrop-blur'
      : 'hidden'
  } flex-col items-center gap-6 py-6 md:py-0 md:static md:w-auto md:bg-transparent md:flex md:flex-row md:gap-14 text-sm`}
>
        <Link to="/servicios" className="nav-link" onClick={() => setOpen(false)}>Servicios</Link>
        <Link to="/nosotros" className="nav-link" onClick={() => setOpen(false)}>Nosotros</Link>
        <Link to="/trabajos" className="nav-link" onClick={() => setOpen(false)}>Trabajos</Link>
        <Link to="/contacto" className="nav-link" onClick={() => setOpen(false)}>Contacto</Link>
      </nav>
      <div className="flex items-center gap-4">
        <Link to="/contacto" className="hidden md:inline-block bg-[#191919] text-white dark:bg-white dark:text-[#191919] fira-code-medium px-4 py-2 border border-ink rounded-md transition hover:scale-105 transform duration-200 ease-in-out">
          Agendá una reunión
        </Link>
        <button className="md:hidden text-2xl" onClick={() => setOpen(!open)}>
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </header>
  );
}