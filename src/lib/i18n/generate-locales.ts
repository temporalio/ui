import { mkdir, readFile, stat, writeFile } from 'fs/promises';
import path from 'path';

import { rimraf } from 'rimraf';
import ts from 'typescript';
import { chalk, glob } from 'zx';

const SRC_DIR = path.resolve('./src/lib/i18n/locales');
const DEST_DIR = path.resolve('./static/i18n/locales');

const writeLocaleFile = async (
  originalPath: string,
  parentPath: string,
  filePath: string,
  exports: { Strings?: object },
) => {
  if (!Object.getOwnPropertyNames(exports).includes('Strings')) {
    console.log(`No 'Strings' named export in ${originalPath}`);
    return;
  }

  try {
    await stat(parentPath);
    await rimraf(`${parentPath}/*`);
  } catch {
    await mkdir(parentPath, { recursive: true });
  }

  try {
    await writeFile(
      filePath,
      `${JSON.stringify(exports.Strings, undefined, 2)}\n`,
    );
    console.log(
      chalk.bold(chalk.green('Parsed locale file:')),
      `${path.relative('.', originalPath)} to ${path.relative('.', filePath)}`,
    );
  } catch (error) {
    console.log(`Unable to write file: ${path.relative('.', filePath)}`);
    console.error(error);
  }
};

export const generateLocales = async (
  src: string = SRC_DIR,
  dest: string = DEST_DIR,
  ext: 'ts' | 'js' = 'ts',
) => {
  const pattern = path.join(src, `*/*.${ext}`);
  const files = await glob(pattern);
  if (files.length === 0) {
    console.log(chalk.yellow(`No files matching ${pattern}`));
    return;
  }

  await Promise.all(
    files.map(async (file) => {
      const subDir = file.split(src)[1];
      const regex = new RegExp(`[a-zA-Z0-9_-]+\\.${ext}`);
      const parentPath = path.join(dest, subDir.split(regex)[0]);
      const filePath = path.join(dest, subDir.replace(`.${ext}`, '.json'));

      if (ext === 'ts') {
        const fileContents = await readFile(file);
        const result = ts.transpileModule(fileContents.toString(), {
          compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ESNext,
            esModuleInterop: true,
          },
        });

        const buf = Buffer.from(result.outputText);
        const exports = await import(
          `data:text/javascript;base64,${buf.toString('base64')}`
        );

        return writeLocaleFile(file, parentPath, filePath, exports);
      } else if (ext === 'js') {
        const exports = await import(file);

        return writeLocaleFile(file, parentPath, filePath, exports);
      } else {
        return Promise.reject(
          `Unknown extension: ${ext}, please specify either 'js' or 'ts'`,
        );
      }
    }),
  );
};
