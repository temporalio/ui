import path from 'path';

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import { temporalServer } from './plugins/vite-plugin-temporal-server';
import { uiServerPlugin } from './plugins/vite-plugin-ui-server';

export default defineConfig({
  plugins: [sveltekit(), temporalServer(), uiServerPlugin()],
  optimizeDeps: {
    include: ['date-fns', 'date-fns-tz'],
  },
  resolve: {
    alias: {
      $types: path.resolve('./src/types'),
      $fixtures: path.resolve('./src/fixtures'),
      $components: path.resolve('./src/lib/components/'),
      $holocene: path.resolve('./src/lib/holocene'),
      $anthropocene: path.resolve('./src/lib/anthropocene'),
    },
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
});
