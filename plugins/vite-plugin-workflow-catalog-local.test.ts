import { EventEmitter } from 'node:events';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  loadLocalWorkflowCatalogDescriptors,
  runAuthoringCommand,
  workflowCatalogLocalPlugin,
} from './vite-plugin-workflow-catalog-local';

const temporaryDirectories: string[] = [];

const createTemporaryDirectory = async () => {
  const directory = await mkdtemp(join(tmpdir(), 'workflow-catalog-vite-'));
  temporaryDirectories.push(directory);
  return directory;
};

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('local workflow catalog Vite boundary', () => {
  it('exposes an empty local catalog without reading or watching authoring files in production', async () => {
    const rootDirectory = await createTemporaryDirectory();
    await mkdir(join(rootDirectory, 'workflow-catalog.local'));
    await writeFile(
      join(rootDirectory, 'workflow-catalog.local/catalog.generated.json'),
      'production must not read this local artifact',
    );
    const watchedPaths: string[] = [];
    const regenerate = vi.fn(async () => undefined);
    const plugin = workflowCatalogLocalPlugin({ regenerate });
    const configure = plugin.configResolved as (config: {
      command: 'build';
      root: string;
    }) => void;
    const configureServer = plugin.configureServer as (server: unknown) => void;
    const load = plugin.load as (id: string) => Promise<string | undefined>;

    configure({ command: 'build', root: rootDirectory });
    configureServer({
      watcher: {
        add: (path: string) => watchedPaths.push(path),
        on: () => undefined,
      },
      moduleGraph: { getModuleById: () => undefined },
      ws: { send: () => undefined },
    });

    await expect(load('\0virtual:workflow-catalog-local')).resolves.toBe(
      'export const localWorkflowCatalog = [];',
    );
    expect(watchedPaths).toEqual([]);
    expect(regenerate).not.toHaveBeenCalled();
  });

  it('rejects a nonzero authoring command exit', async () => {
    const child = new EventEmitter();
    const command = runAuthoringCommand('/catalog', () => child);

    child.emit('close', 2, null);

    await expect(command).rejects.toThrow(
      'Workflow catalog generation exited with status 2',
    );
  });

  it('rejects an authoring command terminated by a signal', async () => {
    const child = new EventEmitter();
    const command = runAuthoringCommand('/catalog', () => child);

    child.emit('close', null, 'SIGTERM');

    await expect(command).rejects.toThrow(
      'Workflow catalog generation terminated by signal SIGTERM',
    );
  });

  it('rejects an authoring command that fails to spawn', async () => {
    const child = new EventEmitter();
    const command = runAuthoringCommand('/catalog', () => child);

    child.emit('error', new Error('spawn pnpm ENOENT'));

    await expect(command).rejects.toThrow('spawn pnpm ENOENT');
  });

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

  it('exposes only the descriptor overlay through the local catalog virtual module', async () => {
    const rootDirectory = await createTemporaryDirectory();
    await writeFile(
      join(rootDirectory, '.env.workflow-catalog.local'),
      ['TEMPORAL_NAMESPACE=runtime-namespace', 'TEMPORAL_API_KEY=secret'].join(
        '\n',
      ),
    );
    const plugin = workflowCatalogLocalPlugin();
    const configure = plugin.configResolved as (config: {
      command: 'serve';
      root: string;
    }) => void;
    const load = plugin.load as (id: string) => Promise<string | undefined>;

    configure({ command: 'serve', root: rootDirectory });
    const source = await load('\0virtual:workflow-catalog-local');

    expect(source).toBe('export const localWorkflowCatalog = [];');
    expect(source).not.toContain('workflowCatalogRouting');
    expect(source).not.toContain('secret');
  });

  it('watches the artifact and authored examples without watching generated sources', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const watchedPaths: string[] = [];
    const plugin = workflowCatalogLocalPlugin({
      regenerate: async () => undefined,
    });
    const configure = plugin.configResolved as (config: {
      command: 'serve';
      root: string;
    }) => void;
    const configureServer = plugin.configureServer as (server: unknown) => void;

    configure({ command: 'serve', root: rootDirectory });
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
      join(rootDirectory, 'workflow-catalog.local/examples'),
    ]);
  });

  it('regenerates for authored examples and reloads once for an artifact event', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const regenerated: string[] = [];
    const reloads: unknown[] = [];
    const invalidated: unknown[] = [];
    const handlers: ((path: string) => void)[] = [];
    let releaseRegeneration = () => undefined as void;
    const plugin = workflowCatalogLocalPlugin({
      regenerate: (root) => {
        regenerated.push(root);
        return new Promise((resolveDone) => {
          releaseRegeneration = () => resolveDone();
        });
      },
    });
    const configure = plugin.configResolved as (config: {
      command: 'serve';
      root: string;
    }) => void;
    const configureServer = plugin.configureServer as (server: unknown) => void;

    configure({ command: 'serve', root: rootDirectory });
    configureServer({
      watcher: {
        add: () => undefined,
        on: (_event: string, handler: (path: string) => void) =>
          handlers.push(handler),
      },
      moduleGraph: {
        getModuleById: () => 'local-catalog-module',
        invalidateModule: (module: unknown) => invalidated.push(module),
      },
      ws: { send: (payload: unknown) => reloads.push(payload) },
    });

    const [add, change, unlink] = handlers;
    change(join(rootDirectory, 'workflow-catalog.local/registration.ts'));
    change(join(rootDirectory, 'workflow-catalog.local/workflows.ts'));
    expect(regenerated).toEqual([]);
    add(
      join(
        rootDirectory,
        'workflow-catalog.local/examples/order-lifecycle/new-workflow.ts',
      ),
    );
    expect(regenerated).toEqual([rootDirectory]);
    releaseRegeneration();

    await Promise.resolve();
    await Promise.resolve();
    unlink(join(rootDirectory, 'unrelated.ts'));

    change(
      join(rootDirectory, 'workflow-catalog.local/catalog.generated.json'),
    );
    expect(invalidated).toEqual(['local-catalog-module']);
    expect(reloads).toEqual([{ type: 'full-reload' }]);

    change(join(rootDirectory, 'unrelated.ts'));
    expect(invalidated).toEqual(['local-catalog-module']);
    expect(reloads).toEqual([{ type: 'full-reload' }]);
  });

  it('reports failed regeneration, retains the last artifact, and retries later', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const artifactPath = join(
      rootDirectory,
      'workflow-catalog.local/catalog.generated.json',
    );
    await mkdir(join(rootDirectory, 'workflow-catalog.local'));
    await writeFile(artifactPath, 'last successful artifact\n');
    const errors: string[] = [];
    vi.spyOn(console, 'error').mockImplementation((message) =>
      errors.push(String(message)),
    );
    let attempts = 0;
    const handlers: ((path: string) => void)[] = [];
    const plugin = workflowCatalogLocalPlugin({
      regenerate: async () => {
        attempts += 1;
        if (attempts === 1) throw new Error('generation failed');
      },
    });
    const configure = plugin.configResolved as (config: {
      command: 'serve';
      root: string;
    }) => void;
    const configureServer = plugin.configureServer as (server: unknown) => void;
    configure({ command: 'serve', root: rootDirectory });
    configureServer({
      watcher: {
        add: () => undefined,
        on: (_event: string, handler: (path: string) => void) =>
          handlers.push(handler),
      },
      moduleGraph: { getModuleById: () => undefined },
      ws: { send: () => undefined },
    });
    const [, change] = handlers;
    const examplePath = join(
      rootDirectory,
      'workflow-catalog.local/examples/retry/example.ts',
    );

    change(examplePath);
    await Promise.resolve();
    await Promise.resolve();

    expect(errors).toEqual([
      'Workflow catalog generation failed: generation failed',
    ]);
    await expect(readFile(artifactPath, 'utf8')).resolves.toBe(
      'last successful artifact\n',
    );

    change(examplePath);
    await Promise.resolve();
    await Promise.resolve();
    expect(attempts).toBe(2);
  });
});
