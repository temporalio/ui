import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const manifestPath = resolve(__dirname, 'manifest.yml');

const ALLOWED_BUCKETS = new Set([1, 2, 3, 4, null]);
const ALLOWED_SCOPES = new Set([
  'ui-main',
  'cloud-ui-main',
  'cloud-only',
  'universal',
]);
const ALLOWED_SEVERITIES = new Set([
  'critical',
  'serious',
  'moderate',
  'minor',
]);
const SC_PATTERN = /^\d+\.\d+\.\d+$/;
const SLUG_PATTERN = /^[a-z0-9][a-z0-9.-]*$/;

const errors = [];

function fail(msg) {
  errors.push(msg);
}

let raw;
try {
  raw = readFileSync(manifestPath, 'utf8');
} catch (err) {
  fail(`Cannot read manifest at ${manifestPath}: ${err.message}`);
  report();
}

let doc;
try {
  doc = yaml.load(raw);
} catch (err) {
  fail(`YAML parse error: ${err.message}`);
  report();
}

if (doc === null || doc === undefined) doc = [];
if (!Array.isArray(doc)) fail('Manifest root must be a YAML sequence (array).');

const seenSlugs = new Set();

for (const [i, entry] of (doc || []).entries()) {
  const where = `entry[${i}]${entry && entry.slug ? ` (slug=${entry.slug})` : ''}`;

  if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
    fail(`${where}: must be an object/mapping.`);
    continue;
  }

  const { slug, sc, bucket, severity, scope } = entry;

  if (typeof slug !== 'string' || !SLUG_PATTERN.test(slug)) {
    fail(
      `${where}: slug must be a kebab-case string (got ${JSON.stringify(slug)}).`,
    );
  } else if (seenSlugs.has(slug)) {
    fail(`${where}: duplicate slug "${slug}".`);
  } else {
    seenSlugs.add(slug);
  }

  if (typeof sc !== 'string' || !SC_PATTERN.test(sc)) {
    fail(
      `${where}: sc must match /^\\d+\\.\\d+\\.\\d+$/ (got ${JSON.stringify(sc)}).`,
    );
  }

  if (!ALLOWED_BUCKETS.has(bucket)) {
    fail(
      `${where}: bucket must be 1 | 2 | 3 | 4 | null (got ${JSON.stringify(bucket)}).`,
    );
  }

  if (typeof severity !== 'string' || !ALLOWED_SEVERITIES.has(severity)) {
    fail(
      `${where}: severity must be one of ${[...ALLOWED_SEVERITIES].join(' | ')} (got ${JSON.stringify(severity)}).`,
    );
  }

  if (typeof scope !== 'string' || !ALLOWED_SCOPES.has(scope)) {
    fail(
      `${where}: scope must be one of ${[...ALLOWED_SCOPES].join(' | ')} (got ${JSON.stringify(scope)}).`,
    );
  }

  if (entry['files-touched'] !== undefined) {
    const ft = entry['files-touched'];
    if (!Array.isArray(ft) || ft.some((f) => typeof f !== 'string')) {
      fail(`${where}: files-touched must be a list of strings.`);
    }
  }
}

report();

function report() {
  if (errors.length > 0) {
    console.error(
      `A11y manifest validation failed (${errors.length} error${errors.length === 1 ? '' : 's'}):`,
    );
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`A11y manifest OK (${(doc || []).length} entries).`);
}
