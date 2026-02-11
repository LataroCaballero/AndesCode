import EliminacionDatos from "../sections/EliminacionDatos.tsx";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";

const EliminacionDatosPage = () => {
  return (
    <div className="w-full">
      <Header />
      <EliminacionDatos />
      <Footer />
    </div>
  );
};

export default EliminacionDatosPage;
