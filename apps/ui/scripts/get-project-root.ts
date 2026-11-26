import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export const getProjectRoot = (): string => {
  let currentDirectory = dirname(fileURLToPath(import.meta.url));

  while (currentDirectory !== '/') {
    if (existsSync(join(currentDirectory, 'package.json'))) {
      return currentDirectory;
    }
    currentDirectory = dirname(currentDirectory);
  }

  throw new Error('Project root not found.');
};
