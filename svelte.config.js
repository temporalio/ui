import path from 'path';
import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';
import chalk from 'chalk';

const buildTarget = process.env.VITE_TEMPORAL_UI_BUILD_TARGET;
const validBuildTargets = ['local', 'cloud'];
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction && !buildTarget) {
  process.env.VITE_TEMPORAL_UI_BUILD_TARGET = 'local';
}

// Don't build anything unless a valid build target has been set.
if (!buildTarget || !validBuildTargets.includes(buildTarget)) {
  const valid = validBuildTargets.map((t) => chalk.blue(t)).join(', ');

  console.error(
    chalk.red('ERROR:'),
    `You must provide a VITE_TEMPORAL_UI_BUILD_TARGET environment variable. Valid targets: ${valid}.`,
  );

  if (buildTarget) {
    console.error(`You provided: ${chalk.bgYellowBright(buildTarget)}.`);
  }

  if (isProduction) process.exit(1);
}

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
    },
    // ssr: false,
  },
};

export default config;
// Workaround until SvelteKit uses Vite 2.3.8 (and it's confirmed to fix the Tailwind JIT problem)
const mode = process.env.NODE_ENV;
const dev = mode === 'development';
process.env.TAILWIND_MODE = dev ? 'watch' : 'build';
