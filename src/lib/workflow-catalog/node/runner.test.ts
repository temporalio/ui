import { fileURLToPath } from 'node:url';

import { operation, service, serviceHandler } from 'nexus-rpc';
import { describe, expect, it, vi } from 'vitest';

import {
  createWorkflowCatalogRegistry,
  generateWorkflowCatalog,
} from './registry';
import { startWorkflowCatalogRunner } from './runner';

const createNexusHandler = (name: string) => {
  const definition = service(name, {
    'catalog-operation': operation<string, string>(),
  });

  return serviceHandler(definition, {
    'catalog-operation': async (_context, input) => input,
  });
};

const createActivityBindings = (...targetIds: string[]) => {
  const registry = createWorkflowCatalogRegistry();

  for (const id of targetIds) {
    registry.registerTarget({
      id,
      namespace: `${id}-namespace`,
      taskQueue: `${id}-queue`,
      workflowsPath: `./${id}-workflows.js`,
      workflowExports: {},
    });
    registry.registerExample({
      id: `${id}-example`,
      title: `${id} example`,
      description: `${id} example.`,
      targetId: id,
      capabilityTags: [],
      expectedEvidence: [`${id} result`],
      input: { defaultValue: {}, schema: {} },
      startOptions: { defaultValue: {}, schema: {} },
      execution: {
        kind: 'standalone-activity',
        activityType: `${id}Activity`,
        activity: () => id,
        timeouts: {},
        policies: {},
      },
    });
  }

  return generateWorkflowCatalog(registry).nodeBindings;
};

describe('workflow catalog runner', () => {
  it('constructs one worker from a generated target binding', async () => {
    const registry = createWorkflowCatalogRegistry();
    const activity = () => 'activity';
    const nexusService = createNexusHandler('catalog-service');
    const connection = { close: vi.fn(async () => undefined) };
    const run = vi.fn(async () => undefined);
    const shutdown = vi.fn();
    const createWorker = vi.fn(async () => ({ run, shutdown }));
    registry.registerTarget({
      id: 'catalog-target',
      namespace: 'catalog-namespace',
      taskQueue: 'catalog-task-queue',
      workflowsPath: './catalog-workflows.js',
      workflowExports: {},
    });
    registry.registerExample({
      id: 'activity-example',
      title: 'Activity example',
      description: 'Runs an activity.',
      targetId: 'catalog-target',
      capabilityTags: [],
      expectedEvidence: ['Activity result'],
      input: { defaultValue: {}, schema: {} },
      startOptions: { defaultValue: {}, schema: {} },
      execution: {
        kind: 'standalone-activity',
        activityType: 'catalogActivity',
        activity,
        timeouts: {},
        policies: {},
      },
    });
    registry.registerExample({
      id: 'nexus-example',
      title: 'Nexus example',
      description: 'Runs a Nexus operation.',
      targetId: 'catalog-target',
      capabilityTags: [],
      expectedEvidence: ['Nexus result'],
      input: { defaultValue: {}, schema: {} },
      startOptions: { defaultValue: {}, schema: {} },
      execution: {
        kind: 'standalone-nexus-operation',
        endpoint: 'catalog-endpoint',
        service: 'catalog-service',
        operation: 'catalog-operation',
        handler: nexusService,
        policies: {},
      },
    });
    const { nodeBindings } = generateWorkflowCatalog(registry);

    const runner = await startWorkflowCatalogRunner({
      bindings: nodeBindings,
      connection,
      createWorker,
    });
    await runner.completion;

    expect(createWorker).toHaveBeenCalledWith(
      expect.objectContaining({
        connection,
        namespace: 'catalog-namespace',
        taskQueue: 'catalog-task-queue',
        workflowsPath: expect.stringMatching(/\/catalog-workflows\.js$/),
        activities: { catalogActivity: activity },
        nexusServices: [nexusService],
      }),
    );
    expect(run).toHaveBeenCalledOnce();
    expect(connection.close).not.toHaveBeenCalled();
  });

  it('decodes a URL-encoded workflow path before creating a worker', async () => {
    const workflowsPath = './catalog%20workflows.js';
    const connection = { close: vi.fn(async () => undefined) };
    const createWorker = vi.fn(async () => ({
      run: async () => undefined,
      shutdown: vi.fn(),
    }));
    const bindings = createActivityBindings('catalog').map((binding) => ({
      ...binding,
      target: { ...binding.target, workflowsPath },
    }));

    const runner = await startWorkflowCatalogRunner({
      bindings,
      connection,
      createWorker,
    });
    await runner.completion;

    expect(createWorker).toHaveBeenCalledWith(
      expect.objectContaining({
        workflowsPath: fileURLToPath(new URL(workflowsPath, import.meta.url)),
      }),
    );
  });

  it('constructs every target worker before any worker begins running', async () => {
    const registry = createWorkflowCatalogRegistry();
    const events: string[] = [];
    const connection = { close: vi.fn(async () => undefined) };

    for (const id of ['first', 'second']) {
      const activity = () => id;
      registry.registerTarget({
        id,
        namespace: `${id}-namespace`,
        taskQueue: `${id}-queue`,
        workflowsPath: `./${id}-workflows.js`,
        workflowExports: {},
      });
      registry.registerExample({
        id: `${id}-example`,
        title: `${id} example`,
        description: `Runs the ${id} activity.`,
        targetId: id,
        capabilityTags: [],
        expectedEvidence: [`${id} result`],
        input: { defaultValue: {}, schema: {} },
        startOptions: { defaultValue: {}, schema: {} },
        execution: {
          kind: 'standalone-activity',
          activityType: `${id}Activity`,
          activity,
          timeouts: {},
          policies: {},
        },
      });
    }

    const runner = await startWorkflowCatalogRunner({
      bindings: generateWorkflowCatalog(registry).nodeBindings,
      connection,
      createWorker: async ({ taskQueue }) => {
        events.push(`create:${taskQueue}`);
        return {
          run: async () => {
            events.push(`run:${taskQueue}`);
          },
          shutdown: vi.fn(),
        };
      },
    });
    await runner.completion;

    expect(events).toEqual([
      'create:first-queue',
      'create:second-queue',
      'run:first-queue',
      'run:second-queue',
    ]);
  });

  it('shuts down every worker, drains runs, and closes only an explicitly owned connection', async () => {
    const registry = createWorkflowCatalogRegistry();
    const events: string[] = [];
    const connection = {
      close: vi.fn(async () => {
        events.push('close');
      }),
    };

    for (const id of ['first', 'second']) {
      registry.registerTarget({
        id,
        namespace: `${id}-namespace`,
        taskQueue: `${id}-queue`,
        workflowsPath: `./${id}-workflows.js`,
        workflowExports: {},
      });
      registry.registerExample({
        id: `${id}-example`,
        title: `${id} example`,
        description: `${id} example.`,
        targetId: id,
        capabilityTags: [],
        expectedEvidence: [`${id} result`],
        input: { defaultValue: {}, schema: {} },
        startOptions: { defaultValue: {}, schema: {} },
        execution: {
          kind: 'standalone-activity',
          activityType: `${id}Activity`,
          activity: () => id,
          timeouts: {},
          policies: {},
        },
      });
    }

    const runner = await startWorkflowCatalogRunner({
      bindings: generateWorkflowCatalog(registry).nodeBindings,
      connection,
      ownsConnection: true,
      createWorker: async ({ taskQueue }) => {
        let settleRun: (() => void) | undefined;
        return {
          run: () =>
            new Promise<void>((resolve) => {
              settleRun = () => {
                events.push(`settled:${taskQueue}`);
                resolve();
              };
            }),
          shutdown: () => {
            events.push(`shutdown:${taskQueue}`);
            settleRun?.();
          },
        };
      },
    });

    await runner.shutdown();

    expect(events).toEqual([
      'shutdown:first-queue',
      'settled:first-queue',
      'shutdown:second-queue',
      'settled:second-queue',
      'close',
    ]);
  });

  it('preserves a creation failure without shutting down a worker that never ran', async () => {
    const creationError = new Error('second worker creation failed');
    const shutdownError = new Error('worker shutdown is invalid before run');
    const creationEvents: string[] = [];
    const creationConnection = {
      close: vi.fn(async () => {
        creationEvents.push('close');
      }),
    };

    await expect(
      startWorkflowCatalogRunner({
        bindings: createActivityBindings('first', 'second'),
        connection: creationConnection,
        ownsConnection: true,
        createWorker: async ({ taskQueue }) => {
          if (taskQueue === 'second-queue') throw creationError;
          return {
            run: async () => undefined,
            shutdown: () => {
              creationEvents.push('shutdown:first-queue');
              throw shutdownError;
            },
          };
        },
      }),
    ).rejects.toBe(creationError);
    expect(creationEvents).toEqual(['close']);
  });

  it('cleans up run failures while preserving the original error', async () => {
    const runError = new Error('first worker run failed');
    const runEvents: string[] = [];
    const runConnection = {
      close: vi.fn(async () => {
        runEvents.push('close');
      }),
    };
    const runner = await startWorkflowCatalogRunner({
      bindings: createActivityBindings('first', 'second'),
      connection: runConnection,
      ownsConnection: true,
      createWorker: async ({ taskQueue }) => ({
        run: async () => {
          if (taskQueue === 'first-queue') throw runError;
        },
        shutdown: () => runEvents.push(`shutdown:${taskQueue}`),
      }),
    });

    await expect(runner.completion).rejects.toBe(runError);
    expect(runEvents).toEqual([
      'shutdown:first-queue',
      'shutdown:second-queue',
      'close',
    ]);
  });

  it('emits a structured, secret-free event when a target worker run fails', async () => {
    const runError = new Error('worker run failed');
    const events: unknown[] = [];
    const connection = {
      address: 'temporal.internal.example:7233',
      apiKey: 'TEMPORAL_API_KEY=super-secret',
      tls: {
        certificate: '-----BEGIN CERTIFICATE-----',
        privateKey: '-----BEGIN PRIVATE KEY-----',
      },
      close: async () => undefined,
    };

    const runner = await startWorkflowCatalogRunner({
      bindings: createActivityBindings('catalog'),
      connection,
      createWorker: async () => ({
        run: async () => {
          throw runError;
        },
        shutdown: vi.fn(),
      }),
      events: (event) => events.push(event),
    });

    await expect(runner.completion).rejects.toBe(runError);

    expect(events).toContainEqual({
      type: 'target-failed',
      targetId: 'catalog',
      phase: 'run',
    });
    expect(JSON.stringify(events)).not.toContain(connection.address);
    expect(JSON.stringify(events)).not.toContain(connection.apiKey);
    expect(JSON.stringify(events)).not.toContain(connection.tls.certificate);
    expect(JSON.stringify(events)).not.toContain(connection.tls.privateKey);
  });

  it('shuts down only workers whose runs started after a run startup failure', async () => {
    const runError = new Error('first worker run failed to start');
    const events: string[] = [];
    const connection = {
      close: vi.fn(async () => {
        events.push('close');
      }),
    };

    await expect(
      startWorkflowCatalogRunner({
        bindings: createActivityBindings('first', 'second'),
        connection,
        ownsConnection: true,
        createWorker: async ({ taskQueue }) => ({
          run: () => {
            events.push(`run:${taskQueue}`);
            if (taskQueue === 'first-queue') throw runError;
            return Promise.resolve();
          },
          shutdown: () => events.push(`shutdown:${taskQueue}`),
        }),
      }),
    ).rejects.toBe(runError);

    expect(events).toEqual([
      'run:first-queue',
      'shutdown:first-queue',
      'close',
    ]);
  });

  it('continues cleanup after a shutdown failure without masking a run failure', async () => {
    const runError = new Error('first worker run failed');
    const shutdownError = new Error('first worker shutdown failed');
    const events: string[] = [];
    const connection = {
      close: vi.fn(async () => {
        events.push('close');
      }),
    };
    let settleSecondRun: (() => void) | undefined;

    const runner = await startWorkflowCatalogRunner({
      bindings: createActivityBindings('first', 'second'),
      connection,
      ownsConnection: true,
      createWorker: async ({ taskQueue }) => ({
        run: () => {
          if (taskQueue === 'first-queue') return Promise.reject(runError);
          return new Promise<void>((resolve) => {
            settleSecondRun = resolve;
          });
        },
        shutdown: () => {
          events.push(`shutdown:${taskQueue}`);
          if (taskQueue === 'first-queue') throw shutdownError;
          settleSecondRun?.();
        },
      }),
    });

    await expect(runner.completion).rejects.toBe(runError);
    expect(events).toEqual([
      'shutdown:first-queue',
      'shutdown:second-queue',
      'close',
    ]);
  });

  it('emits structured, secret-free connection and target lifecycle events', async () => {
    const events: unknown[] = [];
    let settleRun: (() => void) | undefined;

    const runner = await startWorkflowCatalogRunner({
      bindings: createActivityBindings('catalog'),
      connectionFactory: async () => ({ close: async () => undefined }),
      createWorker: async () => ({
        run: () =>
          new Promise<void>((resolve) => {
            settleRun = resolve;
          }),
        shutdown: () => settleRun?.(),
      }),
      events: (event) => events.push(event),
    });
    await runner.shutdown();

    expect(events).toEqual([
      { type: 'connection-acquired', mode: 'owned' },
      { targetId: 'catalog', type: 'target-creating' },
      { targetId: 'catalog', type: 'target-created' },
      { targetId: 'catalog', type: 'target-running' },
      { targetId: 'catalog', type: 'target-stopped' },
    ]);
    expect(JSON.stringify(events)).not.toContain('TEMPORAL_API_KEY');
    expect(JSON.stringify(events)).not.toContain('certificate');
    expect(JSON.stringify(events)).not.toContain('temporal.example');
  });

  it('creates one owned connection and shares it across every target worker', async () => {
    const connection = { close: vi.fn(async () => undefined) };
    const connectionFactory = vi.fn(async () => connection);
    const workerConnections: unknown[] = [];

    const runner = await startWorkflowCatalogRunner({
      bindings: createActivityBindings('first', 'second'),
      connectionFactory,
      createWorker: async (options) => {
        workerConnections.push(options.connection);
        return { run: async () => undefined, shutdown: vi.fn() };
      },
    });
    await runner.completion;
    await runner.shutdown();

    expect(connectionFactory).toHaveBeenCalledOnce();
    expect(workerConnections).toEqual([connection, connection]);
    expect(connection.close).toHaveBeenCalledOnce();
  });

  it('rejects an empty catalog before creating an owned connection', async () => {
    const connectionFactory = vi.fn(async () => ({
      close: vi.fn(async () => undefined),
    }));

    await expect(
      startWorkflowCatalogRunner({
        bindings: [],
        connectionFactory,
        createWorker: vi.fn(),
      }),
    ).rejects.toThrowError('Workflow catalog has no runnable targets');

    expect(connectionFactory).not.toHaveBeenCalled();
  });
});
