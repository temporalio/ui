import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

import glob from 'fast-glob';

import { parseTailwindClass } from './parse-tailwind-class';
import { toRows } from './to-rows';
import type { Result } from './types';
import { isDirectory, pattern, src } from './utilities';
import { getProjectRoot } from '../get-project-root';

const findTailwindColors = async (directory = src) => {
  const results: Result[] = [];
  const files = glob.sync(join(directory, '**', '*.svelte'));

  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const lines = content.split('\n');

    let index = 1;

    for (const line of lines) {
      let match: RegExpExecArray | null;

      while ((match = pattern.exec(line)) !== null) {
        const result = {
          path: file.replace(src, 'src'),
          line: index,
          class: match[0],
        };

        results.push({ ...result, ...parseTailwindClass(result.class) });
      }

      index++;
    }
  }

  return results;
};

const saveToCsv = async (
  results: Result[],
  fileName = join(getProjectRoot(), 'audits', 'tailwind-colors.csv'),
) => {
  const exists = await isDirectory(dirname(fileName));

  if (!exists) await mkdir(dirname(fileName));

  await writeFile(fileName, toRows(results));

  console.log(
    `${results.length} Tailwind color instances found and saved to '${fileName}'.`,
  );
};

const results = await findTailwindColors(src);

saveToCsv(results);
