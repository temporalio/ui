import path from 'path';
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { temporalServer } from './plugins/vite-plugin-temporal-server';
import i18nPlugin from './plugins/vite-plugin-i18n';

export default defineConfig({
  plugins: [
    sveltekit(),
    temporalServer(),
    i18nPlugin({
      srcDir: path.resolve('./src/lib/i18n/locales'),
      destDir: 'i18n/locales',
    }),
  ],
  optimizeDeps: {
    include: ['date-fns', 'date-fns-tz', 'websocket-as-promised'],
  },
  resolve: {
    alias: {
      $types: path.resolve('./src/types'),
      $fixtures: path.resolve('./src/fixtures'),
      $components: path.resolve('./src/lib/components/'),
    },
  },
});
