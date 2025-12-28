import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    target: 'es2022',
    assetsDir: 'assets',
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  },
  resolve: {
    alias: {
      src: '/src',
    },
  },
  esbuild: {
    // Critical for Angular decorators to work in JIT mode with Vite
    target: 'es2022',
    keepNames: true,
    supported: {
      'top-level-await': true
    }
  },
  define: {
    'process.env': {}
  }
});