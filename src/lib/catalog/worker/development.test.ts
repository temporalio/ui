import { EventEmitter } from 'node:events';

import { describe, expect, it, vi } from 'vitest';

import { runCatalogDevelopment } from './development';

describe('runCatalogDevelopment', () => {
  it('runs only the explicitly selected catalog target', async () => {
    const createdTaskQueues: string[] = [];

    await runCatalogDevelopment({
      bindings: [
        {
          target: {
            id: 'shared-workflows',
            namespace: 'staging-namespace',
            taskQueue: 'ui-catalog',
            workflowsPath: './shared-workflows.js',
            workflowExports: {},
          },
          examples: [],
          activities: {},
          nexusServices: [],
        },
        {
          target: {
            id: 'local-catalog',
            namespace: 'default',
            taskQueue: 'catalog',
            workflowsPath: './local-workflows.js',
            workflowExports: {},
          },
          examples: [],
          activities: {},
          nexusServices: [],
        },
      ],
      targetId: 'shared-workflows',
      connectionFactory: async () => ({ close: async () => undefined }),
      createWorker: async ({ taskQueue }) => {
        createdTaskQueues.push(taskQueue);
        return { run: async () => undefined, shutdown: () => undefined };
      },
      signals: new EventEmitter(),
    });

    expect(createdTaskQueues).toEqual(['ui-catalog']);
  });

  it('rejects an unknown catalog target before connecting', async () => {
    const connectionFactory = vi.fn(async () => ({
      close: async () => undefined,
    }));

    await expect(
      runCatalogDevelopment({
        bindings: [
          {
            target: {
              id: 'shared-workflows',
              namespace: 'staging-namespace',
              taskQueue: 'ui-catalog',
              workflowsPath: './shared-workflows.js',
              workflowExports: {},
            },
            examples: [],
            activities: {},
            nexusServices: [],
          },
        ],
        targetId: 'missing-target',
        connectionFactory,
        createWorker: vi.fn(),
        signals: new EventEmitter(),
      }),
    ).rejects.toThrowError(
      'Catalog target "missing-target" was not found; available targets: shared-workflows',
    );
    expect(connectionFactory).not.toHaveBeenCalled();
  });

  it('shuts down after workers complete normally so an owned connection closes', async () => {
    const connection = { close: vi.fn(async () => undefined) };
    const shutdown = vi.fn();

    await runCatalogDevelopment({
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
      runCatalogDevelopment({
        bindings: [],
        connectionFactory: emptyConnectionFactory,
        createWorker: vi.fn(),
        signals: new EventEmitter(),
      }),
    ).rejects.toThrowError(
      'Catalog has no runnable targets; register an example before starting the development runner',
    );
    expect(emptyConnectionFactory).not.toHaveBeenCalled();

    const signals = new EventEmitter();
    const connection = { close: vi.fn(async () => undefined) };
    let settleRun: (() => void) | undefined;
    const shutdown = vi.fn(() => settleRun?.());
    const running = runCatalogDevelopment({
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
