// src/components/ParticlesBackground.tsx

import { useEffect, useState, useMemo } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim'; // Carga el motor "slim"
import type { ISourceOptions } from '@tsparticles/engine';

const ParticlesBackground = () => {
  const [init, setInit] = useState(false);
  const [particleColor, setParticleColor] = useState('#191919'); // Default para modo claro

  // 1. Detecta el modo claro/oscuro del sistema operativo
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateColor = () => {
      setParticleColor(mediaQuery.matches ? '#ffffff' : '#191919');
    };

    updateColor(); // Color inicial
    mediaQuery.addEventListener('change', updateColor); // Escucha cambios

    return () => mediaQuery.removeEventListener('change', updateColor);
  }, []);

  // 2. Inicializa el motor de partículas (solo una vez)
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  // 3. Configuración de las partículas
  // Usamos useMemo para que no se recalcule en cada render, solo si cambia el color
  const options: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: 'transparent', // Fondo del canvas transparente
        },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: 'grab', // Este es el efecto de "agarrar" nodos con el mouse
          },
        },
        modes: {
          grab: {
            distance: 140, // Distancia de interacción
            links: {
              opacity: 1,
              color: particleColor, // Color de la línea al interactuar
            },
          },
        },
      },
      particles: {
        color: {
          value: particleColor, // Color de los nodos
        },
        links: {
          color: particleColor, // Color de las líneas
          distance: 150,
          enable: true,
          opacity: 0.2, // Líneas sutiles
          width: 1,
        },
        collisions: {
          enable: false,
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: {
            default: 'bounce',
          },
          random: true,
          speed: 1, // Velocidad de movimiento
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: 80, // Cantidad de nodos
        },
        opacity: {
          value: 0.3, // Opacidad de los nodos
        },
        shape: {
          type: 'circle',
        },
        size: {
          value: { min: 1, max: 3 },
        },
      },
      detectRetina: true,
    }),
    [particleColor] // Vuelve a generar las opciones si cambia el color
  );

  if (!init) {
    return null; // No renderiza nada hasta que el motor esté listo
  }

  return (
    <Particles
      id="tsparticles"
      options={options}
      // ¡ESTA ES LA CLAVE!
      // Lo pone fijo, cubriendo toda la pantalla, y con z-index -10
      // lo manda detrás de TODO tu contenido.
      className="fixed inset-0 -z-0"
    />
  );
};

export default ParticlesBackground;