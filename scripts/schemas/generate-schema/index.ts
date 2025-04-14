import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

import { $, argv } from 'bun';
import chalk from 'chalk';
import degit from 'degit';
import yaml from 'js-yaml';

import { handleBunError } from '../lib/error-handler';

const { values } = parseArgs({
  args: argv,
  options: {
    output: {
      type: 'string',
      short: 'o',
      description: 'File path to write the generated schema to',
    },
  },
  strict: true,
  allowPositionals: true,
});

const schema = values.output || join('src', 'lib', 'schemas', 'schema.ts');
const openAPIDefinitionsDirectory = './tmp/api';
const openApiDefinitionsFile = join(
  openAPIDefinitionsDirectory,
  'openapi',
  'openapiv3.yaml',
);
const openApiDefinitions = Bun.file(openApiDefinitionsFile);

try {
  if (await openApiDefinitions.exists()) {
    await rm(openAPIDefinitionsDirectory, { recursive: true });
  }

  await mkdir(openAPIDefinitionsDirectory, { recursive: true });

  const emitter = degit('temporalio/api', {
    cache: false,
    force: true,
    verbose: true,
  });

  emitter.on('warn', (warning) => {
    console.warn(chalk.bgYellow(' WARN '), warning.message);
  });

  await emitter.clone(openAPIDefinitionsDirectory);

  try {
    const args = [
      openApiDefinitionsFile,
      '-o',
      schema,
      '--immutable-types',
      '--alphabetize',
      '--support-array-length',
      '--empty-objects-unknown',
      '-default-non-nullable',
    ];

    await $`npx openapi-typescript ${args}`;
  } catch (error) {
    handleBunError(error, 'Failed to generate OpenAPI schema', {
      showCommand: true,
      exitProcess: true,
    });
  }

  const openApiSchema = await openApiDefinitions.text();
  const openApiSchemaObject = yaml.load(openApiSchema);
  const openApiSchemaString = JSON.stringify(openApiSchemaObject, null, 2);

  await Bun.write('./scripts/schemas/lib/schema.json', openApiSchemaString);

  console.log(
    chalk.green('Schema generated successfully:'),
    chalk.blue(schema),
  );
} catch (error) {
  handleBunError(error, 'Schema generation failed', {
    showStackTrace: false,
    exitProcess: true,
  });
}
