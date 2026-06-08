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
