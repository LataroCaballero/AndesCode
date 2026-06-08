import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import CertificadosSearch from "../sections/CertificadosSearch.tsx";

const Certificados = () => {
  return (
    <div className="w-full">
      <Header />
      <CertificadosSearch />
      <Footer />
    </div>
  );
};

export default Certificados;
