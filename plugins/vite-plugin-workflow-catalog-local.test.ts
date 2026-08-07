import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  loadLocalWorkflowCatalogDescriptors,
  loadLocalWorkflowCatalogRouting,
  workflowCatalogLocalPlugin,
} from './vite-plugin-workflow-catalog-local';

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
    await mkdir(join(rootDirectory, 'workflow-catalog.local'));
    await writeFile(
      join(rootDirectory, 'workflow-catalog.local/catalog.generated.json'),
      JSON.stringify({
        sourceHash: 'local-source',
        descriptors: [
          {
            id: 'local-order',
            source: { id: 'local', label: 'Local' },
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
    ).resolves.toMatchObject([
      {
        id: 'local-order',
        source: { id: 'local', label: 'Local' },
      },
    ]);
  });

  it('loads only non-secret routing from the local workflow catalog environment', async () => {
    const rootDirectory = await createTemporaryDirectory();
    await writeFile(
      join(rootDirectory, '.env.workflow-catalog.local'),
      [
        'TEMPORAL_NAMESPACE=runtime-namespace',
        'TEMPORAL_ADDRESS=private.example:7233',
        'TEMPORAL_API_KEY=secret',
        'TEMPORAL_TLS_CERT=certificate',
        'TEMPORAL_TLS_KEY=private-key',
      ].join('\n'),
    );

    await expect(
      loadLocalWorkflowCatalogRouting(rootDirectory, {}),
    ).resolves.toEqual({
      'shared-workflows': {
        namespace: 'runtime-namespace',
        taskQueue: 'ui-workflow-catalog',
      },
    });
  });

  it('keeps committed browser routing when no local namespace exists', async () => {
    const rootDirectory = await createTemporaryDirectory();

    await expect(
      loadLocalWorkflowCatalogRouting(rootDirectory, {}),
    ).resolves.toEqual({});
  });

  it('exposes safe runtime routing through the local catalog virtual module', async () => {
    const rootDirectory = await createTemporaryDirectory();
    await writeFile(
      join(rootDirectory, '.env.workflow-catalog.local'),
      ['TEMPORAL_NAMESPACE=runtime-namespace', 'TEMPORAL_API_KEY=secret'].join(
        '\n',
      ),
    );
    const plugin = workflowCatalogLocalPlugin({});
    const configure = plugin.configResolved as (config: {
      root: string;
    }) => void;
    const load = plugin.load as (id: string) => Promise<string | undefined>;

    configure({ root: rootDirectory });
    const source = await load('\0virtual:workflow-catalog-local');

    expect(source).toContain(
      'export const workflowCatalogRouting = {"shared-workflows":{"namespace":"runtime-namespace","taskQueue":"ui-workflow-catalog"}};',
    );
    expect(source).not.toContain('secret');
  });

  it('watches local descriptors and routing for development reloads', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const watchedPaths: string[] = [];
    const plugin = workflowCatalogLocalPlugin({});
    const configure = plugin.configResolved as (config: {
      root: string;
    }) => void;
    const configureServer = plugin.configureServer as (server: unknown) => void;

    configure({ root: rootDirectory });
    configureServer({
      watcher: {
        add: (path: string) => watchedPaths.push(path),
        on: () => undefined,
      },
      moduleGraph: { getModuleById: () => undefined },
      ws: { send: () => undefined },
    });

    expect(watchedPaths).toEqual([
      join(rootDirectory, 'workflow-catalog.local/catalog.generated.json'),
      join(rootDirectory, '.env.workflow-catalog.local'),
    ]);
  });
});
