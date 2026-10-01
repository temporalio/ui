import path from 'path';

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

import { catalogLocalPlugin } from './plugins/vite-plugin-catalog-local';
import { oidcServerPlugin } from './plugins/vite-plugin-oidc-server';
import { temporalServer } from './plugins/vite-plugin-temporal-server';
import { uiServerPlugin } from './plugins/vite-plugin-ui-server';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = Number(env.VITE_DEV_PORT) || 3000;

  return {
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
    resolve: {
      alias: {
        $types: path.resolve('./src/types'),
        $fixtures: path.resolve('./src/fixtures'),
        $components: path.resolve('./src/lib/components/'),
        $holocene: path.resolve('./src/lib/holocene'),
      },
    },
    server: {
      port,
    },
    preview: {
      port,
    },
  };
});
