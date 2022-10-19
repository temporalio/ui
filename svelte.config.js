import preprocess from 'svelte-preprocess';
import vercel from '@sveltejs/adapter-vercel';

// Workaround until SvelteKit uses Vite 2.3.8 (and it's confirmed to fix the Tailwind JIT problem)
const mode = process.env.NODE_ENV;
const dev = mode === 'development';
process.env.TAILWIND_MODE = dev ? 'watch' : 'build';

const buildTarget = process.env.VITE_TEMPORAL_UI_BUILD_TARGET || 'local';
let outputDirectory = `build-${buildTarget}`;

const publicPath = process.env.VITE_PUBLIC_PATH || '';

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
    adapter: vercel({
      pages: outputDirectory,
      assets: outputDirectory,
      fallback: 'index.html',
    }),
    paths: {
      base: publicPath,
    },
    package: {
      dir: 'package',
      emitTypes: true,
      // Don't include components for now.
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      exports: (filepath) => {
        return /^(layouts|models|pages|services|stores|utilities|holocene|vendor)/.test(
          filepath,
        );
      },
      //eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      files: (filepath) =>
        /^(?!.*\.(spec|test)\.ts$).*\.(svelte|ts|gif)$/.test(
          filepath,
        ),
    },
    version: {
      pollInterval: 10000,
    },
  },
};

export default config;
