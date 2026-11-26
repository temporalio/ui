import adapter from '@sveltejs/adapter-static';
import vercel from '@sveltejs/adapter-vercel';
import { sveltePreprocess } from 'svelte-preprocess';

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
    sveltePreprocess({
      postcss: true,
    }),
  ],
  compilerOptions: {
    runes: ({ filename }) =>
      filename.includes('node_modules') ? undefined : true,
  },
  kit: {
    alias: {
      $lib: 'src/lib',
      '$lib/*': 'src/lib/*',
      $types: 'src/lib/types',
      '$types/*': 'src/lib/types/*',
      '$components/*': 'src/components/*',
      '$fixtures/*': 'src/fixtures/*',
    },

    adapter: ci
      ? vercel()
      : adapter({
          fallback: 'index.html',
          pages: buildPath,
          assets: buildPath,
        }),
    prerender: {
      entries: [],
    },
    csp: {
      mode: 'auto',
      // 'self' rather than 'strict-dynamic': the static build gets a hash, not
      // a nonce, and hashes don't propagate to the bootstrap's import() of the
      // entry chunks. Chrome 158+ blocks those imports under 'strict-dynamic'
      // (crbug.com/515948871). See temporalio/ui#4125.
      directives: { 'script-src': ['self'] },
    },
  },
};
