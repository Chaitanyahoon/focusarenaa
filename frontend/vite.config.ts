/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
  server: {
    port: 3000,
    proxy: {
      // ... proxy settings
      '/api': {
        target: 'http://localhost:5134',
        changeOrigin: true
      },
      '/gamehub': {
        target: 'http://localhost:5134',
        changeOrigin: true,
        ws: true
      }
    }
  }
})
