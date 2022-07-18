import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  build: { minify: false },
  resolve: {
    alias: {
      $holocene: path.resolve('./src/lib/holocene'),
      $fixtures: path.resolve('./src/fixtures'),
    },
  },
};

export default config;
