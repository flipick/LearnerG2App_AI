import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['chunk-GHIO4AXZ'] // Add the problematic dependency to exclude
  }
});