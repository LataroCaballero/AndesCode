import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from "./components/scroll.tsx";
import TitleManager from "./components/TitleManager.tsx";
import { PocketBaseProvider } from "./contexts/PocketBaseContext.tsx";
import AdminGuard from "./components/AdminGuard.tsx";

import Home from './pages/home.tsx';

const Servicios = lazy(() => import('./pages/servicios.tsx'));
const Contacto = lazy(() => import('./pages/contacto.tsx'));
const Nosotros = lazy(() => import('./pages/nosotros.tsx'));
const Trabajos = lazy(() => import('./pages/trabajos.tsx'));
const PoliticaPrivacidad = lazy(() => import('./pages/politica-privacidad.tsx'));
const EliminacionDatos = lazy(() => import('./pages/eliminacion-datos.tsx'));
const AdminLoginPage = lazy(() => import('./pages/admin/login.tsx'));
const AdminPage = lazy(() => import('./pages/admin/index.tsx'));
const Certificados = lazy(() => import('./pages/certificados.tsx'));
const Certificado = lazy(() => import('./pages/certificado.tsx'));
const Auditorias = lazy(() => import('./pages/auditorias.tsx'));

import './style.css'

function RouteFallback() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white">
      <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#4342FF] animate-spin" aria-label="Cargando" />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <PocketBaseProvider>
        <TitleManager>
          <ScrollToTop>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/servicios" element={<Servicios />} />
                <Route path="/auditorias" element={<Auditorias />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/nosotros" element={<Nosotros />} />
                <Route path="/trabajos" element={<Trabajos />} />
                <Route path="/politica-de-privacidad" element={<PoliticaPrivacidad />} />
                <Route path="/eliminacion-de-datos" element={<EliminacionDatos />} />

                <Route path="/certificados" element={<Certificados />} />
                <Route path="/certificados/:certificateCode" element={<Certificado />} />

                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin" element={<AdminGuard><AdminPage /></AdminGuard>} />

                <Route path="*" element={<h1>Pagina no encontrada</h1>} />
              </Routes>
            </Suspense>
          </ScrollToTop>
        </TitleManager>
      </PocketBaseProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
