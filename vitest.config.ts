/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, './src/lib'),
      $types: path.resolve(__dirname, './src/types'),
      $components: path.resolve(__dirname, './src/lib/components/'),
      $holocene: path.resolve(__dirname, './src/lib/holocene/'),
      $app: path.resolve(__dirname, './src/lib/svelte-mocks/app/'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    deps: {
      inline: ['date-fns'],
    },
  },
});
