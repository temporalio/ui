import { mkdir, readdir, readFile, stat, writeFile } from 'fs/promises';
import { dirname, join, resolve } from 'path';

import { parseTailwindClass, type TailwindClass } from './parse-tailwind-class';
import { getProjectRoot } from '../get-project-root';

type Result = {
  path: string;
  line: number;
  class: string;
} & TailwindClass;

const src = resolve(getProjectRoot(), 'src');
const pattern =
  /\b(?:hover:|focus:|active:|group-hover:|focus-within:)?(?:text|bg|border|divide|ring|placeholder)-(?:\w+)-\d{1,3}\b/g;

const results: Result[] = [];

const findTailwindColors = async (directory: string = src) => {
  const files = await readdir(directory);

  for (const file of files) {
    const fullPath = join(directory, file);

    if ((await stat(fullPath)).isDirectory()) {
      await findTailwindColors(fullPath);
    } else if (
      fullPath.endsWith('.svelte') ||
      fullPath.endsWith('.ts') ||
      fullPath.endsWith('.html') ||
      fullPath.endsWith('.tsx')
    ) {
      const fileContent = await readFile(fullPath, 'utf-8');

      fileContent.split('\n').forEach((line, index) => {
        let match: RegExpExecArray | null;

        while ((match = pattern.exec(line)) !== null) {
          const result = {
            path: fullPath.replace(src, 'src'),
            line: index + 1,
            class: match[0],
          };

          results.push({ ...result, ...parseTailwindClass(result.class) });
        }
      });
    }
  }
};

const saveToCsv = async (
  results: Result[],
  fileName = join(getProjectRoot(), 'audits', 'tailwind-colors.csv'),
) => {
  if (!(await stat(dirname(fileName)).catch(() => false))) {
    await mkdir(dirname(fileName));
  }

  const header = [
    'File',
    'Line Number',
    'Class',
    'Variant',
    'Utility',
    'Color',
    'Shade',
  ];

  const csvContent = results.reduce((csv, row) => {
    return (
      csv +
      `${row.path},${row.line},${row.class},${row.variant || ''},${
        row.utility || ''
      },${row.color || ''},${row.shade || ''}\n`
    );
  }, header.join(',') + '\n');

  await writeFile(fileName, csvContent);

  console.log(
    `${results.length} Tailwind color instances found and saved to '${fileName}'.`,
  );
};

await findTailwindColors(src);

saveToCsv(results);
