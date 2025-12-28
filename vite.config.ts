import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    target: 'esnext',
    modulePreload: false,
    minify: false,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: [],
    }
  },
  resolve: {
    alias: {
      src: '/src',
    },
  },
  optimizeDeps: {
    include: [
      '@angular/common',
      '@angular/compiler',
      '@angular/core',
      '@angular/forms',
      '@angular/platform-browser',
      '@angular/router',
      'rxjs'
    ]
  },
  esbuild: {
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