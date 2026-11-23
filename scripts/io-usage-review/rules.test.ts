import { execFileSync } from 'node:child_process';
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';

import { describe, expect, it } from 'vitest';

import {
  checkedSections,
  loadRules,
  readTarRules,
  ruleIdExists,
} from './rules';

const root = path.resolve('scripts/io-usage-review/__fixtures__');

describe('base rules', () => {
  it('loads bounded inherited context even when Badge is not imported', async () => {
    const result = await loadRules(['badge-status'], { kind: 'dir', root });
    expect([...result.rules.keys()]).toEqual(['badge-status', 'badge']);
    expect(result.missing).toEqual([]);
    expect(ruleIdExists(result.rules.get('badge') ?? '', 'IN-2')).toBe(true);
    expect(ruleIdExists(result.rules.get('badge-status') ?? '', 'IN-4')).toBe(
      false,
    );
  });

  it('only checks Selection/Rules IDs in rule positions', () => {
    const md =
      '## Selection\n| **USE-1** yes | **USE-2** no |\n## Rules\n- **IN-4** yes\nProse **IN-99** no\n## Notes\n- **IN-5** no';
    expect(ruleIdExists(md, 'IN-4')).toBe(true);
    expect(ruleIdExists(md, 'USE-2')).toBe(true);
    for (const id of ['IN-40', 'USE-20', 'IN-99', 'IN-5'])
      expect(ruleIdExists(md, id)).toBe(false);
    expect(checkedSections(md)).not.toContain('## Notes');
  });

  it('lists missing/unsafe components without reading arbitrary paths', async () => {
    const result = await loadRules(['chip', '../badge', 'unknown'], {
      kind: 'dir',
      root,
    });
    expect(result.missing).toEqual(['chip', '../badge', 'unknown']);
  });

  it('reads the same checked context from a real packed fixture', async () => {
    const temp = await mkdtemp(path.join(tmpdir(), 'io-rules-'));
    try {
      await mkdir(path.join(temp, 'package/dist/io/badge'), {
        recursive: true,
      });
      await writeFile(
        path.join(temp, 'package/dist/io/badge/badge.md'),
        await readFile(path.join(root, 'badge/badge.md')),
      );
      const archive = path.join(temp, 'rules.tgz');
      execFileSync(
        'tar',
        ['--format=ustar', '-czf', archive, '-C', temp, 'package'],
        { env: { ...process.env, COPYFILE_DISABLE: '1' } },
      );
      const result = await loadRules(['badge'], {
        kind: 'tarball',
        path: archive,
      });
      expect(result.missing).toEqual([]);
      expect(result.rules.get('badge')).toContain('**IN-2**');
      expect(() => readTarRules(Buffer.from('invalid'))).toThrow();
      const original = gunzipSync(await readFile(archive));
      const mutate = (name: string, type: string): Buffer => {
        const bytes = Buffer.from(original);
        bytes.fill(0, 0, 100);
        bytes.write(name, 0);
        bytes.write(type, 156);
        bytes.fill(32, 148, 156);
        const checksum = bytes
          .subarray(0, 512)
          .reduce((sum, byte) => sum + byte, 0);
        bytes.write(`${checksum.toString(8).padStart(6, '0')}\0 `, 148);
        return gzipSync(bytes);
      };
      for (const name of [
        '../escape',
        '/absolute',
        'package/../escape',
        'package\\escape',
      ])
        expect(() => readTarRules(mutate(name, '0'))).toThrow(
          'Unsafe archive path',
        );
      for (const type of ['1', '2', 'x'])
        expect(() => readTarRules(mutate('package/link', type))).toThrow(
          'Unsupported archive entry',
        );
      const corrupt = Buffer.from(original);
      corrupt[0] ^= 1;
      expect(() => readTarRules(gzipSync(corrupt))).toThrow('checksum');
      expect(() =>
        readTarRules(gzipSync(Buffer.alloc(33_000_000, 1))),
      ).toThrow();
      const firstSize = Number.parseInt(
        original.subarray(124, 136).toString(),
        8,
      );
      const first = original.subarray(
        0,
        512 + Math.ceil(firstSize / 512) * 512,
      );
      expect(() =>
        readTarRules(
          gzipSync(Buffer.concat([first, first, Buffer.alloc(1024)])),
        ),
      ).toThrow('Unsafe archive path');
    } finally {
      await rm(temp, { recursive: true, force: true });
    }
  });

  it('marks unresolved checked dependencies partial', async () => {
    const result = await loadRules(
      ['badge-status'],
      { kind: 'dir', root },
      async (component) =>
        component === 'badge'
          ? null
          : readFile(path.join(root, component, `${component}.md`), 'utf8'),
    );
    expect(result.missing).toContain('badge');
  });

  it('bounds cycles, unsupported references and Notes-only baselines', async () => {
    const source = { kind: 'dir' as const, root };
    const cycle = await loadRules(
      ['badge'],
      source,
      async (component) =>
        `## Rules\n- **IN-2** MUST satisfy ${component === 'badge' ? 'BadgeStatus' : 'Badge'} IN-2 in \`${component === 'badge' ? 'badge-status' : 'badge'}.usage.md\``,
    );
    expect(cycle.missing).toContain('badge: cyclic checked reference');
    const unsupported = await loadRules(
      ['badge'],
      source,
      async () =>
        '## Rules\n- **IN-2** MUST satisfy rules at https://evil.test',
    );
    expect(unsupported.missing).toContain(
      'badge: unsupported checked reference',
    );
    const notes = await loadRules(
      ['badge'],
      source,
      async () => '## Notes\n- **IN-2** not checked',
    );
    expect(notes.missing).toEqual(['badge']);
  });

  it('refuses symlinked rule files and directories', async () => {
    const temp = await mkdtemp(path.join(tmpdir(), 'io-links-'));
    try {
      await mkdir(path.join(temp, 'badge'));
      await symlink(
        path.join(root, 'badge/badge.md'),
        path.join(temp, 'badge/badge.md'),
      );
      expect(
        (await loadRules(['badge'], { kind: 'dir', root: temp })).missing,
      ).toEqual(['badge']);
    } finally {
      await rm(temp, { recursive: true, force: true });
    }
  });
});
