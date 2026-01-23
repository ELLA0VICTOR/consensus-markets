import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 3000,
    open: true,
    host: true, // Allow network access for testing on devices
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'genlayer': ['genlayer-js'],
        },
      },
    },
    // Increase chunk size warning limit (if needed)
    chunkSizeWarningLimit: 1000,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'genlayer-js'],
  },
  
  // Enable CSS code splitting
  css: {
    devSourcemap: true,
  },
});