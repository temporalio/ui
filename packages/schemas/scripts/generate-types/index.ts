import { JsonSchema, jsonSchemaToZod } from 'json-schema-to-zod';
import { kebabCase } from 'change-case';
import chalk from 'chalk';

import schema from '../../src/schema.json' assert { type: 'json' };
import prettier from '../lib/prettier';

// if file doesnt exist create it
const index = Bun.file('./src/schemas/index.ts');
if (!(await index.exists())) await Bun.write('./src/schemas/index.ts', '');
const writer = index.writer();

await Bun.write('./src/schemas/index.ts', '');

for (const [name, component] of Object.entries(schema.components.schemas)) {
  const fileName = kebabCase(name);
  const filePath = `./src/schemas/${fileName}.ts`;
  const schema = jsonSchemaToZod(component as JsonSchema, {
    name: `${name}`,
    type: true,
    withJsdocs: true,
    module: 'esm',
  });

  const formatted = await prettier.format(schema, {
    parser: 'typescript',
  });

  await Bun.write(filePath, formatted);

  const exists = await Bun.file(filePath).exists();

  if (!exists) {
    throw new Error(`Failed to generate schema file: ${filePath}`);
  }

  console.log(
    chalk.cyan(
      `Schema generated successfully`,
      chalk.magenta(name),
      chalk.yellow(filePath),
    ),
  );

  writer.write(`export * from './${fileName}'\n`);
}

writer.end();
