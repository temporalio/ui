import { $ } from 'bun';
import chalk from 'chalk';
import { kebabCase } from 'change-case';
import { JsonSchema, jsonSchemaToZod } from 'json-schema-to-zod';

import { handleBunError } from '../lib/error-handler';
import prettier from '../lib/prettier';
import schema from '../lib/schema.json' assert { type: 'json' };

try {
  // if file doesnt exist create it
  const index = Bun.file('./src/lib/schemas/types/index.ts');
  if (!(await index.exists()))
    await Bun.write('./src/lib/schemas/types/index.ts', '');
  const writer = index.writer();

  await Bun.write('./src/lib/schemas/types/index.ts', '');

  for (const [name, component] of Object.entries(schema.components.schemas)) {
    try {
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
        handleBunError(
          new Error(`Failed to generate schema file: ${filePath}`),
          `Failed to generate schema for ${name}`,
          { exitProcess: false },
        );
      }

      console.log(
        chalk.cyan(
          'Schema generated successfully',
          chalk.magenta(name),
          chalk.yellow(filePath),
        ),
      );

      writer.write(`export * from './${fileName}'\n`);
    } catch (error) {
      handleBunError(error, `Failed to process schema component: ${name}`, {
        exitProcess: false,
        showStackTrace: false,
      });
    }
  }

  writer.end();

  try {
    await $`npm run format`;
  } catch (error) {
    handleBunError(error, 'Failed to run code formatter', {
      showCommand: true,
      exitProcess: false,
    });
  }

  console.log(chalk.green('✅ All schema types generated successfully!'));
} catch (error) {
  handleBunError(error, 'Failed to generate schema types', {
    showStackTrace: true,
  });
}
