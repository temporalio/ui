import path from 'path';

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import { oidcServerPlugin } from './plugins/vite-plugin-oidc-server';
import { temporalServer } from './plugins/vite-plugin-temporal-server';
import { uiServerPlugin } from './plugins/vite-plugin-ui-server';
import { workflowCatalogLocalPlugin } from './plugins/vite-plugin-workflow-catalog-local';

export default defineConfig({
  plugins: [
    workflowCatalogLocalPlugin(),
    sveltekit(),
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
