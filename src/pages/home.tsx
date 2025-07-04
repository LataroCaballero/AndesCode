/*export default function Home() {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold text-red-600">Bienvenido a AndesCode</h1>
      </main>
    );
  }
*/

import React from "react";
import Header from "../components/Header";
import Hero from "../sections/Hero";

function Home() {
  return (
    <div className="w-full">
      <Header />
      <Hero />
    </div>
  );
}

export default Home;