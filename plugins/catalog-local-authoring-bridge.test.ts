import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { createCatalogLocalAuthoringBridge } from './catalog-local-authoring-bridge';

const servers: ReturnType<typeof createServer>[] = [];

afterEach(async () => {
  vi.restoreAllMocks();
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

const startBridge = async (
  authoring: object,
  options: Record<string, unknown> = {},
) => {
  const bridge = createCatalogLocalAuthoringBridge({
    ...options,
    authoring: authoring as never,
    rootDirectory: '/catalog',
  } as never);
  const server = createServer((request, response) =>
    bridge.middleware(request, response, () => {
      response.statusCode = 404;
      response.end('not found');
    }),
  );
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
};

describe('local catalog authoring bridge', () => {
  it('keeps generated worker modules outside the Vite config static dependency graph', async () => {
    const source = await readFile(
      join(process.cwd(), 'plugins/catalog-local-authoring-bridge.ts'),
      'utf8',
    );

    expect(source).toContain(
      "import type { createUiCatalogAuthoring } from '../scripts/catalog/ui-authoring';",
    );
    expect(source).not.toContain(
      "import {\n  createUiCatalogAuthoring,\n  uiCatalogGeneratedPaths,\n} from '../scripts/catalog/ui-authoring';",
    );
    expect(source).not.toContain("import('../scripts/catalog/ui-authoring')");
  });

  it('suppresses generated scaffold mutations until the scaffold response has completed', async () => {
    const generatedWorkerIndex = join(
      '/catalog',
      'src/lib/catalog/worker/examples/index.ts',
    );
    const bridge: {
      value: ReturnType<typeof createCatalogLocalAuthoringBridge>;
    } = {} as {
      value: ReturnType<typeof createCatalogLocalAuthoringBridge>;
    };
    const authoring = {
      scaffold: vi.fn(async () => {
        expect(
          bridge.value.shouldSuppressWatchEvent(generatedWorkerIndex),
        ).toBe(true);
      }),
    };
    bridge.value = createCatalogLocalAuthoringBridge({
      authoring: authoring as never,
      rootDirectory: '/catalog',
    });
    const server = createServer((request, response) =>
      bridge.value.middleware(request, response, () =>
        response.end('not found'),
      ),
    );
    servers.push(server);
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const { port } = server.address() as AddressInfo;

    const response = await fetch(
      `http://127.0.0.1:${port}/__catalog-local-authoring/scaffold`,
      {
        body: JSON.stringify({ exampleId: 'local-order' }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      },
    );

    expect(response.status).toBe(204);
    expect(authoring.scaffold).toHaveBeenCalledWith('local-order');
  });

  it('releases Save suppression after a write failure so later external edits can update', async () => {
    const sourcePath = join(
      '/catalog',
      'catalog.local/examples/local-order/workflow.ts',
    );
    const bridge = createCatalogLocalAuthoringBridge({
      authoring: {
        save: async (
          _request: unknown,
          onProgress?: (event: {
            kind: 'check';
            operationId: string;
            sequence: number;
            severity: 'blocking';
            state: 'started';
            step: 'write_files';
          }) => void,
        ) => {
          onProgress?.({
            kind: 'check',
            operationId: 'failed-save',
            sequence: 1,
            severity: 'blocking',
            state: 'started',
            step: 'write_files',
          });
          throw new Error('write failed');
        },
      } as never,
      rootDirectory: '/catalog',
    });
    const server = createServer((request, response) =>
      bridge.middleware(request, response, () => response.end('not found')),
    );
    servers.push(server);
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const { port } = server.address() as AddressInfo;

    const response = await fetch(
      `http://127.0.0.1:${port}/__catalog-local-authoring/save`,
      {
        body: JSON.stringify({
          baseRevision: 'loaded-revision',
          exampleId: 'local-order',
          files: [{ content: 'saved\n', path: 'workflow.ts' }],
          operationId: 'failed-save',
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      },
    );

    expect(response.status).toBe(200);
    await response.text();
    await new Promise((resolve) => setTimeout(resolve, 1_050));
    expect(bridge.shouldSuppressWatchEvent(sourcePath)).toBe(false);
  });

  it('notifies a catalog refresh once after the scaffold response is delivered', async () => {
    const onMutationDelivered = vi.fn();
    const origin = await startBridge(
      { scaffold: vi.fn(async () => undefined) },
      { onMutationDelivered },
    );

    const response = await fetch(
      `${origin}/__catalog-local-authoring/scaffold`,
      {
        body: JSON.stringify({ exampleId: 'local-order' }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      },
    );

    await expect(response.text()).resolves.toBe('');
    expect(onMutationDelivered).toHaveBeenCalledOnce();
    expect(onMutationDelivered).toHaveBeenCalledWith({
      exampleId: 'local-order',
      kind: 'scaffold',
    });
  });

  it('does not notify a catalog refresh when scaffold fails', async () => {
    const onMutationDelivered = vi.fn();
    const origin = await startBridge(
      {
        scaffold: vi.fn(async () => {
          throw new Error('scaffold failed');
        }),
      },
      { onMutationDelivered },
    );

    const response = await fetch(
      `${origin}/__catalog-local-authoring/scaffold`,
      {
        body: JSON.stringify({ exampleId: 'local-order' }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      },
    );

    expect(response.status).toBe(500);
    await response.text();
    expect(onMutationDelivered).not.toHaveBeenCalled();
  });

  it('serves scaffold and load only to loopback requests with exact JSON inputs', async () => {
    const example = {
      id: 'local-order',
      sourceFiles: [],
      sourceId: 'local',
      sourceSnapshot: {
        baseRevision: 'revision',
        limits: {
          maxDepth: 8,
          maxFileBytes: 1024,
          maxFiles: 8,
          maxTotalBytes: 4096,
        },
      },
      targetId: 'local-target',
    };
    const authoring = {
      scaffold: vi.fn(async () => undefined),
      loadExamples: vi.fn(async () => [example]),
    };
    const origin = await startBridge(authoring);

    const scaffold = await fetch(
      `${origin}/__catalog-local-authoring/scaffold`,
      {
        body: JSON.stringify({ exampleId: 'local-order' }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      },
    );
    expect(scaffold.status).toBe(204);
    expect(authoring.scaffold).toHaveBeenCalledWith('local-order');

    const loaded = await fetch(
      `${origin}/__catalog-local-authoring/examples/local-order`,
    );
    expect(loaded.status).toBe(200);
    await expect(loaded.json()).resolves.toEqual(example);

    const hostileOrigin = await fetch(
      `${origin}/__catalog-local-authoring/examples/local-order`,
      { headers: { origin: 'https://catalog.example.com' } },
    );
    expect(hostileOrigin.status).toBe(403);

    const wrongContentType = await fetch(
      `${origin}/__catalog-local-authoring/scaffold`,
      {
        body: JSON.stringify({ exampleId: 'must-not-run' }),
        headers: { 'content-type': 'text/plain' },
        method: 'POST',
      },
    );
    expect(wrongContentType.status).toBe(415);
    expect(authoring.scaffold).toHaveBeenCalledTimes(1);
  });

  it('streams core Save events and delegates operation inspection without storing another outcome', async () => {
    const started = {
      kind: 'check' as const,
      operationId: 'save-1',
      sequence: 1,
      severity: 'blocking' as const,
      state: 'started' as const,
      step: 'write_files',
    };
    const terminal = {
      kind: 'terminal' as const,
      operationId: 'save-1',
      outcome: {
        baseRevision: 'saved-revision',
        changedPaths: [],
        commit: 'durable' as const,
        exampleId: 'local-order',
        generatedOutputs: [],
        status: 'succeeded' as const,
      },
      ownership: 'released' as const,
      reload: 'publish' as const,
      sequence: 2,
    };
    const inspection = {
      events: [started, terminal],
      operationId: 'save-1',
      ownership: 'released' as const,
      status: 'terminal' as const,
      terminal,
    };
    const authoring = {
      save: vi.fn(async (_request, onProgress) => {
        onProgress?.(started);
        onProgress?.(terminal);
        return terminal;
      }),
      inspectSaveOperation: vi.fn(async () => inspection),
    };
    const origin = await startBridge(authoring);
    const request = {
      baseRevision: 'loaded-revision',
      exampleId: 'local-order',
      files: [{ content: 'export const saved = true;\n', path: 'workflow.ts' }],
      operationId: 'save-1',
    };

    const save = await fetch(`${origin}/__catalog-local-authoring/save`, {
      body: JSON.stringify(request),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    });
    expect(save.status).toBe(200);
    expect(save.headers.get('content-type')).toBe(
      'application/x-ndjson; charset=utf-8',
    );
    expect(
      (await save.text())
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line)),
    ).toEqual([started, terminal]);
    expect(authoring.save).toHaveBeenCalledWith(request, expect.any(Function));

    const inspected = await fetch(
      `${origin}/__catalog-local-authoring/operations/save-1`,
    );
    expect(inspected.status).toBe(200);
    await expect(inspected.json()).resolves.toEqual(inspection);
    expect(authoring.inspectSaveOperation).toHaveBeenCalledWith('save-1');

    const modeInjection = await fetch(
      `${origin}/__catalog-local-authoring/save`,
      {
        body: JSON.stringify({
          ...request,
          operationId: 'save-with-mode',
          files: [{ ...request.files[0], mode: 0o777 }],
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      },
    );
    expect(modeInjection.status).toBe(400);
    expect(authoring.save).toHaveBeenCalledTimes(1);
  });

  it('notifies a catalog refresh only after the Save terminal stream is delivered', async () => {
    const terminal = {
      kind: 'terminal' as const,
      operationId: 'save-after-stream',
      outcome: {
        baseRevision: 'saved-revision',
        changedPaths: [],
        commit: 'durable' as const,
        exampleId: 'local-order',
        generatedOutputs: [],
        status: 'succeeded' as const,
      },
      ownership: 'released' as const,
      reload: 'publish' as const,
      sequence: 1,
    };
    const onMutationDelivered = vi.fn();
    const origin = await startBridge(
      {
        save: vi.fn(async (_request, onProgress) => {
          onProgress?.(terminal);
          return terminal;
        }),
      },
      { onMutationDelivered },
    );

    const response = await fetch(`${origin}/__catalog-local-authoring/save`, {
      body: JSON.stringify({
        baseRevision: 'loaded-revision',
        exampleId: 'local-order',
        files: [{ content: 'saved\n', path: 'workflow.ts' }],
        operationId: 'save-after-stream',
      }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    });

    await expect(response.text()).resolves.toBe(
      `${JSON.stringify(terminal)}\n`,
    );
    expect(onMutationDelivered).toHaveBeenCalledOnce();
    expect(onMutationDelivered).toHaveBeenCalledWith({
      kind: 'save',
      terminal,
    });
  });

  it('transports promotion preview and confirmation through exact JSON requests', async () => {
    const preview = {
      authoredSource: 'catalog.local/examples/local-order',
      destination: {
        id: 'oss',
        path: 'src/lib/catalog/worker/examples/local-order',
      },
      exampleId: 'local-order',
      generatedOutputs: [],
      gitEffects: {
        destination: 'tracked-addition',
        source: 'ignored-removal',
      },
      revision: 'promotion-revision',
      source: { id: 'local', path: 'catalog.local/examples/local-order' },
      status: 'available',
    };
    const outcome = {
      changedPaths: [],
      direction: 'promote',
      moved: {
        from: 'catalog.local/examples/local-order',
        to: 'src/lib/catalog/worker/examples/local-order',
      },
      status: 'succeeded',
    };
    const authoring = {
      previewPromote: vi.fn(async () => preview),
      confirmPromote: vi.fn(async () => outcome),
    };
    const origin = await startBridge(authoring);
    const saveState = { durability: 'durable', status: 'saved' };

    const previewResponse = await fetch(
      `${origin}/__catalog-local-authoring/promotions/preview`,
      {
        body: JSON.stringify({ exampleId: 'local-order', saveState }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      },
    );
    expect(previewResponse.status).toBe(200);
    await expect(previewResponse.json()).resolves.toEqual(preview);
    expect(authoring.previewPromote).toHaveBeenCalledWith({
      exampleId: 'local-order',
      saveState,
    });

    const confirmResponse = await fetch(
      `${origin}/__catalog-local-authoring/promotions/confirm`,
      {
        body: JSON.stringify({
          exampleId: 'local-order',
          revision: 'promotion-revision',
          saveState,
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      },
    );
    expect(confirmResponse.status).toBe(200);
    await expect(confirmResponse.json()).resolves.toEqual(outcome);
    expect(authoring.confirmPromote).toHaveBeenCalledWith({
      exampleId: 'local-order',
      revision: 'promotion-revision',
      saveState,
    });
  });
});
