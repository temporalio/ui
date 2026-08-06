import { describe, expect, it, vi } from 'vitest';

import type { BrowserWorkflowCatalogDescriptor } from '$lib/workflow-catalog/browser/types';

import {
  findRouteWorkflowDescriptor,
  mergeWorkflowCatalogDescriptors,
  routeWorkflowCatalog,
} from './catalog';

const { localDescriptor } = vi.hoisted<{
  localDescriptor: BrowserWorkflowCatalogDescriptor;
}>(() => ({
  localDescriptor: {
    id: 'local-order',
    source: 'local',
    title: 'Local order',
    description: 'Runs a local order workflow.',
    capabilityTags: [],
    expectedEvidence: [],
    input: { defaultValue: [], schema: {} },
    startOptions: { defaultValue: {}, schema: {} },
    execution: {
      kind: 'workflow',
      targetId: 'local-worker',
      namespace: 'default',
      taskQueue: 'local-orders',
      workflowType: 'localOrder',
    },
  },
}));

vi.mock('virtual:workflow-catalog-local', () => ({
  localWorkflowCatalog: [localDescriptor],
  workflowCatalogRouting: {
    'local-worker': {
      namespace: 'runtime-namespace',
      taskQueue: 'runtime-task-queue',
    },
  },
}));

describe('workflow catalog route catalog', () => {
  it('provides the local overlay to the exact app route catalog', () => {
    expect(routeWorkflowCatalog).toContainEqual(
      expect.objectContaining({ id: localDescriptor.id, source: 'local' }),
    );
  });

  it('routes the app catalog with the safe virtual-module overlay', () => {
    expect(
      routeWorkflowCatalog.find(({ id }) => id === localDescriptor.id)
        ?.execution,
    ).toMatchObject({
      targetId: 'local-worker',
      namespace: 'runtime-namespace',
      taskQueue: 'runtime-task-queue',
    });
  });

  it('merges shared descriptors before local descriptors deterministically', () => {
    const sharedDescriptor = {
      ...localDescriptor,
      id: 'shared-order',
      source: 'shared' as const,
    };

    expect(
      mergeWorkflowCatalogDescriptors([sharedDescriptor], [localDescriptor]),
    ).toEqual([sharedDescriptor, localDescriptor]);
  });

  it('applies runtime routing after merging shared and local descriptors', () => {
    const sharedDescriptor = {
      ...localDescriptor,
      id: 'shared-order',
      source: 'shared' as const,
      execution: {
        ...localDescriptor.execution,
        targetId: 'shared-workflows',
        namespace: 'registered-namespace',
        taskQueue: 'registered-task-queue',
      },
    };

    expect(
      mergeWorkflowCatalogDescriptors([sharedDescriptor], [], {
        'shared-workflows': {
          namespace: 'runtime-namespace',
          taskQueue: 'runtime-task-queue',
        },
      })[0]?.execution,
    ).toMatchObject({
      targetId: 'shared-workflows',
      namespace: 'runtime-namespace',
      taskQueue: 'runtime-task-queue',
    });
  });

  it('rejects duplicate stable IDs instead of shadowing a descriptor', () => {
    const sharedDescriptor = {
      ...localDescriptor,
      source: 'shared' as const,
    };

    expect(() =>
      mergeWorkflowCatalogDescriptors([sharedDescriptor], [localDescriptor]),
    ).toThrow('Duplicate workflow catalog descriptor ID "local-order"');
  });

  it('finds a literal percent-escape ID from an already-decoded route parameter', () => {
    const descriptor = { ...localDescriptor, id: 'literal%2Fsequence' };

    expect(
      findRouteWorkflowDescriptor([descriptor], 'literal%2Fsequence'),
    ).toBe(descriptor);
    expect(
      findRouteWorkflowDescriptor([descriptor], 'literal/sequence'),
    ).toBeUndefined();
  });
});
