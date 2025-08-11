import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import ContactForm from "../sections/ContactForm.tsx";

const Contacto = () => {
    return (
      <div className="w-full">
        <Header />
        <ContactForm />
        <Footer />
      </div>
    );
  };
  
  export default Contacto;