import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import ServiciosHero from "../sections/ServiciosHero.tsx";

const Servicios = () => {
    return (
      <div className="w-full">
          <Header />
          <ServiciosHero />
          <Footer />
      </div>
    );
  };
  
  export default Servicios;