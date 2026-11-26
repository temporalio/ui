import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { verifyProjectCatalogBoundaries } from './project-artifacts';
import { createInRepoTemporaryDirectory } from './test-temp-root';
import type { CatalogRegistrationSource } from '../../src/lib/catalog/worker/registration-source';

const temporaryDirectories: string[] = [];

const createIsolatedCatalogRoot = async () => {
  const rootDirectory = await createInRepoTemporaryDirectory(
    'catalog-project-artifacts-',
  );
  temporaryDirectories.push(rootDirectory);
  await Promise.all([
    cp('src/lib/catalog', join(rootDirectory, 'src/lib/catalog'), {
      recursive: true,
    }),
    cp('package.json', join(rootDirectory, 'package.json')),
  ]);
  return rootDirectory;
};

const registrationSource = (
  id: string,
  sourceFiles: string[],
): CatalogRegistrationSource => ({
  source: { id, label: id },
  sourceFiles,
  register: () => undefined,
});

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('project catalog boundaries', () => {
  it('validates fresh shared and local registration sources in the caller root', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const sharedPath =
      'src/lib/catalog/worker/examples/fresh-shared/example.ts';
    const localPath = 'catalog.local/examples/fresh-local/example.ts';
    await Promise.all([
      mkdir(join(rootDirectory, sharedPath, '..'), { recursive: true }),
      mkdir(join(rootDirectory, localPath, '..'), { recursive: true }),
    ]);
    await Promise.all([
      writeFile(join(rootDirectory, sharedPath), 'export {}\n'),
      writeFile(join(rootDirectory, localPath), 'export {}\n'),
    ]);
    const options = {
      rootDirectory,
      sharedSource: registrationSource('oss', [sharedPath]),
      localSource: registrationSource('local', [localPath]),
    };

    await expect(
      verifyProjectCatalogBoundaries(options),
    ).resolves.toBeUndefined();

    await rm(join(rootDirectory, sharedPath));
    await expect(verifyProjectCatalogBoundaries(options)).rejects.toThrow(
      `Declared catalog source does not exist: "${sharedPath}"`,
    );

    await writeFile(join(rootDirectory, sharedPath), 'export {}\n');
    await rm(join(rootDirectory, localPath));
    await expect(verifyProjectCatalogBoundaries(options)).rejects.toThrow(
      `Declared catalog source does not exist: "${localPath}"`,
    );

    await writeFile(join(rootDirectory, localPath), 'export {}\n');
    await rm(
      join(
        rootDirectory,
        'src/lib/catalog/worker/local-registration-fallback.ts',
      ),
    );
    await expect(verifyProjectCatalogBoundaries(options)).rejects.toThrow(
      'Declared catalog source does not exist: "src/lib/catalog/worker/local-registration-fallback.ts"',
    );
  });
});
