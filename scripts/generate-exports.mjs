import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const distPath = new URL('../dist', import.meta.url).pathname;
const pkgUrl = new URL('../package.json', import.meta.url);
const pkg = JSON.parse(readFileSync(pkgUrl));
const pkgName = pkg.name;

const allFiles = new Set(
  [...walk(distPath)].map((f) => relative(distPath, f).replace(/\\/g, '/')),
);

const isTestOrSpec = (rel) => /\.(test|spec)\./.test(rel);

const exports = {};

for (const rel of allFiles) {
  if (isTestOrSpec(rel)) continue;

  if (rel.endsWith('.svelte') && !rel.includes('.d.ts')) {
    exports[`./${rel}`] = {
      types: `./dist/${rel.replace(/\.svelte$/, '.svelte.d.ts')}`,
      svelte: `./dist/${rel}`,
      default: `./dist/${rel}`,
    };
  } else if (rel.endsWith('.svelte.js')) {
    const svelteCounterpart = rel.replace(/\.js$/, '');
    if (!allFiles.has(svelteCounterpart)) {
      const key = `./${rel.replace(/\.js$/, '')}`;
      exports[key] = {
        types: `./dist/${rel.replace(/\.js$/, '.d.ts')}`,
        import: `./dist/${rel}`,
        default: `./dist/${rel}`,
      };
    }
  } else if (rel.endsWith('.js') && !rel.includes('.svelte.')) {
    const base = rel.replace(/\.js$/, '');
    exports[`./${base}`] = {
      types: `./dist/${base}.d.ts`,
      import: `./dist/${rel}`,
      default: `./dist/${rel}`,
    };
  }
}

exports['./package.json'] = './package.json';

for (const rel of allFiles) {
  if (!rel.endsWith('.svelte') || rel.includes('.d.ts')) continue;

  const file = join(distPath, rel);
  const dir = dirname(file);
  let code = readFileSync(file, 'utf-8');

  const rewritten = code.replace(/from '(\.[^']+\.svelte)'/g, (_, relImport) => {
    const abs = resolve(dir, relImport);
    const pkgRel = relative(distPath, abs).replace(/\\/g, '/');
    return `from '${pkgName}/${pkgRel}'`;
  });

  if (rewritten !== code) writeFileSync(file, rewritten);
}

pkg.exports = exports;
writeFileSync(pkgUrl, JSON.stringify(pkg, null, 2) + '\n');

console.log(`Generated ${Object.keys(exports).length} explicit export entries`);
