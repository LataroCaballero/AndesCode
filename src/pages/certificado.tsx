import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import CertificadoVerificacion from "../sections/CertificadoVerificacion.tsx";

const Certificado = () => {
  return (
    <div className="w-full">
      <Header />
      <CertificadoVerificacion />
      <Footer />
    </div>
  );
};

export default Certificado;
