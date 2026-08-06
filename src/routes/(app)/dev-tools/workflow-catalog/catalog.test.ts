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
}));

describe('workflow catalog route catalog', () => {
  it('provides the local overlay to the exact app route catalog', () => {
    expect(routeWorkflowCatalog).toContainEqual(localDescriptor);
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
