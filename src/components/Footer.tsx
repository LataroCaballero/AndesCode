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
        {/* Navegación y marca */}
        <nav className="flex flex-wrap justify-center items-center gap-8 text-sm font-medium">
          <Link to="/servicios" className="nav-link">Servicios</Link>
          <Link to="/nosotros" className="nav-link">Nosotros</Link>
          <Link to="/" className="logo text-2xl fira-code-bold">ANDESCODE</Link>
          <Link to="/trabajos" className="nav-link">Trabajos</Link>
          <Link to="/contacto" className="nav-link">Contacto</Link>
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
