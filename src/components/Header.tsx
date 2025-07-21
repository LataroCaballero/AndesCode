import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="fixed backdrop-blur top-0 h-20 w-full z-50 flex gap-20 justify-between items-center py-4 px-10 border-b border-gray-200">
        <a href="/" className="logo text-2xl fira-code-bold">ANDESCODE</a>
        <nav className="hidden md:flex gap-14 text-sm">
          <Link to="/servicios" className="nav-link">Servicios</Link>
          <Link to="/nosotros" className="nav-link">Nosotros</Link>
          <Link to="/trabajos" className="nav-link">Trabajos</Link>
          <Link to="/contacto" className="nav-link">Contacto</Link>
        </nav>
        <Link to="/contacto" className={`inline-block bg-[#191919] text-white dark:bg-white dark:text-[#191919] fira-code-medium px-4 py-2 border border-ink rounded-md transition hover:scale-105 transform duration-200 ease-in-out`}>
        Agendá una reunión
        </Link>
    </header>
  );
}