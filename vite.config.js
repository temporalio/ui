import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  optimizeDeps: {
    include: ['date-fns', 'date-fns-tz', 'websocket-as-promised'],
  },
  resolve: {
    alias: {
      $types: path.resolve('./src/types'),
      $holocene: path.resolve('./src/lib/holocene'),
      $fixtures: path.resolve('./src/fixtures'),
    },
  },
};

export default config;
