import node from '@sveltejs/adapter-node';
import vercel from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';

// Workaround until SvelteKit uses Vite 2.3.8 (and it's confirmed to fix the Tailwind JIT problem)
const mode = process.env.NODE_ENV;
const dev = mode === 'development';
process.env.TAILWIND_MODE = dev ? 'watch' : 'build';

const ci = !!process.env.VERCEL;

const buildPath = process.env.BUILD_PATH || 'build';

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
    adapter: ci
      ? vercel()
      : node({
          out: buildPath,
        }),
    prerender: {
      entries: [],
    },
    csp: {
      mode: 'auto',
      directives: { 'script-src': ['strict-dynamic'] },
    },
  },
};
