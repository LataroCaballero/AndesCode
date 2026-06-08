/// <reference types="vite/client" />

// INFRA-08: Augment ImportMetaEnv with VITE_POCKETBASE_URL so TypeScript
// recognizes import.meta.env.VITE_POCKETBASE_URL throughout the app.
// CRITICAL: No import statements allowed here — any import breaks global module augmentation.
interface ImportMetaEnv {
  readonly VITE_POCKETBASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// QRPDF-05: Declarar módulo ?url para archivos TTF para que TypeScript en modo strict
// acepte `import fontUrl from '../assets/fonts/Inter-Regular.ttf?url'`.
// Los tipos de vite/client cubren .png/.svg pero NO .ttf?url — debe declararse explícitamente.
// CRÍTICO: Sin sentencias import — este es un archivo de declaración solamente.
declare module '*.ttf?url' {
  const url: string;
  export default url;
}
