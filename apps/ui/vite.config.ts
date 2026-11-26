import path from 'path';

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import { catalogLocalPlugin } from './plugins/vite-plugin-catalog-local';
import { oidcServerPlugin } from './plugins/vite-plugin-oidc-server';
import { temporalServer } from './plugins/vite-plugin-temporal-server';
import { uiServerPlugin } from './plugins/vite-plugin-ui-server';

export default defineConfig({
  plugins: [
    catalogLocalPlugin(),
    sveltekit(),
    oidcServerPlugin(),
    temporalServer(),
    uiServerPlugin(),
  ],
  optimizeDeps: {
    include: ['date-fns', 'date-fns-tz'],
  },
  build: {
    // Keep JS transforms aligned with package.json browserslist; Vite 8 defaults to newer browsers.
    target: ['chrome87', 'edge88', 'firefox78', 'safari14'],
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
