import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          pdf: ['jspdf', 'qrcode', 'qrcode.react'],
          pocketbase: ['pocketbase'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
