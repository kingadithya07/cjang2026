import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    target: 'es2022',
    assetsDir: 'assets',
    sourcemap: true
  },
  resolve: {
    alias: {
      src: '/src',
    },
  },
  esbuild: {
    // Angular uses decorators, ensure esbuild handles them
    target: 'es2022',
    keepNames: true
  },
  define: {
    // Define process.env for libs that might expect it
    'process.env': {}
  }
});