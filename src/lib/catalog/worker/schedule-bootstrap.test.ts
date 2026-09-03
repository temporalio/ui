import { describe, expect, it, vi } from 'vitest';

import type {
  CatalogScheduleDeclaration,
  CatalogWorkerBinding,
} from './registry';
import {
  bootstrapCatalogScheduleSync,
  type CatalogScheduleBootstrapEvent,
} from './schedule-bootstrap';
import type { CatalogDesiredSchedule } from './schedule-declarations';

const workflowExample = (
  id: string,
  workflowType: string,
  schedule?: CatalogScheduleDeclaration,
): CatalogWorkerBinding['examples'][number] => ({
  id,
  execution: {
    kind: 'workflow',
    workflowType,
    workflow: () => undefined,
    activities: {},
    ...(schedule ? { schedule } : {}),
  },
  inputDefault: ['Temporal'],
});

const bindings = (
  examples: CatalogWorkerBinding['examples'],
): CatalogWorkerBinding[] => [
  {
    target: {
      id: 'shared-workflows',
      namespace: 'default',
      taskQueue: 'ui-catalog',
      workflowsPath: './workflows',
      workflowExports: {},
    },
    examples,
    activities: {},
    nexusServices: [],
  },
];

const syncExamples = () => [
  workflowExample('hello', 'hello', {
    id: 'ui-catalog-hello-hourly',
    spec: { cronExpressions: ['0 * * * *'] },
    paused: false,
  }),
  workflowExample('schedule-sync', 'catalogScheduleSync'),
];

const bootstrap = async ({
  examples = syncExamples(),
  exists = false,
  paused = false,
  triggerManager = vi.fn(async () => undefined),
  createManager = vi.fn(async () => undefined),
  updateManagerArgs = vi.fn(async () => undefined),
}: {
  examples?: CatalogWorkerBinding['examples'];
  exists?: boolean;
  paused?: boolean;
  triggerManager?: (entry: CatalogDesiredSchedule) => Promise<void>;
  createManager?: (entry: CatalogDesiredSchedule) => Promise<void>;
  updateManagerArgs?: (entry: CatalogDesiredSchedule) => Promise<void>;
} = {}) => {
  const events: CatalogScheduleBootstrapEvent[] = [];

  await bootstrapCatalogScheduleSync({
    bindings: bindings(examples),
    describeManager: async () => ({ exists, paused }),
    createManager,
    updateManagerArgs,
    triggerManager,
    onEvent: (event) => events.push(event),
  });

  return { events, createManager, updateManagerArgs, triggerManager };
};

describe('bootstrapCatalogScheduleSync', () => {
  it('creates the manager schedule when the server does not have it', async () => {
    const createManager = vi.fn(async () => undefined);
    const { events, triggerManager } = await bootstrap({ createManager });

    expect(createManager).toHaveBeenCalledWith({
      id: 'ui-catalog-schedule-sync',
      namespace: 'default',
      taskQueue: 'ui-catalog',
      workflowType: 'catalogScheduleSync',
      exampleId: 'schedule-sync',
      spec: { cronExpressions: ['0 * * * *'] },
      args: [
        [
          {
            id: 'ui-catalog-hello-hourly',
            namespace: 'default',
            taskQueue: 'ui-catalog',
            workflowType: 'hello',
            exampleId: 'hello',
            spec: { cronExpressions: ['0 * * * *'] },
            args: ['Temporal'],
            paused: false,
          },
        ],
      ],
      paused: false,
    });
    expect(triggerManager).toHaveBeenCalledTimes(1);
    expect(events.map(({ state }) => state)).toEqual(['created', 'triggered']);
    expect(events[0]).toMatchObject({
      scheduleId: 'ui-catalog-schedule-sync',
      namespace: 'default',
      taskQueue: 'ui-catalog',
      declaredCount: 1,
    });
  });

  it('updates the manager arguments when the schedule already exists', async () => {
    const updateManagerArgs = vi.fn(async () => undefined);
    const { events, createManager } = await bootstrap({
      exists: true,
      updateManagerArgs,
    });

    expect(createManager).not.toHaveBeenCalled();
    expect(updateManagerArgs).toHaveBeenCalledTimes(1);
    expect(events.map(({ state }) => state)).toEqual(['updated', 'triggered']);
  });

  it('reports a trigger failure as blocked without throwing', async () => {
    const { events } = await bootstrap({
      triggerManager: vi.fn(async () => {
        throw new Error('permission denied');
      }),
    });

    expect(events.map(({ state }) => state)).toEqual(['created', 'blocked']);
    expect(events[1].error).toBeInstanceOf(Error);
  });

  it('reports a create failure as blocked and never triggers', async () => {
    const triggerManager = vi.fn(async () => undefined);
    const { events } = await bootstrap({
      createManager: vi.fn(async () => {
        throw new Error('permission denied');
      }),
      triggerManager,
    });

    expect(events.map(({ state }) => state)).toEqual(['blocked']);
    expect(triggerManager).not.toHaveBeenCalled();
  });

  it('skips when no target registers the schedule-sync example', async () => {
    const triggerManager = vi.fn(async () => undefined);
    const { events } = await bootstrap({
      examples: [workflowExample('hello', 'hello')],
      triggerManager,
    });

    expect(events).toEqual([
      {
        state: 'skipped',
        scheduleId: 'ui-catalog-schedule-sync',
        reason:
          'The "schedule-sync" example is not registered as a workflow on any target',
      },
    ]);
    expect(triggerManager).not.toHaveBeenCalled();
  });
});

describe('bootstrapCatalogScheduleSync and a paused manager', () => {
  it('writes nothing and triggers nothing when the manager is paused by hand', async () => {
    const { events, createManager, updateManagerArgs, triggerManager } =
      await bootstrap({ exists: true, paused: true });

    expect(createManager).not.toHaveBeenCalled();
    expect(updateManagerArgs).not.toHaveBeenCalled();
    expect(triggerManager).not.toHaveBeenCalled();
    expect(events).toEqual([
      expect.objectContaining({
        state: 'held',
        scheduleId: 'ui-catalog-schedule-sync',
        reason: 'paused by hand; resume it to reconcile again',
      }),
    ]);
  });

  it('reconciles again once the manager is resumed', async () => {
    const { events, updateManagerArgs, triggerManager } = await bootstrap({
      exists: true,
      paused: false,
    });

    expect(updateManagerArgs).toHaveBeenCalledTimes(1);
    expect(triggerManager).toHaveBeenCalledTimes(1);
    expect(events.map(({ state }) => state)).toEqual(['updated', 'triggered']);
  });
});
