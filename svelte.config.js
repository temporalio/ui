import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';
import chalk from 'chalk';

const buildTarget = process.env.TEMPORAL_UI_BUILD_TARGET;
const validBuildTargets = ['local', 'cloud'];

// Don't build anything unless a valid build target has been set.
if (!buildTarget || !validBuildTargets.includes(buildTarget)) {
  const valid = validBuildTargets.map((t) => chalk.blue(t)).join(', ');

  console.error(
    chalk.red('ERROR:'),
    `You must provide a TEMPORAL_UI_BUILD_TARGET environment variable. Valid targets: ${valid}.`,
  );

  if (buildTarget) {
    console.error(`You provided: ${chalk.bgYellowBright(buildTarget)}.`);
  }

  process.exit(1);
}

let outputDirectory = `build-${buildTarget}`;

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),

  kit: {
    adapter: adapter({
      pages: outputDirectory,
      assets: outputDirectory,
      fallback: null,
    }),
  },
};

export default config;
