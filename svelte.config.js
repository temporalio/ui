import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';
import vercel from '@sveltejs/adapter-vercel';

// Workaround until SvelteKit uses Vite 2.3.8 (and it's confirmed to fix the Tailwind JIT problem)
const mode = process.env.NODE_ENV;
const dev = mode === 'development';
process.env.TAILWIND_MODE = dev ? 'watch' : 'build';

const buildTarget = process.env.VITE_TEMPORAL_UI_BUILD_TARGET || 'local';

const publicPath = process.env.VITE_PUBLIC_PATH || '';

/** @type {import('@sveltejs/kit').Config} */
export default {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    preprocess({
      postcss: true,
    }),
  ],
  kit: {
    adapter:
      buildTarget === 'local'
        ? adapter({
            fallback: 'index.html',
          })
        : vercel(),
    paths: {
      base: publicPath,
    },
    version: {
      pollInterval: 10000,
    },
  },
};
