import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { publicExportTargets } from './public-exports.mjs';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const libRoot = join(repoRoot, 'src/lib');
const packagePath = join(repoRoot, 'package.json');

const resolveEntry = (source) => {
  if (source.endsWith('.svelte')) {
    if (!existsSync(join(libRoot, source))) return null;

    return {
      types: `./dist/${source}.d.ts`,
      svelte: `./dist/${source}`,
      default: `./dist/${source}`,
    };
  }

  const candidates = [
    {
      source: `${source}.ts`,
      output: `${source}.js`,
      types: `${source}.d.ts`,
    },
    {
      source: `${source}.js`,
      output: `${source}.js`,
      types: `${source}.d.ts`,
    },
    {
      source: `${source}.svelte.ts`,
      output: `${source}.svelte.js`,
      types: `${source}.svelte.d.ts`,
    },
    {
      source: `${source}.svelte.js`,
      output: `${source}.svelte.js`,
      types: `${source}.svelte.d.ts`,
    },
    {
      source: `${source}/index.ts`,
      output: `${source}/index.js`,
      types: `${source}/index.d.ts`,
    },
    {
      source: `${source}/index.js`,
      output: `${source}/index.js`,
      types: `${source}/index.d.ts`,
    },
  ];

  for (const candidate of candidates) {
    if (!existsSync(join(libRoot, candidate.source))) continue;

    return {
      types: `./dist/${candidate.types}`,
      import: `./dist/${candidate.output}`,
      default: `./dist/${candidate.output}`,
    };
  }

  return null;
};

const createPackageExports = () => {
  const packageExports = {};
  const unresolved = [];

  for (const [subpath, source] of Object.entries(publicExportTargets).sort()) {
    const entry = resolveEntry(source);
    if (!entry) {
      unresolved.push(`${subpath} -> ${source}`);
      continue;
    }
    packageExports[subpath] = entry;
  }

  if (unresolved.length) {
    console.error(
      `Could not resolve ${unresolved.length} public export(s) in src/lib:`,
    );
    for (const entry of unresolved) console.error(`  - ${entry}`);
    process.exit(1);
  }

  packageExports['./package.json'] = './package.json';
  return packageExports;
};

const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
const packageExports = createPackageExports();
const serializedExports = JSON.stringify(packageExports);
const exportsAreCurrent =
  JSON.stringify(packageJson.exports) === serializedExports;
const mode = process.argv[2];

if (
  process.argv.length > 3 ||
  ![undefined, '--check', '--validate-dist'].includes(mode)
) {
  console.error(
    'Usage: node scripts/generate-exports.mjs [--check|--validate-dist]',
  );
  process.exit(1);
}

if (mode === '--check') {
  if (!exportsAreCurrent) {
    console.error('package.json exports are stale. Run pnpm generate:exports.');
    process.exit(1);
  }
  console.log(`Verified ${Object.keys(packageExports).length} package exports`);
  process.exit(0);
}

if (mode === '--validate-dist') {
  if (!exportsAreCurrent) {
    console.error('package.json exports are stale. Run pnpm generate:exports.');
    process.exit(1);
  }

  const missingTargets = new Set();
  for (const entry of Object.values(packageExports)) {
    const targets = typeof entry === 'string' ? [entry] : Object.values(entry);
    for (const target of targets) {
      if (!existsSync(join(repoRoot, target))) missingTargets.add(target);
    }
  }

  if (missingTargets.size) {
    console.error(`Missing ${missingTargets.size} package export target(s):`);
    for (const target of [...missingTargets].sort())
      console.error(`  - ${target}`);
    process.exit(1);
  }

  console.log(
    `Validated ${Object.keys(packageExports).length} package exports`,
  );
  process.exit(0);
}

if (exportsAreCurrent) {
  console.log('package.json exports are already up to date');
  process.exit(0);
}

packageJson.exports = packageExports;
writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
console.log(`Generated ${Object.keys(packageExports).length} package exports`);
