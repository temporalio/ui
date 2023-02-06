import { join } from 'path';
import { chmod } from 'fs/promises';
import { finished } from 'stream/promises';

import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import kleur from 'kleur';

console.log(kleur.cyan('Getting ready to download Temporal CLI…'));

if (process.env.VERCEL) {
  console.log(
    kleur.blue('Running on Vercel; skipping downloading Temporal CLI.'),
  );
  process.exit(0);
}

const zlib = await import('zlib').then((module) => module.default);
const tar = await import('tar-fs').then((module) => module.default);
const fetch = await import('node-fetch').then((module) => module.default);

const reportError = (error, exitCode = 1, callback) => {
  console.error(kleur.bgRed('Error:'), kleur.red(error));
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
  kleur.bgYellow('Downloading:'),
  kleur.yellow().underline(downloadUrl),
);

try {
  const response = await fetch(downloadUrl);

  await finished(
    response.body.pipe(zlib.createGunzip()).pipe(tar.extract(destination)),
  );

  await chmod(destination, 0o755);

  console.log(
    kleur.bgGreen('Download complete:'),
    kleur.green().underline(join(destination, 'temporal')),
  );
} catch (error) {
  reportError(error, 2, removeDirectory);
}
