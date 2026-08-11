import path from 'path';

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import { mockVisibilityPlugin } from './plugins/vite-plugin-mock-visibility';
import { oidcServerPlugin } from './plugins/vite-plugin-oidc-server';
import { temporalServer } from './plugins/vite-plugin-temporal-server';
import { uiServerPlugin } from './plugins/vite-plugin-ui-server';

export default defineConfig({
  plugins: [
    sveltekit(),
    mockVisibilityPlugin(),
    oidcServerPlugin(),
    temporalServer(),
    uiServerPlugin(),
  ],
  optimizeDeps: {
    include: ['date-fns', 'date-fns-tz'],
  },
  resolve: {
    alias: {
      $types: path.resolve('./src/types'),
      $fixtures: path.resolve('./src/fixtures'),
      $components: path.resolve('./src/lib/components/'),
      $holocene: path.resolve('./src/lib/holocene'),
    },
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
});
