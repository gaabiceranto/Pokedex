import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    hmr: true
  },
  build: {
    outDir: 'www',
    assetsDir: 'assets',
    emptyOutDir: true
  },
  preview: {
    port: 3000,
    open: true
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  }
});

