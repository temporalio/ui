import path from 'path';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  plugins: [svelte({ hot: false })],
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, './src/lib'),
      $types: path.resolve(__dirname, './src/types'),
      $components: path.resolve(__dirname, './src/lib/components/'),
      $app: path.resolve(__dirname, './src/lib/svelte-mocks/app/'),
      $fixtures: path.resolve(__dirname, './src/fixtures/'),
    },
  },
  test: {
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        ...configDefaults.exclude,
        'src/lib/svelte-mocks/**/*',
        'src/lib/utilities/get-environment.ts',
        '**/*.test.ts',
      ],
    },
    exclude: [
      ...configDefaults.exclude,
      'package',
      'build',
      'e2e',
      'cypress',
      'tests',
    ],
    environment: 'jsdom',
    setupFiles: ['./vitest-setup.ts', 'vitest-localstorage-mock'],
    deps: {
      inline: ['date-fns'],
    },
  },
});
