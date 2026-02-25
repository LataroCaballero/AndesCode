import { FaInstagram, FaWhatsapp } from "react-icons/fa6";
import { FaMapMarkerAlt } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";
import { Link } from "react-router-dom";

export default function Footer() {
  const socialIcons = [
    { icon: <FaInstagram />, link: "https://www.instagram.com/andescodesj/" },
    { icon: <FaWhatsapp />, link: "https://wa.me/5492644432919" },
    { icon: <MdOutlineMail />, link: "contacto" },
    { icon: <FaMapMarkerAlt />, link: "https://maps.app.goo.gl/wMh49AFx2GGWnWvD6" },
  ];

  return (
    <footer className="grid-bg-dark text-white px-4 py-14">
      <div className="max-w-7xl mx-auto flex flex-col items-center space-y-8">
        {/* Nav */}
        <nav className="w-full flex flex-col items-center gap-6">
          {/* Desktop */}
          <div className="hidden md:flex items-center justify-center gap-10 text-sm">
            <Link to="/servicios" className="text-gray-400 hover:text-white transition font-medium">Servicios</Link>
            <Link to="/nosotros" className="text-gray-400 hover:text-white transition font-medium">Nosotros</Link>
            <a href="/" className="fira-code-bold text-white text-xl">ANDESCODE</a>
            <Link to="/trabajos" className="text-gray-400 hover:text-white transition font-medium">Trabajos</Link>
            <Link to="/contacto" className="text-gray-400 hover:text-white transition font-medium">Contacto</Link>
          </div>

          {/* Mobile */}
          <div className="md:hidden w-full flex flex-col items-center gap-5">
            <a href="/" className="fira-code-bold text-white text-xl">ANDESCODE</a>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-center text-sm">
              <Link to="/servicios" className="text-gray-400 hover:text-white transition">Servicios</Link>
              <Link to="/nosotros" className="text-gray-400 hover:text-white transition">Nosotros</Link>
              <Link to="/trabajos" className="text-gray-400 hover:text-white transition">Trabajos</Link>
              <Link to="/contacto" className="text-gray-400 hover:text-white transition">Contacto</Link>
            </div>
          </div>
        </nav>

        <hr className="w-full border-white/10" />

        {/* Social icons */}
        <div className="flex gap-4">
          {socialIcons.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:border-white/50 transition"
            >
              {item.icon}
            </a>
          ))}
        </div>

        {/* Rights */}
        <p className="text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} AndesCode —{" "}
          <Link to="/politica-de-privacidad" className="hover:text-white transition">Política de Privacidad</Link> —{" "}
          <Link to="/eliminacion-de-datos" className="hover:text-white transition">Eliminación de Datos</Link>
        </p>
      </div>
    </footer>
  );
}
