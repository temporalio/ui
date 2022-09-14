import { configDefaults, defineConfig } from 'vitest/config';
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
    environment: 'jsdom',
    setupFiles: ['./vitest_setup.ts'],
    deps: {
      inline: ['date-fns'],
    },
  },
});
