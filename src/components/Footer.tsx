import { FaInstagram, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { FaMapMarkerAlt } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";
import { Link } from "react-router-dom";

export default function Footer() {
  const socialIcons = [
    { icon: <FaXTwitter />, link: "https://twitter.com" },
    { icon: <FaInstagram />, link: "https://www.instagram.com/andescodesj/" },
    { icon: <FaWhatsapp />, link: "https://wa.me/5492644432919" },
    { icon: <MdOutlineMail />, link: "contacto" },/*proximamente*/
    { icon: <FaMapMarkerAlt />, link: "https://maps.app.goo.gl/wMh49AFx2GGWnWvD6" },
  ];

  return (
    <footer className="text-ink px-4 py-12">
      <div className="max-w-7xl mx-auto flex flex-col items-center space-y-8">
        {/* Nav */}
        <nav className="w-full flex flex-col items-center gap-6">
          {/* Desktop: fila única */}
          <div className="hidden md:flex items-center justify-center gap-10 text-sm">
            <a href="/servicios" className="nav-link">Servicios</a>
            <a href="/nosotros" className="nav-link">Nosotros</a>
            <span className="fira-code-bold text-xl">ANDESCODE</span>
            <a href="/trabajos" className="nav-link">Trabajos</a>
            <a href="/contacto" className="nav-link">Contacto</a>
          </div>

          {/* Mobile: logo + grilla 2×2 */}
          <div className="md:hidden w-full flex flex-col items-center gap-5">
            <span className="fira-code-bold text-xl">ANDESCODE</span>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-center text-sm">
              <a href="/servicios" className="nav-link">Servicios</a>
              <a href="/nosotros" className="nav-link">Nosotros</a>
              <a href="/trabajos" className="nav-link">Trabajos</a>
              <a href="/contacto" className="nav-link">Contacto</a>
            </div>
          </div>
        </nav>

        {/* Línea divisoria */}
        <hr className="w-full border border-gray-400" />

        {/* Íconos sociales */}
        <div className="flex gap-6 dark:text-white">
          {socialIcons.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 border border-gray-400 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {item.icon}
            </a>
          ))}
        </div>

        {/* Derechos y enlaces */}
        <p className="text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} AndesCode —{" "}
          <a href="#" className="hover:text-primary">Privacy</a> —{" "}
          <a href="#" className="hover:text-primary">Terms</a>
        </p>
      </div>
    </footer>
  );
}
