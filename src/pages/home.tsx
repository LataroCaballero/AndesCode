import React from "react";
import Header from "../components/Header";
import Hero from "../sections/Hero";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="w-full">
      <Header />
      <Hero />
      <Footer />
    </div>
  );
}

export default Home;