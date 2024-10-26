import {defineConfig, splitVendorChunkPlugin} from 'vite';
import {visualizer} from 'rollup-plugin-visualizer';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  base: '',
  server: {
    host: true,
  },
  build: {
    outDir: './dist',
    minify: 'terser'
  },
  plugins: [
    splitVendorChunkPlugin(),
    visualizer()
  ],
  test: {
    setupFiles: ['/__tests__/setup.js'],
    environment: 'jsdom'
  }
});
