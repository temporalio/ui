import { readdir, stat } from 'fs/promises';
import { join, resolve } from 'path';

import colors from '../../src/theme/colors';
import { getProjectRoot } from '../get-project-root';

export type FileExtension = `.${string}`;

const temporalColors = Object.keys(colors).join('|');

const variants = ['hover', 'focus', 'active', 'group-hover', 'focus-within']
  .map((v) => `${v}:`)
  .join('|');

const utilities = [
  'text',
  'bg',
  'border',
  'divide',
  'ring',
  'placeholder',
].join('|');

export const pattern = new RegExp(
  `\\b(?:${variants})?(?:${utilities})-(?:${temporalColors})-(\\d{1,3})\\b`,
  'g',
);

export const fileExentsions: FileExtension[] = ['.svelte', '.ts'];

export const src = resolve(getProjectRoot(), 'src');

export const isDirectory = async (path: string) => {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
};

export const hasExtension = (
  path: string,
  extensions: FileExtension | FileExtension[] = fileExentsions,
) => {
  if (typeof extensions === 'string') {
    extensions = [extensions];
  }

  return extensions.some((extension) => path.endsWith(extension));
};

export const findFiles = async (directory = src) => {
  let filePaths: string[] = [];

  for (const fileName of await readdir(directory)) {
    const fullPath = join(directory, fileName);
    const pathIsDirectory = await isDirectory(fullPath);

    if (pathIsDirectory) {
      const results = await findFiles(fullPath);
      filePaths = filePaths.concat(results);
    }

    if (hasExtension(fullPath)) {
      filePaths.push(fullPath);
    }
  }

  return filePaths;
};
