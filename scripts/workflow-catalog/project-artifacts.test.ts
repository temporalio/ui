import { cp, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { verifyProjectWorkflowCatalogBoundaries } from './project-artifacts';
import type { WorkflowCatalogRegistrationSource } from '../../src/lib/workflow-catalog/worker/registration-source';

const temporaryDirectories: string[] = [];

const createIsolatedCatalogRoot = async () => {
  const rootDirectory = await mkdtemp(
    join(process.cwd(), '.workflow-catalog-project-artifacts-'),
  );
  temporaryDirectories.push(rootDirectory);
  await Promise.all([
    cp(
      'src/lib/workflow-catalog',
      join(rootDirectory, 'src/lib/workflow-catalog'),
      { recursive: true },
    ),
    cp('package.json', join(rootDirectory, 'package.json')),
  ]);
  return rootDirectory;
};

const registrationSource = (
  id: string,
  sourceFiles: string[],
): WorkflowCatalogRegistrationSource => ({
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

describe('project workflow catalog boundaries', () => {
  it('validates fresh shared and local registration sources in the caller root', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const sharedPath =
      'src/lib/workflow-catalog/worker/examples/fresh-shared/example.ts';
    const localPath = 'workflow-catalog.local/examples/fresh-local/example.ts';
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
      verifyProjectWorkflowCatalogBoundaries(options),
    ).resolves.toBeUndefined();

    await rm(join(rootDirectory, sharedPath));
    await expect(
      verifyProjectWorkflowCatalogBoundaries(options),
    ).rejects.toThrow(
      `Declared workflow catalog source does not exist: "${sharedPath}"`,
    );

    await writeFile(join(rootDirectory, sharedPath), 'export {}\n');
    await rm(join(rootDirectory, localPath));
    await expect(
      verifyProjectWorkflowCatalogBoundaries(options),
    ).rejects.toThrow(
      `Declared workflow catalog source does not exist: "${localPath}"`,
    );

    await writeFile(join(rootDirectory, localPath), 'export {}\n');
    await rm(
      join(
        rootDirectory,
        'src/lib/workflow-catalog/worker/local-registration-fallback.ts',
      ),
    );
    await expect(
      verifyProjectWorkflowCatalogBoundaries(options),
    ).rejects.toThrow(
      'Declared workflow catalog source does not exist: "src/lib/workflow-catalog/worker/local-registration-fallback.ts"',
    );
  });
});
