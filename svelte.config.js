import adapter from '@sveltejs/adapter-static';
import vercel from '@sveltejs/adapter-vercel';
import { sveltePreprocess } from 'svelte-preprocess';

// Workaround until SvelteKit uses Vite 2.3.8 (and it's confirmed to fix the Tailwind JIT problem)
const mode = process.env.NODE_ENV;
const dev = mode === 'development';
process.env.TAILWIND_MODE = dev ? 'watch' : 'build';

const ci = !!process.env.VERCEL;

const buildPath = process.env.BUILD_PATH || 'build';
const PREPAINT_CSP_HASH = 'sha256-dufDOSB3s4aUvaQ5GDvfIVYOUZ4vDKt/WuBI8cbjuBk=';

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
    env: {
      // Vite-prefixed values are already client-public; this also makes the
      // visual-version build default available to the pre-paint app template.
      publicPrefix: 'VITE_',
    },
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
      directives: {
        // Hash of the data-prepaint script in src/app.html. A nonce placeholder
        // cannot be used because adapter-static must generate a fallback page.
        'script-src': ['strict-dynamic', PREPAINT_CSP_HASH],
      },
    },
  },
};
