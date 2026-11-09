import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PLACEHOLDER = '<!-- io-components -->';
const SUMMARY_THRESHOLD = 4;

export function componentExports(barrel) {
  const names = [];
  for (const [, specifiers] of barrel.matchAll(
    /export\s*\{([^}]*)\}\s*from/g,
  )) {
    for (const specifier of specifiers.split(',')) {
      const name = specifier
        .trim()
        .split(/\s+as\s+/)
        .pop();
      if (name && /^[A-Z]/.test(name)) names.push(name);
    }
  }
  return names;
}

const code = (name) => `\`${name}\``;

function label(dir, names) {
  if (names.length <= SUMMARY_THRESHOLD) return names.map(code).join(', ');
  const title = dir.charAt(0).toUpperCase() + dir.slice(1);
  return `${title}s (${names.slice(0, 2).map(code).join(', ')}, …)`;
}

export function componentTable(packageName, barrels) {
  const rows = barrels
    .map(({ dir, source }) => ({ dir, names: componentExports(source) }))
    .filter(({ names }) => names.length)
    .map(({ dir, names }) => [
      label(dir, names),
      code(`${packageName}/io/${dir}`),
    ]);

  const header = ['Component', 'Import'];
  const widths = header.map((cell, i) =>
    Math.max(cell.length, ...rows.map((row) => row[i].length)),
  );
  const line = (cells) =>
    `| ${cells.map((cell, i) => cell.padEnd(widths[i])).join(' | ')} |`;

  return [
    line(header),
    `| ${widths.map((width) => '-'.repeat(width)).join(' | ')} |`,
    ...rows.map(line),
  ].join('\n');
}

export function renderConsumerAgents(template, table) {
  if (!template.includes(PLACEHOLDER)) {
    throw new Error(`Consumer AGENTS.md template is missing ${PLACEHOLDER}`);
  }
  return template.replace(PLACEHOLDER, table);
}

function main() {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const ioPath = join(root, 'src/lib/io');
  const { name } = JSON.parse(readFileSync(join(root, 'package.json')));

  const barrels = readdirSync(ioPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .flatMap((dir) => {
      try {
        return [
          { dir, source: readFileSync(join(ioPath, dir, 'index.ts'), 'utf-8') },
        ];
      } catch {
        return [];
      }
    });

  const template = readFileSync(
    join(root, 'src/package/AGENTS.consumer.md'),
    'utf-8',
  );
  writeFileSync(
    join(root, 'dist/AGENTS.md'),
    renderConsumerAgents(template, componentTable(name, barrels)),
  );

  console.log(`Generated dist/AGENTS.md with ${barrels.length} io barrels`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
