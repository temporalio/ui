#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const designDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  cwd: designDir,
  encoding: 'utf8',
}).trim();

const commitPattern = /^Verified at commit: `([0-9a-f]{7,40})`/m;
const citationPattern =
  /`((?:\.github|\.storybook|\.husky|[A-Za-z0-9_-]+)(?:\/[A-Za-z0-9_.()[\]+-]+)*\.[A-Za-z0-9]{1,5}):(\d+)(?:-(\d+))?((?:,\d+)*)`/g;

const lineCounts = new Map();

function countLines(commit, file) {
  const key = `${commit}:${file}`;
  if (lineCounts.has(key)) return lineCounts.get(key);
  let count = null;
  try {
    const text = execFileSync('git', ['show', key], {
      cwd: repoRoot,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    count = text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
  } catch {
    count = null;
  }
  lineCounts.set(key, count);
  return count;
}

const documents = readdirSync(designDir)
  .filter((name) => name.endsWith('.md'))
  .sort();

let checked = 0;
const failures = [];

for (const name of documents) {
  const text = readFileSync(path.join(designDir, name), 'utf8');
  const commitMatch = text.match(commitPattern);
  if (!commitMatch) {
    failures.push(`${name}: no "Verified at commit: \`<sha>\`" line`);
    continue;
  }
  const commit = commitMatch[1];
  for (const match of text.matchAll(citationPattern)) {
    const [, file, start, end, extra] = match;
    const lines = [Number(start)];
    if (end) lines.push(Number(end));
    if (extra) lines.push(...extra.split(',').filter(Boolean).map(Number));
    const total = countLines(commit, file);
    checked += 1;
    if (total === null) {
      failures.push(`${name}: ${file} does not exist at ${commit}`);
      continue;
    }
    const highest = Math.max(...lines);
    if (highest > total) {
      failures.push(
        `${name}: ${file}:${highest} is past the end (${total} lines) at ${commit}`,
      );
    }
  }
}

for (const failure of failures) console.error(`FAIL ${failure}`);
console.log(
  `${documents.length} documents, ${checked} citations checked, ${failures.length} failures`,
);
process.exit(failures.length === 0 ? 0 : 1);
