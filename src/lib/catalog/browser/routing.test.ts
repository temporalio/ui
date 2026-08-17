import { describe, expect, it } from 'vitest';

import { resolveCatalogRouting } from './routing';

describe('resolveCatalogRouting', () => {
  it('returns routed target copies without changing registered routing', () => {
    const registeredTargets = [
      {
        targetId: 'shared-workflows',
        namespace: 'registered-namespace',
        taskQueue: 'registered-task-queue',
      },
    ];

    const resolvedTargets = resolveCatalogRouting(registeredTargets, {
      'shared-workflows': {
        namespace: 'runtime-namespace',
        taskQueue: 'runtime-task-queue',
      },
    });

    expect(resolvedTargets).toEqual([
      {
        targetId: 'shared-workflows',
        namespace: 'runtime-namespace',
        taskQueue: 'runtime-task-queue',
      },
    ]);
    expect(registeredTargets).toEqual([
      {
        targetId: 'shared-workflows',
        namespace: 'registered-namespace',
        taskQueue: 'registered-task-queue',
      },
    ]);
  });

  it('rejects routing for a target that is not registered', () => {
    expect(() =>
      resolveCatalogRouting(
        [
          {
            targetId: 'shared-workflows',
            namespace: 'registered-namespace',
            taskQueue: 'registered-task-queue',
          },
        ],
        {
          missing: {
            namespace: 'runtime-namespace',
            taskQueue: 'runtime-task-queue',
          },
        },
      ),
    ).toThrowError('Unknown catalog routing target "missing"');
  });

  it('copies only non-secret routing fields into resolved targets', () => {
    const resolved = resolveCatalogRouting(
      [
        {
          targetId: 'shared-workflows',
          namespace: 'registered-namespace',
          taskQueue: 'registered-task-queue',
        },
      ],
      {
        'shared-workflows': {
          namespace: 'runtime-namespace',
          taskQueue: 'runtime-task-queue',
          apiKey: 'secret',
          address: 'private.example:7233',
        },
      } as never,
    );

    expect(resolved).toEqual([
      {
        targetId: 'shared-workflows',
        namespace: 'runtime-namespace',
        taskQueue: 'runtime-task-queue',
      },
    ]);
  });
});
