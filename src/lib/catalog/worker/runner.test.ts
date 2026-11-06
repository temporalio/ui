import * as fs from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { operation, service, serviceHandler } from 'nexus-rpc';
import { describe, expect, it, vi } from 'vitest';

import {
  type CatalogWorkerBinding,
  createCatalogRegistry,
  generateCatalog,
} from './registry';
import { type CatalogWorkerOptions, startCatalogRunner } from './runner';

vi.mock('@temporalio/activity', () => ({
  Context: { current: () => ({ info: { attempt: 1 } }) },
}));

const createNexusHandler = (name: string) => {
  const definition = service(name, {
    'catalog-operation': operation<string, string>(),
  });

  return serviceHandler(definition, {
    'catalog-operation': async (_context, input) => input,
  });
};

const createActivityBindings = (...workspaceIds: string[]) => {
  const registry = createCatalogRegistry();

  for (const id of workspaceIds) {
    registry.registerWorkspace({
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
      workspaceId: id,
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

  return generateCatalog(registry).workerBindings;
};

describe('catalog runner', () => {
  it('constructs one worker from a generated workspace binding', async () => {
    const registry = createCatalogRegistry();
    const activity = () => 'activity';
    const nexusService = createNexusHandler('catalog-service');
    const connection = { close: vi.fn(async () => undefined) };
    const run = vi.fn(async () => undefined);
    const shutdown = vi.fn();
    const createWorker = vi.fn(async () => ({ run, shutdown }));
    registry.registerWorkspace({
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
      workspaceId: 'catalog-target',
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
      workspaceId: 'catalog-target',
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
    const { workerBindings } = generateCatalog(registry);

    const runner = await startCatalogRunner({
      bindings: workerBindings,
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
        activities: {
          catalogActivity: activity,
          dangerousOperation: expect.any(Function),
        },
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
      workspace: { ...binding.workspace, workflowsPath },
    }));

    const runner = await startCatalogRunner({
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

  it('passes a file URL workflow path to a worker as its absolute filesystem path', async () => {
    const workflowsPath = '/tmp/catalog/workflows.ts';
    const connection = { close: vi.fn(async () => undefined) };
    const createWorker = vi.fn(async () => ({
      run: async () => undefined,
      shutdown: vi.fn(),
    }));
    const bindings = createActivityBindings('catalog').map((binding) => ({
      ...binding,
      workspace: {
        ...binding.workspace,
        workflowsPath: pathToFileURL(workflowsPath).href,
      },
    }));

    const runner = await startCatalogRunner({
      bindings,
      connection,
      createWorker,
    });
    await runner.completion;

    expect(createWorker).toHaveBeenCalledWith(
      expect.objectContaining({ workflowsPath }),
    );
  });

  it('uses the source workflows module only when the canonical packaged path is absent', async () => {
    const packagedWorkflowsPath = resolve(
      'src/lib/catalog/worker/workflows.js',
    );
    const sourceWorkflowsPath = resolve('src/lib/catalog/worker/workflows.ts');
    const connection = { close: vi.fn(async () => undefined) };
    const createWorker = vi.fn(async () => ({
      run: async () => undefined,
      shutdown: vi.fn(),
    }));
    const bindings = createActivityBindings('catalog').map((binding) => ({
      ...binding,
      workspace: { ...binding.workspace, workflowsPath: './workflows.js' },
    }));

    expect(fs.existsSync(packagedWorkflowsPath)).toBe(false);
    expect(fs.statSync(sourceWorkflowsPath).isFile()).toBe(true);

    try {
      const sourceRunner = await startCatalogRunner({
        bindings,
        connection,
        createWorker,
      });
      await sourceRunner.completion;

      expect(createWorker).toHaveBeenLastCalledWith(
        expect.objectContaining({ workflowsPath: sourceWorkflowsPath }),
      );

      fs.closeSync(fs.openSync(packagedWorkflowsPath, 'wx'));
      const packagedRunner = await startCatalogRunner({
        bindings,
        connection,
        createWorker,
      });
      await packagedRunner.completion;

      expect(createWorker).toHaveBeenLastCalledWith(
        expect.objectContaining({ workflowsPath: packagedWorkflowsPath }),
      );
    } finally {
      fs.rmSync(packagedWorkflowsPath, { force: true });
    }
  });

  it('constructs every workspace worker before any worker begins running', async () => {
    const registry = createCatalogRegistry();
    const events: string[] = [];
    const connection = { close: vi.fn(async () => undefined) };

    for (const id of ['first', 'second']) {
      const activity = () => id;
      registry.registerWorkspace({
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
        workspaceId: id,
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

    const runner = await startCatalogRunner({
      bindings: generateCatalog(registry).workerBindings,
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
    const registry = createCatalogRegistry();
    const events: string[] = [];
    const connection = {
      close: vi.fn(async () => {
        events.push('close');
      }),
    };

    for (const id of ['first', 'second']) {
      registry.registerWorkspace({
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
        workspaceId: id,
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

    const runner = await startCatalogRunner({
      bindings: generateCatalog(registry).workerBindings,
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
      startCatalogRunner({
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
    const runner = await startCatalogRunner({
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

  it('emits a structured, secret-free event when a workspace worker run fails', async () => {
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

    const runner = await startCatalogRunner({
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
      type: 'workspace-failed',
      workspaceId: 'catalog',
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
      startCatalogRunner({
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

    const runner = await startCatalogRunner({
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

  it('emits structured, secret-free connection and workspace lifecycle events', async () => {
    const events: unknown[] = [];
    let settleRun: (() => void) | undefined;

    const runner = await startCatalogRunner({
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
      { workspaceId: 'catalog', type: 'workspace-creating' },
      { workspaceId: 'catalog', type: 'workspace-created' },
      { workspaceId: 'catalog', type: 'workspace-running' },
      { workspaceId: 'catalog', type: 'workspace-stopped' },
    ]);
    expect(JSON.stringify(events)).not.toContain('TEMPORAL_API_KEY');
    expect(JSON.stringify(events)).not.toContain('certificate');
    expect(JSON.stringify(events)).not.toContain('temporal.example');
  });

  it('creates one owned connection and shares it across every workspace worker', async () => {
    const connection = { close: vi.fn(async () => undefined) };
    const connectionFactory = vi.fn(async () => connection);
    const workerConnections: unknown[] = [];

    const runner = await startCatalogRunner({
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

  describe('worker crash', () => {
    const crashBindings = () =>
      createActivityBindings('demo').map((binding) => ({
        ...binding,
        workspace: { ...binding.workspace, controls: ['crash' as const] },
      }));
    const startWithCrash = async (
      bindings: CatalogWorkerBinding[],
      controls: 'crash'[],
    ) => {
      const exit = vi.fn();
      const createWorker = vi.fn(async (_options: CatalogWorkerOptions) => ({
        run: async () => undefined,
        shutdown: vi.fn(),
      }));
      const runner = await startCatalogRunner({
        bindings,
        connection: { close: vi.fn(async () => undefined) },
        createWorker,
        controls,
        exit,
      });
      await runner.completion;
      const activities = createWorker.mock.calls[0][0].activities as {
        dangerousOperation: () => Promise<string>;
      };

      return { activities, exit };
    };

    it('lets a workspace that declares crash exit the process when the runtime provides it', async () => {
      const { activities, exit } = await startWithCrash(crashBindings(), [
        'crash',
      ]);

      await activities.dangerousOperation();

      expect(exit).toHaveBeenCalledWith(75);
    });

    it('shortens the sticky queue timeout so a restarted Worker picks up the run quickly', async () => {
      const createWorker = vi.fn(async (_options: CatalogWorkerOptions) => ({
        run: async () => undefined,
        shutdown: vi.fn(),
      }));

      for (const controls of [['crash' as const], []]) {
        const runner = await startCatalogRunner({
          bindings: crashBindings(),
          connection: { close: vi.fn(async () => undefined) },
          createWorker,
          controls,
        });
        await runner.completion;
      }

      expect(createWorker.mock.calls[0][0]).toMatchObject({
        stickyQueueScheduleToStartTimeout: '1s',
      });
      expect(createWorker.mock.calls[1][0]).not.toHaveProperty(
        'stickyQueueScheduleToStartTimeout',
      );
    });

    it('refuses to crash when the runtime does not provide the control', async () => {
      const { activities, exit } = await startWithCrash(crashBindings(), []);

      await expect(activities.dangerousOperation()).rejects.toMatchObject({
        type: 'CatalogCrashDisabled',
      });
      expect(exit).not.toHaveBeenCalled();
    });

    it('refuses to crash a workspace that does not declare the control', async () => {
      const { activities, exit } = await startWithCrash(
        createActivityBindings('demo'),
        ['crash'],
      );

      await expect(activities.dangerousOperation()).rejects.toMatchObject({
        type: 'CatalogCrashDisabled',
      });
      expect(exit).not.toHaveBeenCalled();
    });

    it('rejects a workspace activity that uses the reserved crash name', async () => {
      const bindings = createActivityBindings('demo').map((binding) => ({
        ...binding,
        activities: { ...binding.activities, dangerousOperation: () => 'mine' },
      }));

      await expect(
        startCatalogRunner({
          bindings,
          connection: { close: vi.fn(async () => undefined) },
          createWorker: vi.fn(async () => ({
            run: async () => undefined,
            shutdown: vi.fn(),
          })),
        }),
      ).rejects.toThrow(
        'Catalog workspace "demo" registers the reserved activity "dangerousOperation"',
      );
    });
  });

  it('rejects an empty catalog before creating an owned connection', async () => {
    const connectionFactory = vi.fn(async () => ({
      close: vi.fn(async () => undefined),
    }));

    await expect(
      startCatalogRunner({
        bindings: [],
        connectionFactory,
        createWorker: vi.fn(),
      }),
    ).rejects.toThrowError('Catalog has no runnable workspaces');

    expect(connectionFactory).not.toHaveBeenCalled();
  });
});
