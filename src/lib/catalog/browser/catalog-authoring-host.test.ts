import { describe, expect, it, vi } from 'vitest';

import { createFetchCatalogAuthoringHost } from './catalog-authoring-host';

describe('fetch catalog authoring host', () => {
  it('scaffolds then loads an encoded local example over the same-origin bridge', async () => {
    const example = {
      id: 'payment reminder',
      sourceFiles: [],
      sourceSnapshot: {
        baseRevision: 'revision-1',
        limits: {
          maxDepth: 8,
          maxFileBytes: 262144,
          maxFiles: 64,
          maxTotalBytes: 1048576,
        },
      },
    };
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(new Response(undefined, { status: 204 }))
      .mockResolvedValueOnce(Response.json(example));
    const host = createFetchCatalogAuthoringHost(fetch);

    await host.scaffold(example.id);
    await expect(host.load(example.id)).resolves.toEqual(example);

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      '/__catalog-local-authoring/scaffold',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ exampleId: example.id }),
      }),
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      '/__catalog-local-authoring/examples/payment%20reminder',
    );
  });

  it('reports a missing local example plainly when load returns 404', async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response(undefined, { status: 404 }));
    const host = createFetchCatalogAuthoringHost(fetch);

    await expect(host.load('missing-example')).rejects.toThrow(
      'Local example "missing-example" was not found.',
    );
  });

  it('streams each Save event once in order and returns the terminal event', async () => {
    const progress = {
      kind: 'check',
      operationId: 'operation/1',
      sequence: 1,
      step: 'verify',
      state: 'passed',
      severity: 'blocking',
    } as const;
    const terminal = {
      kind: 'terminal',
      operationId: 'operation/1',
      sequence: 2,
      outcome: {
        status: 'succeeded',
        commit: 'durable',
        exampleId: 'payment-reminder',
        baseRevision: 'revision-2',
        changedPaths: ['workflow.ts'],
        generatedOutputs: [],
      },
      ownership: 'released',
      reload: 'publish',
    } as const;
    const ndjson = `${JSON.stringify(progress)}\n${JSON.stringify(terminal)}\n`;
    const encoded = new TextEncoder().encode(ndjson);
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoded.slice(0, 19));
        controller.enqueue(encoded.slice(19));
        controller.close();
      },
    });
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response(body, {
        headers: { 'content-type': 'application/x-ndjson' },
      }),
    );
    const host = createFetchCatalogAuthoringHost(fetch);
    const request = {
      operationId: 'operation/1',
      exampleId: 'payment-reminder',
      baseRevision: 'revision-1',
      files: [
        { path: 'workflow.ts', content: 'export const workflow = true;' },
      ],
    } as const;
    const received: unknown[] = [];

    await expect(
      host.save(request, (event) => received.push(event)),
    ).resolves.toEqual(terminal);
    expect(received).toEqual([progress, terminal]);
    expect(fetch).toHaveBeenCalledWith(
      '/__catalog-local-authoring/save',
      expect.objectContaining({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(request),
      }),
    );
  });

  it('rejects a failed Save bridge response without forwarding events', async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response(undefined, { status: 503 }));
    const host = createFetchCatalogAuthoringHost(fetch);
    const onEvent = vi.fn();

    await expect(
      host.save(
        {
          operationId: 'operation-1',
          exampleId: 'payment-reminder',
          baseRevision: 'revision-1',
          files: [],
        },
        onEvent,
      ),
    ).rejects.toThrow('Unable to save the local example.');
    expect(onEvent).not.toHaveBeenCalled();
  });

  it('inspects an encoded Save operation and maps a missing operation to undefined', async () => {
    const inspection = {
      operationId: 'operation/1',
      status: 'running',
      ownership: 'retained',
      events: [],
    } as const;
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(Response.json(inspection))
      .mockResolvedValueOnce(new Response(undefined, { status: 404 }));
    const host = createFetchCatalogAuthoringHost(fetch);

    await expect(host.inspectSaveOperation('operation/1')).resolves.toEqual(
      inspection,
    );
    await expect(
      host.inspectSaveOperation('missing operation'),
    ).resolves.toBeUndefined();
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      '/__catalog-local-authoring/operations/operation%2F1',
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      '/__catalog-local-authoring/operations/missing%20operation',
    );
  });

  it('previews and confirms a revision-bound promotion with exact Save state', async () => {
    const preview = {
      status: 'available',
      exampleId: 'payment-reminder',
      revision: 'revision-2',
      source: {
        id: 'payment-reminder',
        path: 'catalog.local/payment-reminder',
      },
      destination: { id: 'payment-reminder', path: 'catalog/payment-reminder' },
      authoredSource: 'catalog.local/payment-reminder',
      generatedOutputs: [],
      gitEffects: {
        source: 'ignored-removal',
        destination: 'tracked-addition',
      },
    } as const;
    const outcome = {
      status: 'succeeded',
      commit: 'durable',
      direction: 'promote',
      result: {
        changedPaths: ['catalog.local/payment-reminder'],
        moved: {
          from: 'catalog.local/payment-reminder',
          to: 'catalog/payment-reminder',
        },
      },
    } as const;
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(Response.json(preview))
      .mockResolvedValueOnce(Response.json(outcome));
    const host = createFetchCatalogAuthoringHost(fetch);
    const saveState = { status: 'saved', durability: 'durable' } as const;

    await expect(
      host.previewPromote({ exampleId: 'payment-reminder', saveState }),
    ).resolves.toEqual(preview);
    await expect(
      host.confirmPromote({
        exampleId: 'payment-reminder',
        revision: 'revision-2',
        saveState,
      }),
    ).resolves.toEqual(outcome);
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      '/__catalog-local-authoring/promotions/preview',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ exampleId: 'payment-reminder', saveState }),
      }),
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      '/__catalog-local-authoring/promotions/confirm',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          exampleId: 'payment-reminder',
          revision: 'revision-2',
          saveState,
        }),
      }),
    );
  });
});
