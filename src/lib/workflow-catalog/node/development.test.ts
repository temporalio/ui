import { EventEmitter } from 'node:events';

import { describe, expect, it, vi } from 'vitest';

import { runWorkflowCatalogDevelopment } from './development';

describe('runWorkflowCatalogDevelopment', () => {
  it('shuts down after workers complete normally so an owned connection closes', async () => {
    const connection = { close: vi.fn(async () => undefined) };
    const shutdown = vi.fn();

    await runWorkflowCatalogDevelopment({
      bindings: [
        {
          target: {
            id: 'catalog',
            namespace: 'catalog-namespace',
            taskQueue: 'catalog-queue',
            workflowsPath: './catalog-workflows.js',
            workflowExports: {},
          },
          examples: [],
          activities: {},
          nexusServices: [],
        },
      ],
      connectionFactory: async () => connection,
      createWorker: async () => ({
        run: async () => undefined,
        shutdown,
      }),
      signals: new EventEmitter(),
    });

    expect(shutdown).toHaveBeenCalledOnce();
    expect(connection.close).toHaveBeenCalledOnce();
  });

  it('rejects an empty catalog before connecting and shuts down on process signals', async () => {
    const emptyConnectionFactory = vi.fn(async () => ({
      close: vi.fn(async () => undefined),
    }));

    await expect(
      runWorkflowCatalogDevelopment({
        bindings: [],
        connectionFactory: emptyConnectionFactory,
        createWorker: vi.fn(),
        signals: new EventEmitter(),
      }),
    ).rejects.toThrowError(
      'Workflow catalog has no runnable targets; register an example before starting the development runner',
    );
    expect(emptyConnectionFactory).not.toHaveBeenCalled();

    const signals = new EventEmitter();
    const connection = { close: vi.fn(async () => undefined) };
    let settleRun: (() => void) | undefined;
    const shutdown = vi.fn(() => settleRun?.());
    const running = runWorkflowCatalogDevelopment({
      bindings: [
        {
          target: {
            id: 'catalog',
            namespace: 'catalog-namespace',
            taskQueue: 'catalog-queue',
            workflowsPath: './catalog-workflows.js',
            workflowExports: {},
          },
          examples: [],
          activities: {},
          nexusServices: [],
        },
      ],
      connectionFactory: async () => connection,
      createWorker: async () => ({
        run: () =>
          new Promise<void>((resolve) => {
            settleRun = resolve;
          }),
        shutdown,
      }),
      signals,
    });
    await vi.waitFor(() => expect(signals.listenerCount('SIGINT')).toBe(1));

    signals.emit('SIGINT');
    await running;

    expect(shutdown).toHaveBeenCalledOnce();
    expect(connection.close).toHaveBeenCalledOnce();
    expect(signals.listenerCount('SIGINT')).toBe(0);
    expect(signals.listenerCount('SIGTERM')).toBe(0);
  });
});
