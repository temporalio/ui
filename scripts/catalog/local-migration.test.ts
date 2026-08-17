import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { migrateLegacyCatalogLocalState } from './local-migration';

const temporaryDirectories: string[] = [];

const createTemporaryDirectory = async () => {
  const directory = await mkdtemp(join(tmpdir(), 'catalog-migration-'));
  temporaryDirectories.push(directory);
  return directory;
};

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe('legacy Catalog local-state migration', () => {
  it('moves the legacy local catalog directory with its contents intact', async () => {
    const rootDirectory = await createTemporaryDirectory();
    await mkdir(join(rootDirectory, 'workflow-catalog.local/examples/demo'), {
      recursive: true,
    });
    await writeFile(
      join(rootDirectory, 'workflow-catalog.local/examples/demo/example.ts'),
      'export const sentinel = true;\n',
    );

    await expect(
      migrateLegacyCatalogLocalState(rootDirectory),
    ).resolves.toEqual([
      {
        legacyPath: 'workflow-catalog.local',
        canonicalPath: 'catalog.local',
      },
    ]);
    await expect(
      readFile(
        join(rootDirectory, 'catalog.local/examples/demo/example.ts'),
        'utf8',
      ),
    ).resolves.toBe('export const sentinel = true;\n');
    await expect(
      readFile(
        join(rootDirectory, 'workflow-catalog.local/examples/demo/example.ts'),
      ),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('moves the legacy credential file without changing its contents', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const credentials = 'TEMPORAL_API_KEY=secret-value\n';
    await writeFile(
      join(rootDirectory, '.env.workflow-catalog.local'),
      credentials,
    );

    await migrateLegacyCatalogLocalState(rootDirectory);

    await expect(
      readFile(join(rootDirectory, '.env.catalog.local'), 'utf8'),
    ).resolves.toBe(credentials);
    await expect(
      readFile(join(rootDirectory, '.env.workflow-catalog.local'), 'utf8'),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('refuses conflicts before moving any other legacy state', async () => {
    const rootDirectory = await createTemporaryDirectory();
    await mkdir(join(rootDirectory, 'workflow-catalog.local'));
    await mkdir(join(rootDirectory, 'catalog.local'));
    await writeFile(
      join(rootDirectory, '.env.workflow-catalog.local'),
      'TEMPORAL_API_KEY=still-legacy\n',
    );

    await expect(migrateLegacyCatalogLocalState(rootDirectory)).rejects.toThrow(
      'Merge each legacy path into its canonical path or remove one of the two',
    );
    await expect(
      readFile(join(rootDirectory, '.env.workflow-catalog.local'), 'utf8'),
    ).resolves.toBe('TEMPORAL_API_KEY=still-legacy\n');
    await expect(
      readFile(join(rootDirectory, '.env.catalog.local'), 'utf8'),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('never overwrites canonical credentials when both env files exist', async () => {
    const rootDirectory = await createTemporaryDirectory();
    await writeFile(
      join(rootDirectory, '.env.workflow-catalog.local'),
      'TEMPORAL_API_KEY=legacy-secret\n',
    );
    await writeFile(
      join(rootDirectory, '.env.catalog.local'),
      'TEMPORAL_API_KEY=canonical-secret\n',
    );

    await expect(migrateLegacyCatalogLocalState(rootDirectory)).rejects.toThrow(
      '.env.workflow-catalog.local and .env.catalog.local',
    );
    await expect(
      readFile(join(rootDirectory, '.env.workflow-catalog.local'), 'utf8'),
    ).resolves.toBe('TEMPORAL_API_KEY=legacy-secret\n');
    await expect(
      readFile(join(rootDirectory, '.env.catalog.local'), 'utf8'),
    ).resolves.toBe('TEMPORAL_API_KEY=canonical-secret\n');
  });

  it('keeps legacy secrets and obsolete mutation state ignored', async () => {
    const gitignore = await readFile(join(process.cwd(), '.gitignore'), 'utf8');

    expect(gitignore).toContain('/workflow-catalog.local/');
    expect(gitignore).toContain('/.env.workflow-catalog.local');
    expect(gitignore).toContain('/.workflow-catalog.lock');
    expect(gitignore).toContain('/.workflow-catalog.lock.recovery');
    expect(gitignore).toContain('/.workflow-catalog.journal.json');
    expect(gitignore).toContain('/.workflow-catalog.transaction-*/');
  });
});
