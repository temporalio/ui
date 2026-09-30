/**
 * Thin redirect — production build lives at repo-root `build.mjs`.
 * Prefer: `node build.mjs` from the repository root.
 */
import { pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootBuild = resolve(dirname(fileURLToPath(import.meta.url)), '../../build.mjs');
await import(pathToFileURL(rootBuild).href);
