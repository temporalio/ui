import { join } from 'path';
import { chmod } from 'fs/promises';
import { finished } from 'stream/promises';
import zlib from 'node:zlib';

import fetch from 'node-fetch';
import { chalk } from 'zx';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import tar from 'tar-fs';

console.log(chalk.cyan('Getting ready to download Temporal CLI…'));

if (process.env.VERCEL) {
  console.log(
    chalk.blue('Running on Vercel; skipping downloading Temporal CLI.'),
  );
  process.exit(0);
}

const reportError = (error: string, exitCode = 1, callback?: () => void) => {
  console.error(chalk.bgRed('Error:'), chalk.red(error));
  if (callback && typeof callback === 'function') {
    callback();
  }
  process.exit(exitCode);
};

const removeDirectory = () => {
  rimraf(destination);
};

const destinationDirectory = './bin';
const destination = join(destinationDirectory, 'cli');

const platform = process.platform;
let arch = process.arch;

if (arch === 'x64') arch = 'amd64';

const downloadUrl = `https://temporal.download/cli/archive/latest?platform=${platform}&arch=${arch}`;

removeDirectory();
await mkdirp(destinationDirectory);

console.log(
  chalk.bgYellow('Downloading:'),
  chalk.yellow.underline(downloadUrl),
);

try {
  const response = await fetch(downloadUrl);

  if (!response.ok) {
    console.warn(
      chalk.magenta.bold(`There was an error fetching Temporal CLI`),
      chalk.bgRed.white.bold(` ${response.status} (${response.statusText}) `),
      chalk.cyan('Skipping…'),
    );
    process.exit(0);
  }

  if (!response.body)
    throw new Error(
      `Failed to find a "body" in the response form ${downloadUrl}.`,
    );

  await finished(
    response.body.pipe(zlib.createGunzip()).pipe(tar.extract(destination)),
  );

  await chmod(destination, 0o755);

  console.log(
    chalk.bgGreen('Download complete:'),
    chalk.green.underline(join(destination, 'temporal')),
  );
} catch (error) {
  reportError(error, 2, removeDirectory);
}
