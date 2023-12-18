import adapter from '@sveltejs/adapter-static';
import vercel from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';

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
      : adapter({
          fallback: 'index.html',
          pages: buildPath,
          assets: buildPath,
        }),
    prerender: {
      entries: [],
    },
  },
};
