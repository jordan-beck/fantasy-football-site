import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Production optimizations
    minify: 'esbuild', // Using esbuild (default, faster than terser)
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          // Code splitting for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'markdown': ['react-markdown'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  esbuild: {
    // Remove console.logs and debugger statements in production
    drop: ['console', 'debugger'],
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 4173,
  },
})
