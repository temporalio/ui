import path from 'path';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';

import { catalogLocalPlugin } from './plugins/vite-plugin-catalog-local';

export default defineConfig({
  plugins: [catalogLocalPlugin(), svelte({ hot: false })],
  resolve: {
    alias: [
      // Component tests mount Svelte client-side. Left alone, the bare `svelte`
      // specifier resolves to index-server.js and mount() throws
      // lifecycle_function_unavailable. Scoped to an exact match so that
      // `svelte/store` and friends still resolve normally, and so Node-side
      // dependencies (prettier in scripts/catalog) keep their server builds —
      // a global resolve.conditions: ['browser'] breaks those.
      {
        find: /^svelte$/,
        replacement: path.resolve(
          __dirname,
          './node_modules/svelte/src/index-client.js',
        ),
      },
      { find: '$lib', replacement: path.resolve(__dirname, './src/lib') },
      { find: '$types', replacement: path.resolve(__dirname, './src/types') },
      {
        find: '$components',
        replacement: path.resolve(__dirname, './src/lib/components/'),
      },
      {
        find: '$app',
        replacement: path.resolve(__dirname, './src/lib/svelte-mocks/app/'),
      },
      {
        find: '$fixtures',
        replacement: path.resolve(__dirname, './src/fixtures/'),
      },
    ],
  },
  test: {
    include: ['**/*.test.ts', '**/*.spec.ts'],
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
      'tests',
      '.svelte-kit',
      '.catalog-tmp/**',
    ],
    globalSetup: ['./vitest-global-setup.ts'],
    environment: 'jsdom',
    setupFiles: ['./vitest-setup.ts', 'vitest-localstorage-mock'],
    deps: {
      inline: ['date-fns'],
    },
  },
});
