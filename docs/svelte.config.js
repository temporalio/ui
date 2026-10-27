import { fileURLToPath } from 'node:url';

import adapter from '@sveltejs/adapter-static';
import { sveltePreprocess } from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: sveltePreprocess({ postcss: true }),
  compilerOptions: {
    runes: ({ filename }) =>
      filename.includes('node_modules') ? undefined : true,
  },
  kit: {
    adapter: adapter(),
    alias: {
      $docs: fileURLToPath(new URL('./src', import.meta.url)),
      $types: fileURLToPath(new URL('../src/lib/types', import.meta.url)),
    },
    files: {
      appTemplate: '../src/app.html',
      lib: '../src/lib',
    },
  },
};

export default config;
