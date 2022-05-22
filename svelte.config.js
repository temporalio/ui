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
    vite: {
      resolve: {
        alias: {
          $types: path.resolve('./src/types'),
        },
      },
      optimizeDeps: {
        exclude: ['@apollo/client', 'svelte-apollo'],
      },
      ssr: {
        noExternal: ['@apollo/client', 'svelte-apollo'],
      },
    },
  },
};

export default config;
// Workaround until SvelteKit uses Vite 2.3.8 (and it's confirmed to fix the Tailwind JIT problem)
const mode = process.env.NODE_ENV;
const dev = mode === 'development';
process.env.TAILWIND_MODE = dev ? 'watch' : 'build';
