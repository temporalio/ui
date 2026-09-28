import { existsSync } from 'fs';
import { createRequire } from 'module';
import path from 'path';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';

import { catalogLocalPlugin } from './plugins/vite-plugin-catalog-local';

const requireFromConfig = createRequire(import.meta.url);
const svelteBrowserEntry = requireFromConfig('svelte/package.json').exports['.']
  ?.browser;

if (typeof svelteBrowserEntry !== 'string') {
  throw new Error(
    "svelte's package exports no longer expose a string browser entry for '.'",
  );
}

// Resolve against node_modules/svelte, NOT require.resolve's realpath. Under
// pnpm that realpath lives in .pnpm/, a different path string from the one
// `svelte/internal/client` resolves to — and compiled components import the
// runtime from there, not from the bare `svelte` specifier this alias rewrites.
// Two path strings for the same file means two runtime instances with separate
// effect schedulers, so mount()/flushSync() drive a different scheduler than the
// components use and part of the tree never finishes rendering.
const svelteClientEntry = path.resolve(
  __dirname,
  'node_modules/svelte',
  svelteBrowserEntry,
);

if (!existsSync(svelteClientEntry)) {
  throw new Error(
    `Expected svelte's client entry at ${svelteClientEntry} but it does not exist`,
  );
}

export default defineConfig({
  plugins: [catalogLocalPlugin(), svelte({ hot: false })],
  resolve: {
    alias: [
      // Component tests mount Svelte client-side. Left alone, the bare `svelte`
      // specifier resolves to its server build and mount() throws
      // lifecycle_function_unavailable. Scoped to an exact match so that
      // `svelte/store` and friends still resolve normally, and so Node-side
      // dependencies (prettier in scripts/catalog) keep their server builds —
      // a global resolve.conditions: ['browser'] breaks those.
      { find: /^svelte$/, replacement: svelteClientEntry },
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
