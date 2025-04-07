import { $ } from 'bun';
import chalk from 'chalk';
import { kebabCase } from 'change-case';
import { JsonSchema, jsonSchemaToZod } from 'json-schema-to-zod';

import prettier from '../lib/prettier';
import schema from '../lib/schema.json' assert { type: 'json' };

// if file doesnt exist create it
const index = Bun.file('./src/lib/schemas/types/index.ts');
if (!(await index.exists()))
  await Bun.write('./src/lib/schemas/types/index.ts', '');
const writer = index.writer();

await Bun.write('./src/lib/schemas/types/index.ts', '');

for (const [name, component] of Object.entries(schema.components.schemas)) {
  const fileName = kebabCase(name);
  const filePath = `./src/lib/schemas/types/${fileName}.ts`;
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
      'Schema generated successfully',
      chalk.magenta(name),
      chalk.yellow(filePath),
    ),
  );

  writer.write(`export * from './${fileName}'\n`);
}

writer.end();

try {
  await $`npm run format`;
} catch (error) {
  console.error(chalk.red('Error formatting schema:'), error);
  throw error;
}
