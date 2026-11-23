import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

export const COMPONENTS = [
  'badge',
  'badge-count',
  'badge-status',
  'breadcrumbs',
  'button',
  'chip',
  'chip-status',
  'icon',
  'layouts/page-header',
  'roundness-group',
  'segmented-control',
  'tag',
  'text-link',
];
export type RulesSource =
  | { kind: 'dir'; root: string }
  | { kind: 'tarball'; path: string };
const MAX_ARCHIVE = 32_000_000;
const MAX_RULE = 150_000;

export function checkedSections(markdown: string): string {
  let checked = false;
  return markdown
    .split('\n')
    .filter((line) => {
      if (/^## /.test(line)) checked = /^## (Selection|Rules)\s*$/.test(line);
      return checked;
    })
    .join('\n');
}

export function ruleIdExists(markdown: string, ruleId: string): boolean {
  return checkedSections(markdown)
    .split('\n')
    .some((line) =>
      [
        ...line.matchAll(/(?:^\s*-\s+|\|\s*)\*\*([A-Z][A-Z0-9]*-\d+)\*\*/g),
      ].some((match) => match[1] === ruleId),
    );
}

export function readTarRules(compressed: Buffer): Map<string, string> {
  if (compressed.length > 8_000_000) throw new Error('Archive too large');
  const tar = gunzipSync(compressed, { maxOutputLength: MAX_ARCHIVE });
  const rules = new Map<string, string>();
  const seen = new Set<string>();
  const field = (offset: number, length: number): string =>
    tar
      .subarray(offset, offset + length)
      .toString('utf8')
      .replace(/\0.*$/s, '');
  let offset = 0;
  for (; offset + 512 <= tar.length; ) {
    if (tar.subarray(offset, offset + 512).every((byte) => byte === 0))
      return rules;
    const checksum = Number.parseInt(field(offset + 148, 8).trim(), 8);
    const actualChecksum = tar
      .subarray(offset, offset + 512)
      .reduce(
        (sum, byte, index) => sum + (index >= 148 && index < 156 ? 32 : byte),
        0,
      );
    if (!Number.isSafeInteger(checksum) || checksum !== actualChecksum)
      throw new Error('Invalid archive checksum');
    const name = [field(offset + 345, 155), field(offset, 100)]
      .filter(Boolean)
      .join('/')
      .replace(/^\.\//, '');
    const sizeText = field(offset + 124, 12).trim();
    const size = Number.parseInt(sizeText, 8);
    const type = field(offset + 156, 1);
    if (
      !/^[0-7]+$/.test(sizeText) ||
      !Number.isSafeInteger(size) ||
      size < 0 ||
      offset + 512 + size > tar.length
    )
      throw new Error('Invalid archive entry');
    if (
      name.startsWith('/') ||
      name.split('/').some((part) => part === '..') ||
      name.includes('\\') ||
      seen.has(name)
    )
      throw new Error('Unsafe archive path');
    if (!['', '0', '5'].includes(type))
      throw new Error('Unsupported archive entry');
    seen.add(name);
    const component = COMPONENTS.find(
      (item) =>
        name === `package/dist/io/${item}/${path.posix.basename(item)}.md`,
    );
    if (component) {
      if (size > MAX_RULE) throw new Error('Rules too large');
      rules.set(
        component,
        tar.subarray(offset + 512, offset + 512 + size).toString('utf8'),
      );
    }
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  throw new Error('Truncated archive');
}

export async function loadRules(
  components: string[],
  source: RulesSource,
  read?: (component: string) => Promise<string | null>,
): Promise<{ rules: Map<string, string>; missing: string[] }> {
  if (source.kind === 'tarball' && (await lstat(source.path)).size > 8_000_000)
    throw new Error('Archive too large');
  const packed =
    source.kind === 'tarball'
      ? readTarRules(await readFile(source.path))
      : null;
  const rules = new Map<string, string>();
  const missing = new Set<string>();
  const visiting = new Set<string>();
  const load = async (component: string, depth: number): Promise<void> => {
    if (visiting.has(component)) {
      missing.add(`${component}: cyclic checked reference`);
      return;
    }
    if (rules.has(component) || missing.has(component)) return;
    if (!COMPONENTS.includes(component) || depth > 3) {
      missing.add(component);
      return;
    }
    let markdown: string | null = null;
    try {
      if (read) markdown = await read(component);
      else if (packed) markdown = packed.get(component) ?? null;
      else if (source.kind === 'dir') {
        const filename = path.join(
          source.root,
          component,
          `${path.posix.basename(component)}.md`,
        );
        for (
          let directory = source.root, i = 0;
          i <= component.split('/').length;
          i++
        ) {
          if (!(await lstat(directory)).isDirectory())
            throw new Error('Unsafe rules directory');
          directory = path.join(directory, component.split('/')[i] ?? '');
        }
        const info = await lstat(filename);
        if (!info.isFile() || info.size > MAX_RULE)
          throw new Error('Unsafe rules file');
        markdown = await readFile(filename, 'utf8');
      }
    } catch {
      markdown = null;
    }
    if (
      !markdown ||
      markdown.length > MAX_RULE ||
      !/^## Rules\s*$/m.test(markdown) ||
      !/\*\*[A-Z][A-Z0-9]*-\d+\*\*/.test(checkedSections(markdown))
    ) {
      missing.add(component);
      return;
    }
    rules.set(component, markdown);
    visiting.add(component);
    for (const line of checkedSections(markdown).split('\n')) {
      if (!/\b(?:MUST satisfy|satisfy)\b/.test(line)) continue;
      const reference =
        /\b([A-Z][A-Za-z ]*) ([A-Z][A-Z0-9]*-\d+) in `([a-z-]+)\.usage\.md`/.exec(
          line,
        );
      if (!reference) {
        missing.add(`${component}: unsupported checked reference`);
        continue;
      }
      const dependency = reference[3];
      await load(dependency, depth + 1);
      if (!ruleIdExists(rules.get(dependency) ?? '', reference[2]))
        missing.add(`${component}: ${dependency} ${reference[2]}`);
    }
    visiting.delete(component);
  };
  for (const component of components) await load(component, 0);
  return { rules, missing: [...missing] };
}
