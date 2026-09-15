import { describe, expect, it } from 'vitest';

import type {
  CatalogScheduleDeclaration,
  CatalogWorkerBinding,
} from './registry';
import { declaredSchedules } from './schedule-declarations';
import type { JsonValue } from '../browser/types';

const binding = (
  namespace: string,
  taskQueue: string,
  examples: CatalogWorkerBinding['examples'],
): CatalogWorkerBinding => ({
  target: {
    id: 'shared',
    namespace,
    taskQueue,
    workflowsPath: './workflows',
    workflowExports: {},
  },
  examples,
  activities: {},
  nexusServices: [],
});

const workflowExample = (
  id: string,
  schedule?: CatalogScheduleDeclaration,
  inputDefault: JsonValue = ['Temporal'],
): CatalogWorkerBinding['examples'][number] => ({
  id,
  execution: {
    kind: 'workflow',
    workflowType: `${id}Workflow`,
    workflow: () => undefined,
    activities: {},
    ...(schedule ? { schedule } : {}),
  },
  inputDefault,
});

describe('declaredSchedules', () => {
  it('returns nothing when no example declares a schedule', () => {
    expect(
      declaredSchedules([
        binding('default', 'ui-catalog', [workflowExample('hello')]),
      ]),
    ).toEqual([]);
  });

  it('resolves a declared schedule against its target routing and input default', () => {
    expect(
      declaredSchedules([
        binding('default', 'ui-catalog', [
          workflowExample('hello', {
            id: 'ui-catalog-hello-hourly',
            spec: { cronExpressions: ['0 * * * *'] },
            paused: false,
            note: 'Declared by the hello catalog example',
          }),
        ]),
      ]),
    ).toEqual([
      {
        id: 'ui-catalog-hello-hourly',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'helloWorkflow',
        exampleId: 'hello',
        spec: { cronExpressions: ['0 * * * *'] },
        args: ['Temporal'],
        paused: false,
        note: 'Declared by the hello catalog example',
      },
    ]);
  });

  it('prefers the declared schedule input over the example input default', () => {
    const [schedule] = declaredSchedules([
      binding('default', 'ui-catalog', [
        workflowExample('hello', {
          id: 'hello-hourly',
          spec: { intervals: [{ every: '1h', offset: '5m' }] },
          input: ['Scheduled'],
          paused: true,
        }),
      ]),
    ]);

    expect(schedule).toEqual({
      id: 'hello-hourly',
      namespace: 'default',
      taskQueue: 'ui-catalog',
      workflowType: 'helloWorkflow',
      exampleId: 'hello',
      spec: { intervals: [{ every: '1h', offset: '5m' }] },
      args: ['Scheduled'],
      paused: true,
    });
    expect(Object.hasOwn(schedule, 'note')).toBe(false);
  });

  it('falls back to no arguments when the example input default is not an array', () => {
    expect(
      declaredSchedules([
        binding('default', 'ui-catalog', [
          workflowExample(
            'hello',
            {
              id: 'hello-hourly',
              spec: { cronExpressions: ['0 * * * *'] },
              paused: false,
            },
            { name: 'Temporal' },
          ),
        ]),
      ])[0].args,
    ).toEqual([]);
  });

  it('collects schedules across every binding and skips other execution kinds', () => {
    const schedules = declaredSchedules([
      binding('default', 'ui-catalog', [
        workflowExample('hello', {
          id: 'hello-hourly',
          spec: { cronExpressions: ['0 * * * *'] },
          paused: false,
        }),
        {
          id: 'standalone',
          execution: {
            kind: 'standalone-activity',
            activityType: 'greet',
            activity: () => undefined,
            timeouts: {},
            policies: {},
          },
          inputDefault: [],
        },
      ]),
      binding('staging', 'ui-catalog-staging', [
        workflowExample('other', {
          id: 'other-hourly',
          spec: { cronExpressions: ['30 * * * *'] },
          paused: false,
        }),
      ]),
    ]);

    expect(schedules.map(({ id, namespace }) => [id, namespace])).toEqual([
      ['hello-hourly', 'default'],
      ['other-hourly', 'staging'],
    ]);
  });
});
