import Header from "../components/Header";
import Hero from "../sections/Hero";
import Footer from "../components/Footer";
import NewService from "../sections/NewService";
function Home() {
  return (
    <div className="w-full">
      <Header />
      <Hero />
      <NewService />
      <Footer />
    </div>
  );
}

export default Home;