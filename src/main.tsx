import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from "./components/scroll.tsx";
import TitleManager from "./components/TitleManager.tsx";
import { PocketBaseProvider } from "./contexts/PocketBaseContext.tsx";
import AdminGuard from "./components/AdminGuard.tsx";

import Home from './pages/home.tsx';
import Servicios from './pages/servicios.tsx';
import Contacto from './pages/contacto.tsx';
import Nosotros from './pages/nosotros.tsx';
import Trabajos from './pages/trabajos.tsx';
import PoliticaPrivacidad from './pages/politica-privacidad.tsx';
import EliminacionDatos from './pages/eliminacion-datos.tsx';
import AdminLoginPage from './pages/admin/login.tsx';
import AdminPage from './pages/admin/index.tsx';
import Certificados from './pages/certificados.tsx';
import Certificado from './pages/certificado.tsx';

import './style.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <PocketBaseProvider>
        <TitleManager>
          <ScrollToTop>
            <Routes>
              {/* Rutas públicas del sitio de marketing */}
              <Route path="/" element={<Home />} />
              <Route path="/servicios" element={<Servicios />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/nosotros" element={<Nosotros />} />
              <Route path="/trabajos" element={<Trabajos />} />
              <Route path="/politica-de-privacidad" element={<PoliticaPrivacidad />} />
              <Route path="/eliminacion-de-datos" element={<EliminacionDatos />} />

              {/* Rutas públicas de verificación de certificados — Plan 02-02 */}
              <Route path="/certificados" element={<Certificados />} />
              <Route path="/certificados/:certificateCode" element={<Certificado />} />

              {/* Rutas de administración — Plan 02-01 */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminGuard><AdminPage /></AdminGuard>} />

              {/* Catch-all — siempre al final */}
              <Route path="*" element={<h1>Pagina no encontrada</h1>} />
            </Routes>
          </ScrollToTop>
        </TitleManager>
      </PocketBaseProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
