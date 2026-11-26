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

const tokenPattern = /`([^`\s:]+):(\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*)`/g;

const hostPattern =
  /^(?:localhost|(?:\d{1,3}\.){3}\d{1,3}|[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|org|net|io|dev|cloud))$/i;

const lineCounts = new Map();
const treeFiles = new Map();

function git(args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

function filesAt(commit) {
  if (!treeFiles.has(commit)) {
    treeFiles.set(
      commit,
      git(['ls-tree', '-r', '--name-only', commit]).split('\n').filter(Boolean),
    );
  }
  return treeFiles.get(commit);
}

function resolvePath(commit, target) {
  const files = filesAt(commit);
  if (files.includes(target)) return { file: target };
  const matches = files.filter((file) => file.endsWith(`/${target}`));
  if (matches.length === 1) return { file: matches[0] };
  if (matches.length === 0) return { error: 'does not exist' };
  return {
    error: `is ambiguous (${matches.length} files match: ${matches
      .slice(0, 3)
      .join(', ')}${matches.length > 3 ? ', ...' : ''})`,
  };
}

function countLines(commit, file) {
  const key = `${commit}:${file}`;
  if (lineCounts.has(key)) return lineCounts.get(key);
  const text = git(['show', key]);
  const count = text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
  lineCounts.set(key, count);
  return count;
}

function parseLines(spec) {
  const ranges = spec.split(',').map((part) => {
    const [start, end] = part.split('-').map(Number);
    return { start, end: end ?? start };
  });
  return ranges;
}

const documents = readdirSync(designDir)
  .filter((name) => name.endsWith('.md'))
  .sort();

let checked = 0;
let skipped = 0;
const failures = [];

for (const name of documents) {
  const text = readFileSync(path.join(designDir, name), 'utf8');
  const commitMatch = text.match(commitPattern);
  if (!commitMatch) {
    failures.push(`${name}: no "Verified at commit: \`<sha>\`" line`);
    continue;
  }
  const commit = commitMatch[1];
  for (const match of text.matchAll(tokenPattern)) {
    const [token, target, spec] = match;
    if (hostPattern.test(target)) {
      skipped += 1;
      continue;
    }
    checked += 1;
    const resolved = resolvePath(commit, target);
    if (resolved.error) {
      failures.push(`${name}: ${token} ${resolved.error} at ${commit}`);
      continue;
    }
    const total = countLines(commit, resolved.file);
    for (const { start, end } of parseLines(spec)) {
      if (start < 1 || end < start) {
        failures.push(`${name}: ${token} has a bad line range`);
      } else if (end > total) {
        failures.push(
          `${name}: ${token} line ${end} is past the end of ${resolved.file} (${total} lines) at ${commit}`,
        );
      }
    }
  }
}

for (const failure of failures) console.error(`FAIL ${failure}`);
console.log(
  `${documents.length} documents, ${checked} citations checked, ${skipped} host:port tokens skipped, ${failures.length} failures`,
);
process.exit(failures.length === 0 ? 0 : 1);
