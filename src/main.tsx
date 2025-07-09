import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from "./components/scroll.tsx";
import Home from './pages/home.tsx';
import Servicios from './pages/servicios.tsx';
import Contacto from './pages/contacto.tsx';
import Nosotros from './pages/nosotros.tsx';
import Trabajos from './pages/trabajos.tsx';

import './style.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
    <ScrollToTop>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/trabajos" element={<Trabajos />} />
        {/* podés seguir agregando más rutas */}
        <Route path="*" element={<h1>Página no encontrada</h1>} />
      </Routes>
    </ScrollToTop>
    </BrowserRouter>
  </React.StrictMode>,
);

/*ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>,
)*/