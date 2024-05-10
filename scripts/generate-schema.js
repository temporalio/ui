import { mkdir, rm, stat } from 'fs/promises';
import { join } from 'path';

import chalk from 'chalk';
import degit from 'degit';
import { $ } from 'zx';

const openAPIDefinitionsDirectory = './tmp/api';
const openApiDefinitions = join(
  openAPIDefinitionsDirectory,
  'openapi',
  'openapiv3.yaml',
);
const schema = join('src', 'api', 'schema.d.ts');

const directoryExists = await stat(openAPIDefinitionsDirectory)
  .then(() => true)
  .catch(() => false);

if (directoryExists) {
  await rm(openAPIDefinitionsDirectory, { recursive: true });
}

await mkdir(openAPIDefinitionsDirectory, { recursive: true });

const emitter = degit('temporalio/api', {
  cache: false,
  force: true,
  verbose: true,
});

emitter.on('info', (info) => {
  console.log(chalk.bgBlue(' INFO '), info.message);
});

emitter.on('warn', (warning) => {
  console.warn(chalk.bgYellow(' WARN '), warning.message);
});

emitter.on('error', (error) => {
  console.error(chalk.bgRed(' ERROR '), error.message);
});

await emitter.clone(openAPIDefinitionsDirectory);

await $`npx openapi-typescript ${openApiDefinitions} -o ${schema}`;
await $`npm run format`;
