import { writeFile } from 'fs/promises';
import * as path from 'path';

import glob from 'fast-glob';
import prettier from 'prettier';

const icons = await glob('./src/lib/holocene/icon/svg/*.svelte').then((files) =>
  files.map((icon) => path.basename(icon, '.svelte')),
);

const types = `export type IconName = ${icons
  .map((icon) => `'${icon}'`)
  .join(' | ')};`;

const config = await prettier.resolveConfigFile('.prettierrc');
const options = config ? await prettier.resolveConfig(config) : undefined;

if (!options) throw new Error('Prettier config not found!');

const formatted = await prettier.format(types, {
  ...options,
  parser: 'typescript',
});

writeFile('./src/lib/holocene/icon/types.ts', formatted);
