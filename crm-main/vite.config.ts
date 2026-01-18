import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        // popup HTML (keeps current behavior)
        popup: resolve(__dirname, 'popup/index.html'),
        // ensure the background service worker is built and emitted as dist/background/index.js
        background: resolve(__dirname, 'background/index.ts')
      },
      output: {
        // Emit each entry under a directory with index.js so manifest paths like "background/index.js" work.
        // For other assets, hashed names will still be used.
        entryFileNames: '[name]/index.js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  server: {
    port: 5173
  }
})