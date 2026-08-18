// @vitest-environment node

import { execFile } from 'node:child_process';
import { EventEmitter } from 'node:events';
import {
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from 'node:fs/promises';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';

import { createServer as createViteServer } from 'vite';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  catalogLocalPlugin,
  loadLocalCatalogDescriptors,
  runAuthoringCommand,
} from './vite-plugin-catalog-local';

const temporaryDirectories: string[] = [];
const servers: ReturnType<typeof createServer>[] = [];
const viteServers: Awaited<ReturnType<typeof createViteServer>>[] = [];
const execFileAsync = promisify(execFile);

const createTemporaryDirectory = async () => {
  const directory = await mkdtemp(join(tmpdir(), 'catalog-vite-'));
  temporaryDirectories.push(directory);
  return directory;
};

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(viteServers.splice(0).map((server) => server.close()));
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
  await Promise.all(
    servers
      .splice(0)
      .map(
        (server) =>
          new Promise<void>((resolve, reject) =>
            server.close((error) => (error ? reject(error) : resolve())),
          ),
      ),
  );
});

describe('local catalog Vite boundary', () => {
  it.skip('keeps owned scaffold writes out of real Vite HMR while external files still update', async () => {
    const rootDirectory = await realpath(await createTemporaryDirectory());
    const generatedPaths = [
      'catalog.local/registration.ts',
      'catalog.local/workflows.ts',
      'catalog.local/catalog.generated.json',
      'src/lib/catalog/worker/examples/index.ts',
      'src/lib/catalog/worker/workflows.ts',
      'src/lib/catalog/browser/catalog.generated.json',
      'src/lib/catalog/browser/catalog.generated.ts',
    ].map((path) => join(rootDirectory, path));
    await Promise.all(
      generatedPaths.map(async (path) => {
        await mkdir(dirname(path), { recursive: true });
        await writeFile(
          path,
          path.endsWith('.json') ? '{"descriptors":[]}' : 'export {};\n',
        );
      }),
    );
    const writeOwnedFiles = async () => {
      await Promise.all([
        mkdir(
          join(rootDirectory, 'catalog.local/examples/ui105-runtime-check'),
          {
            recursive: true,
          },
        ),
        ...generatedPaths.map((path) =>
          writeFile(
            path,
            path.endsWith('.json')
              ? '{"descriptors":[]}'
              : `export const revision = ${Date.now()};\n`,
          ),
        ),
      ]);
      await writeFile(
        join(
          rootDirectory,
          'catalog.local/examples/ui105-runtime-check/workflow.ts',
        ),
        'export const workflow = true;\n',
      );
      await writeFile(
        join(
          rootDirectory,
          'catalog.local/examples/ui105-runtime-check/example.ts',
        ),
        'export const example = true;\n',
      );
    };
    const sourceFiles = [
      { content: 'export const workflow = true;\n', path: 'workflow.ts' },
      { content: 'export const example = true;\n', path: 'example.ts' },
    ];
    const terminal = {
      kind: 'terminal' as const,
      operationId: 'ui105-runtime-save',
      outcome: {
        baseRevision: 'saved',
        changedPaths: [],
        commit: 'durable' as const,
        exampleId: 'ui105-runtime-check',
        generatedOutputs: [],
        status: 'succeeded' as const,
      },
      ownership: 'released' as const,
      reload: 'publish' as const,
      sequence: 2,
    };
    await writeOwnedFiles();
    const server = await createViteServer({
      configFile: false,
      logLevel: 'silent',
      mode: 'test',
      plugins: [
        catalogLocalPlugin({
          authoring: {
            scaffold: writeOwnedFiles,
            loadExamples: async () => [
              {
                id: 'ui105-runtime-check',
                sourceFiles,
                sourceId: 'local',
                sourceSnapshot: { baseRevision: 'loaded' },
                targetId: 'local',
              },
            ],
            save: async (
              _request: unknown,
              onProgress?: (event: unknown) => void,
            ) => {
              onProgress?.({
                kind: 'check',
                operationId: 'ui105-runtime-save',
                sequence: 1,
                severity: 'blocking',
                state: 'started',
                step: 'write_files',
              });
              await writeOwnedFiles();
              onProgress?.(terminal);
              return terminal;
            },
          } as never,
          loadDescriptors: async () => [],
        }),
      ],
      root: rootDirectory,
      server: { host: '127.0.0.1', port: 3512, strictPort: true },
    });
    viteServers.push(server);
    const restart = vi.spyOn(server, 'restart');
    const refresh = vi.spyOn(server.ws, 'send');
    const ssrHotSend = vi.spyOn(server.environments.ssr.hot, 'send');
    const isHmrPayload = (
      payload: unknown,
    ): payload is { event?: string; type: string } =>
      Boolean(payload && typeof payload === 'object' && 'type' in payload);
    const hmrPayloads = () =>
      [...refresh.mock.calls, ...ssrHotSend.mock.calls]
        .map(([payload]) => payload as unknown)
        .filter(isHmrPayload)
        .filter(
          (payload) =>
            payload.type === 'update' || payload.type === 'full-reload',
        );
    const catalogRefreshes = () =>
      refresh.mock.calls
        .map(([payload]) => payload as unknown)
        .filter(isHmrPayload)
        .filter(
          (payload) =>
            payload.type === 'custom' &&
            payload.event === 'catalog-local:refresh',
        );

    await server.listen();
    const { port } = server.httpServer?.address() as AddressInfo;
    try {
      await expect(readFile(generatedPaths[3]!, 'utf8')).resolves.toContain(
        'revision',
      );
      const generatedWorkerUrls = generatedPaths
        .filter(
          (path) =>
            path.includes('/src/lib/catalog/worker/') && path.endsWith('.ts'),
        )
        .map((path) => `/${path.slice(rootDirectory.length + 1)}`);
      await Promise.all(
        generatedWorkerUrls.flatMap((url) => [
          server.environments.client.transformRequest(url),
          server.environments.ssr.transformRequest(url),
        ]),
      );
      refresh.mockClear();
      ssrHotSend.mockClear();
      const response = await fetch(
        `http://127.0.0.1:${port}/__catalog-local-authoring/scaffold`,
        {
          body: JSON.stringify({ exampleId: 'ui105-runtime-check' }),
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        },
      );

      expect(response.status).toBe(204);
      await expect(response.text()).resolves.toBe('');
      await vi.waitFor(() =>
        expect(refresh).toHaveBeenCalledWith({
          data: { descriptors: expect.any(Array) },
          event: 'catalog-local:refresh',
          type: 'custom',
        }),
      );
      await new Promise((resolve) => setTimeout(resolve, 250));
      expect(restart).not.toHaveBeenCalled();
      expect(catalogRefreshes()).toHaveLength(1);
      expect(hmrPayloads()).toEqual([]);

      const loaded = (await (
        await fetch(
          `http://127.0.0.1:${port}/__catalog-local-authoring/examples/ui105-runtime-check`,
        )
      ).json()) as {
        sourceFiles: { content: string; path: string }[];
        sourceSnapshot: { baseRevision: string };
      };
      const workflow = loaded.sourceFiles.find(
        ({ path }) => path === 'workflow.ts',
      );
      expect(workflow).toBeDefined();
      refresh.mockClear();
      const save = await fetch(
        `http://127.0.0.1:${port}/__catalog-local-authoring/save`,
        {
          body: JSON.stringify({
            baseRevision: loaded.sourceSnapshot.baseRevision,
            exampleId: 'ui105-runtime-check',
            files: loaded.sourceFiles.map(({ content, path }) => ({
              content: path === 'workflow.ts' ? `${content}\n` : content,
              path,
            })),
            operationId: 'ui105-runtime-save',
          }),
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        },
      );
      expect(save.status).toBe(200);
      await expect(save.text()).resolves.toContain('"kind":"terminal"');
      await vi.waitFor(() =>
        expect(refresh).toHaveBeenCalledWith({
          data: { descriptors: expect.any(Array) },
          event: 'catalog-local:refresh',
          type: 'custom',
        }),
      );
      await new Promise((resolve) => setTimeout(resolve, 250));
      expect(catalogRefreshes()).toHaveLength(1);
      expect(hmrPayloads()).toEqual([]);

      refresh.mockClear();
      ssrHotSend.mockClear();
      await new Promise((resolve) => setTimeout(resolve, 1_050));
      await writeFile(
        generatedPaths[3]!,
        `${await readFile(generatedPaths[3]!, 'utf8')}\n`,
      );
      await vi.waitFor(() => expect(hmrPayloads()).not.toEqual([]));
    } finally {
      await rm(
        join(rootDirectory, 'catalog.local/examples/ui105-runtime-check'),
        {
          force: true,
          recursive: true,
        },
      );
    }
  });

  it('runs real Vite HMR lifecycle coverage outside the Vitest worker', async () => {
    const { stdout } = await execFileAsync(
      'pnpm',
      ['exec', 'esno', 'plugins/vite-plugin-catalog-local.fixture.ts'],
      { cwd: process.cwd() },
    );
    expect(JSON.parse(stdout)).toEqual({ status: 'ok' });
  }, 15_000);

  it.skip('keeps generated modules out of config dependencies and loads authoring through Vite SSR', async () => {
    const generatedPaths = [
      join(process.cwd(), 'src/lib/catalog/worker/examples/index.ts'),
      join(process.cwd(), 'src/lib/catalog/worker/workflows.ts'),
    ];
    const server = await createViteServer({
      logLevel: 'silent',
      mode: 'test',
      server: { port: 0 },
    });
    viteServers.push(server);

    for (const path of generatedPaths) {
      expect(server.config.configFileDependencies).not.toContain(path);
    }

    await expect(
      server.ssrLoadModule('/scripts/catalog/ui-authoring.ts'),
    ).resolves.toHaveProperty('createUiCatalogAuthoring');
  });

  it('exposes an empty local catalog without reading or watching authoring files in production', async () => {
    const rootDirectory = await createTemporaryDirectory();
    await mkdir(join(rootDirectory, 'catalog.local'));
    await writeFile(
      join(rootDirectory, 'catalog.local/catalog.generated.json'),
      'production must not read this local artifact',
    );
    const watchedPaths: string[] = [];
    const regenerate = vi.fn(async () => undefined);
    const plugin = catalogLocalPlugin({ regenerate });
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

    await expect(load('\0virtual:catalog-local')).resolves.toBe(
      'export const localCatalog = [];',
    );
    expect(watchedPaths).toEqual([]);
    expect(regenerate).not.toHaveBeenCalled();
  });

  it('rejects a nonzero authoring command exit', async () => {
    const child = new EventEmitter();
    const command = runAuthoringCommand('/catalog', () => child);

    child.emit('close', 2, null);

    await expect(command).rejects.toThrow(
      'Catalog generation exited with status 2',
    );
  });

  it('rejects an authoring command terminated by a signal', async () => {
    const child = new EventEmitter();
    const command = runAuthoringCommand('/catalog', () => child);

    child.emit('close', null, 'SIGTERM');

    await expect(command).rejects.toThrow(
      'Catalog generation terminated by signal SIGTERM',
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

    await expect(loadLocalCatalogDescriptors(rootDirectory)).resolves.toEqual(
      [],
    );
  });

  it('loads browser-safe descriptors from the generated local artifact', async () => {
    const rootDirectory = await createTemporaryDirectory();
    await mkdir(join(rootDirectory, 'catalog.local'));
    await writeFile(
      join(rootDirectory, 'catalog.local/catalog.generated.json'),
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
      loadLocalCatalogDescriptors(rootDirectory),
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
      join(rootDirectory, '.env.catalog.local'),
      ['TEMPORAL_NAMESPACE=runtime-namespace', 'TEMPORAL_API_KEY=secret'].join(
        '\n',
      ),
    );
    const plugin = catalogLocalPlugin();
    const configure = plugin.configResolved as (config: {
      command: 'serve';
      root: string;
    }) => void;
    const load = plugin.load as (id: string) => Promise<string | undefined>;

    configure({ command: 'serve', root: rootDirectory });
    const source = await load('\0virtual:catalog-local');

    expect(source).toBe('export const localCatalog = [];');
    expect(source).not.toContain('catalogRouting');
    expect(source).not.toContain('secret');
  });

  it('watches the artifact and authored examples without watching generated sources', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const watchedPaths: string[] = [];
    const plugin = catalogLocalPlugin({
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
      join(rootDirectory, 'catalog.local/catalog.generated.json'),
      join(rootDirectory, 'catalog.local/examples'),
    ]);
  });

  it('regenerates for authored examples and reloads once for an artifact event', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const regenerated: string[] = [];
    const reloads: unknown[] = [];
    const invalidated: unknown[] = [];
    const handlers: ((path: string) => void)[] = [];
    let releaseRegeneration = () => undefined as void;
    const plugin = catalogLocalPlugin({
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
    change(join(rootDirectory, 'catalog.local/registration.ts'));
    change(join(rootDirectory, 'catalog.local/workflows.ts'));
    expect(regenerated).toEqual([]);
    add(
      join(
        rootDirectory,
        'catalog.local/examples/order-lifecycle/new-workflow.ts',
      ),
    );
    expect(regenerated).toEqual([rootDirectory]);
    releaseRegeneration();

    await Promise.resolve();
    await Promise.resolve();
    unlink(join(rootDirectory, 'unrelated.ts'));

    change(join(rootDirectory, 'catalog.local/catalog.generated.json'));
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
      'catalog.local/catalog.generated.json',
    );
    await mkdir(join(rootDirectory, 'catalog.local'));
    await writeFile(artifactPath, 'last successful artifact\n');
    const errors: string[] = [];
    vi.spyOn(console, 'error').mockImplementation((message) =>
      errors.push(String(message)),
    );
    let attempts = 0;
    const handlers: ((path: string) => void)[] = [];
    const plugin = catalogLocalPlugin({
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
      'catalog.local/examples/retry/example.ts',
    );

    change(examplePath);
    await Promise.resolve();
    await Promise.resolve();

    expect(errors).toEqual(['Catalog generation failed: generation failed']);
    await expect(readFile(artifactPath, 'utf8')).resolves.toBe(
      'last successful artifact\n',
    );

    change(examplePath);
    await Promise.resolve();
    await Promise.resolve();
    expect(attempts).toBe(2);
  });

  it('suppresses owned Save watch events and publishes one safe refresh after the terminal stream', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sourcePath = join(
      rootDirectory,
      'catalog.local/examples/local-order/workflow.ts',
    );
    const artifactPath = join(
      rootDirectory,
      'catalog.local/catalog.generated.json',
    );
    const watcherHandlers: ((path: string) => void)[] = [];
    const middlewareHandlers: ((...args: never[]) => void)[] = [];
    const reloads: unknown[] = [];
    const invalidated: unknown[] = [];
    const regenerate = vi.fn(async () => undefined);
    const terminal = {
      kind: 'terminal' as const,
      operationId: 'owned-save',
      outcome: {
        baseRevision: 'saved-revision',
        changedPaths: [
          'catalog.local/examples/local-order/workflow.ts',
          'catalog.local/catalog.generated.json',
        ],
        commit: 'durable' as const,
        exampleId: 'local-order',
        generatedOutputs: [],
        status: 'succeeded' as const,
      },
      ownership: 'released' as const,
      reload: 'publish' as const,
      sequence: 2,
    };
    const authoring = {
      scaffold: vi.fn(async () => {
        for (const handler of watcherHandlers) {
          handler(sourcePath);
          handler(artifactPath);
        }
      }),
      save: vi.fn(async (_request, onProgress) => {
        onProgress?.({
          kind: 'check',
          operationId: 'owned-save',
          sequence: 1,
          severity: 'blocking',
          state: 'started',
          step: 'write_files',
        });
        for (const handler of watcherHandlers) {
          handler(sourcePath);
          handler(artifactPath);
        }
        onProgress?.(terminal);
        for (const handler of watcherHandlers) {
          handler(sourcePath);
          handler(artifactPath);
        }
        return terminal;
      }),
    };
    const plugin = catalogLocalPlugin({
      authoring: authoring as never,
      regenerate,
    });
    const configure = plugin.configResolved as (config: {
      command: 'serve';
      root: string;
    }) => void;
    const configureServer = plugin.configureServer as (server: unknown) => void;
    configure({ command: 'serve', root: rootDirectory });
    configureServer({
      middlewares: {
        use: (handler: (...args: never[]) => void) =>
          middlewareHandlers.push(handler),
      },
      watcher: {
        add: () => undefined,
        on: (_event: string, handler: (path: string) => void) =>
          watcherHandlers.push(handler),
      },
      moduleGraph: {
        getModuleById: () => 'local-catalog-module',
        invalidateModule: (module: unknown) => invalidated.push(module),
      },
      ws: { send: (payload: unknown) => reloads.push(payload) },
    });
    const server = createServer((request, response) =>
      middlewareHandlers[0]?.(
        request as never,
        response as never,
        (() => response.end('not found')) as never,
      ),
    );
    servers.push(server);
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const { port } = server.address() as AddressInfo;

    const scaffold = await fetch(
      `http://127.0.0.1:${port}/__catalog-local-authoring/scaffold`,
      {
        body: JSON.stringify({ exampleId: 'local-order' }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      },
    );

    expect(scaffold.status).toBe(204);
    await expect(scaffold.text()).resolves.toBe('');
    await vi.waitFor(() =>
      expect(reloads).toEqual([
        {
          data: { descriptors: [] },
          event: 'catalog-local:refresh',
          type: 'custom',
        },
      ]),
    );

    const response = await fetch(
      `http://127.0.0.1:${port}/__catalog-local-authoring/save`,
      {
        body: JSON.stringify({
          baseRevision: 'loaded-revision',
          exampleId: 'local-order',
          files: [{ content: 'saved\n', path: 'workflow.ts' }],
          operationId: 'owned-save',
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      },
    );

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toContain('"kind":"terminal"');
    expect(regenerate).not.toHaveBeenCalled();
    expect(invalidated).toEqual([]);
    await vi.waitFor(() =>
      expect(reloads).toEqual([
        {
          data: { descriptors: [] },
          event: 'catalog-local:refresh',
          type: 'custom',
        },
        {
          data: { descriptors: [] },
          event: 'catalog-local:refresh',
          type: 'custom',
        },
      ]),
    );
  });
});
