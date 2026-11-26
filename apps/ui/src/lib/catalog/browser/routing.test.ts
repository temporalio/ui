import { describe, expect, it } from 'vitest';

import { resolveCatalogRouting } from './routing';

describe('resolveCatalogRouting', () => {
  it('returns routed workspace copies without changing registered routing', () => {
    const registeredWorkspaces = [
      {
        workspaceId: 'shared-workflows',
        namespace: 'registered-namespace',
        taskQueue: 'registered-task-queue',
      },
    ];

    const resolvedWorkspaces = resolveCatalogRouting(registeredWorkspaces, {
      'shared-workflows': {
        namespace: 'runtime-namespace',
        taskQueue: 'runtime-task-queue',
      },
    });

    expect(resolvedWorkspaces).toEqual([
      {
        workspaceId: 'shared-workflows',
        namespace: 'runtime-namespace',
        taskQueue: 'runtime-task-queue',
      },
    ]);
    expect(registeredWorkspaces).toEqual([
      {
        workspaceId: 'shared-workflows',
        namespace: 'registered-namespace',
        taskQueue: 'registered-task-queue',
      },
    ]);
  });

  it('rejects routing for a workspace that is not registered', () => {
    expect(() =>
      resolveCatalogRouting(
        [
          {
            workspaceId: 'shared-workflows',
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
    ).toThrowError('Unknown catalog routing workspace "missing"');
  });

  it('copies only non-secret routing fields into resolved workspaces', () => {
    const resolved = resolveCatalogRouting(
      [
        {
          workspaceId: 'shared-workflows',
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
        workspaceId: 'shared-workflows',
        namespace: 'runtime-namespace',
        taskQueue: 'runtime-task-queue',
      },
    ]);
  });
});
