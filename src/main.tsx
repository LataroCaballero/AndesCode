import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from "./components/scroll.tsx";
import TitleManager from "./components/TitleManager.tsx";

import Home from './pages/home.tsx';
import Servicios from './pages/servicios.tsx';
import Contacto from './pages/contacto.tsx';
import Nosotros from './pages/nosotros.tsx';
import Trabajos from './pages/trabajos.tsx';
import PoliticaPrivacidad from './pages/politica-privacidad.tsx';
import EliminacionDatos from './pages/eliminacion-datos.tsx';

import './style.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <TitleManager>
        <ScrollToTop>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/trabajos" element={<Trabajos />} />
            <Route path="/politica-de-privacidad" element={<PoliticaPrivacidad />} />
            <Route path="/eliminacion-de-datos" element={<EliminacionDatos />} />
            <Route path="*" element={<h1>Pagina no encontrada</h1>} />
          </Routes>
        </ScrollToTop>
      </TitleManager>
    </BrowserRouter>
  </React.StrictMode>,
);
