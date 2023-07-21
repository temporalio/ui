import { mkdir, stat, writeFile } from 'fs/promises';
import path, { relative } from 'path';

import { rimraf } from 'rimraf';
import { $, chalk, glob } from 'zx';

const SRC_DIR = path.resolve('./src/lib/i18n/locales');
const DEST_DIR = path.resolve('./static/i18n/locales');

const logAndExit = (msg: string, logError: (msg: string) => void) => {
  logError(chalk.red(msg));

  if (logError === console.error) {
    process.exit(0);
  }
};

const relativeTo = (path: string) => {
  return relative('./', path);
};

export const generateLocales = async (
  src: string = SRC_DIR,
  dest: string = DEST_DIR,
  ext: 'ts' | 'js' = 'ts',
  logError: (msg: string) => void = console.error,
) => {
  const pattern = path.join(src, `*/*.${ext}`);
  const files = await glob(pattern);

  if (files.length === 0) {
    console.log(chalk.yellow(`No files matching ${pattern}`));
    return;
  }

  files.map(async (file) => {
    const locale = await import(file);

    if (!Object.getOwnPropertyNames(locale).includes('Strings')) {
      logAndExit(`No 'Strings' named export in ${file}`, logError);
    }

    const subDir = file.split(src)[1];
    const regex = new RegExp(`[a-zA-Z0-9_-]+\\.${ext}`);
    const fullDir = path.join(dest, subDir.split(regex)[0]);
    const fullPath = path.join(dest, subDir.replace(`.${ext}`, '.json'));

    try {
      await stat(fullDir);
      await rimraf(`${fullDir}/*`);
    } catch {
      await mkdir(fullDir, { recursive: true });
    }

    try {
      const { Strings } = locale;
      await writeFile(fullPath, JSON.stringify(Strings));
      $.cwd = process.cwd();
      await $`prettier --write --plugin-search-dir=. --no-error-on-unmatched-pattern ./static/i18n/locales/*/*.json`.quiet();
      console.log(
        chalk.bold(chalk.green('Parsed locale file:')),
        `${relativeTo(file)} to ${relativeTo(fullPath)}`,
      );
    } catch (error) {
      logAndExit(
        `Unable to write file: ${relativeTo(fullPath)} with JSON content`,
        logError,
      );
    }
  });
};
