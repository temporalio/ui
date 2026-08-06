import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { loadLocalWorkflowCatalogDescriptors } from './vite-plugin-workflow-catalog-local';

const temporaryDirectories: string[] = [];

const createTemporaryDirectory = async () => {
  const directory = await mkdtemp(join(tmpdir(), 'workflow-catalog-vite-'));
  temporaryDirectories.push(directory);
  return directory;
};

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('local workflow catalog Vite boundary', () => {
  it('returns an empty descriptor list when the local artifact is absent', async () => {
    const rootDirectory = await createTemporaryDirectory();

    await expect(
      loadLocalWorkflowCatalogDescriptors(rootDirectory),
    ).resolves.toEqual([]);
  });

  it('loads browser-safe descriptors from the generated local artifact', async () => {
    const rootDirectory = await createTemporaryDirectory();
    await mkdir(join(rootDirectory, '.workflow-catalog'));
    await writeFile(
      join(rootDirectory, '.workflow-catalog/local.generated.json'),
      JSON.stringify({
        sourceHash: 'local-source',
        descriptors: [
          {
            id: 'local-order',
            source: 'local',
            title: 'Local order',
            description: 'Runs a local order workflow.',
            capabilityTags: [],
            expectedEvidence: [],
            input: { defaultValue: [], schema: {} },
            startOptions: { defaultValue: {}, schema: {} },
            execution: {
              kind: 'workflow',
              targetId: 'local-worker',
              namespace: 'default',
              taskQueue: 'local-orders',
              workflowType: 'localOrder',
            },
          },
        ],
      }),
    );

    await expect(
      loadLocalWorkflowCatalogDescriptors(rootDirectory),
    ).resolves.toMatchObject([{ id: 'local-order', source: 'local' }]);
  });
});
