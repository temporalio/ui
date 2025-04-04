import { parseArgs } from 'node:util';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import yaml from 'js-yaml';

import chalk from 'chalk';
import degit from 'degit';

import { argv, $ } from 'bun';

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

const schema = values.output || join('src', 'schema.ts');
const openAPIDefinitionsDirectory = './tmp/api';
const openApiDefinitionsFile = join(openAPIDefinitionsDirectory, 'openapi', 'openapiv3.yaml');
const openApiDefinitions = Bun.file(openApiDefinitionsFile);

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

await $`npx openapi-typescript ${openApiDefinitionsFile} -o ${schema} --immutable-types --alphabetize --support-array-length --empty-objects-unknown -default-non-nullable`.quiet();
await $`npm run format -- --log-level=error`.quiet();

const openApiSchema = await openApiDefinitions.text();
const openApiSchemaObject = yaml.load(openApiSchema);
const openApiSchemaString = JSON.stringify(openApiSchemaObject, null, 2);

await Bun.write('./src/schema.json', openApiSchemaString);

console.log(chalk.green('Schema generated successfully:'), chalk.blue(schema));
