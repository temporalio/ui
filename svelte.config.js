import path from 'path';
import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';

const buildTarget = process.env.VITE_TEMPORAL_UI_BUILD_TARGET || 'local';

let outputDirectory = `build-${buildTarget}`;

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    preprocess({
      postcss: true,
    }),
  ],
  kit: {
    adapter: adapter({
      pages: outputDirectory,
      assets: outputDirectory,
      fallback: 'index.html',
    }),
    package: {
      dir: 'package',
      emitTypes: true,
      // include only page and layouts for now... Will add to it.
      exports: (filepath) => {
        return /^(page|layouts)/.test(filepath);
      },
      files: () => true,
    },
    vite: {
      resolve: {
        alias: {
          $types: path.resolve('./src/types'),
        },
      },
    },
  },
};

export default config;
// Workaround until SvelteKit uses Vite 2.3.8 (and it's confirmed to fix the Tailwind JIT problem)
const mode = process.env.NODE_ENV;
const dev = mode === 'development';
process.env.TAILWIND_MODE = dev ? 'watch' : 'build';
