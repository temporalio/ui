import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'path';

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const distPath = new URL('../dist', import.meta.url).pathname;
const exports = {};

for (const file of walk(distPath)) {
  const rel = relative(distPath, file).replace(/\\/g, '/');

  if (rel.endsWith('.svelte') && !rel.includes('.d.ts')) {
    exports[`./${rel}`] = {
      types: `./dist/${rel.replace(/\.svelte$/, '.svelte.d.ts')}`,
      svelte: `./dist/${rel}`,
    };
  } else if (rel.endsWith('.js') && !rel.includes('.svelte.')) {
    const base = rel.replace(/\.js$/, '');
    exports[`./${base}`] = {
      types: `./dist/${base}.d.ts`,
      import: `./dist/${rel}`,
    };
  }
}

exports['./package.json'] = './package.json';

const pkgUrl = new URL('../package.json', import.meta.url);
const pkg = JSON.parse(readFileSync(pkgUrl));
pkg.exports = exports;
writeFileSync(pkgUrl, JSON.stringify(pkg, null, 2) + '\n');

console.log(`Generated ${Object.keys(exports).length} explicit export entries`);
