import { describe, expect, it, vi } from 'vitest';

import type { BrowserWorkflowCatalogDescriptor } from '$lib/workflow-catalog/browser/types';

import {
  findRouteWorkflowDescriptor,
  mergeWorkflowCatalogDescriptors,
  resolveWorkflowCatalogForNamespace,
  routeWorkflowCatalog,
} from './catalog';

const { localDescriptor } = vi.hoisted<{
  localDescriptor: BrowserWorkflowCatalogDescriptor;
}>(() => ({
  localDescriptor: {
    id: 'local-order',
    source: { id: 'local', label: 'Local' },
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
    expect(routeWorkflowCatalog).toContainEqual(
      expect.objectContaining({
        id: localDescriptor.id,
        source: { id: 'local', label: 'Local' },
      }),
    );
  });

  it('keeps the local overlay execution exactly as registered', () => {
    expect(
      routeWorkflowCatalog.find(({ id }) => id === localDescriptor.id)
        ?.execution,
    ).toMatchObject({
      targetId: 'local-worker',
      namespace: 'default',
      taskQueue: 'local-orders',
    });
  });

  it('merges shared descriptors before local descriptors deterministically', () => {
    const sharedDescriptor = {
      ...localDescriptor,
      id: 'shared-order',
      source: { id: 'oss', label: 'OSS' },
    };

    expect(
      mergeWorkflowCatalogDescriptors([sharedDescriptor], [localDescriptor]),
    ).toEqual([sharedDescriptor, localDescriptor]);
  });

  it('rejects duplicate stable IDs instead of shadowing a descriptor', () => {
    const sharedDescriptor = {
      ...localDescriptor,
      source: { id: 'oss', label: 'OSS' },
    };

    expect(() =>
      mergeWorkflowCatalogDescriptors([sharedDescriptor], [localDescriptor]),
    ).toThrow('Duplicate workflow catalog descriptor ID "local-order"');
  });

  it('rejects conflicting labels for the same source ID', () => {
    const cloudDescriptor = {
      ...localDescriptor,
      id: 'cloud-order',
      source: { id: 'cloud', label: 'Cloud' },
    };
    const renamedCloudDescriptor = {
      ...cloudDescriptor,
      id: 'cloud-order-renamed',
      source: { id: 'cloud', label: 'Temporal Cloud' },
    };

    expect(() =>
      mergeWorkflowCatalogDescriptors(
        [cloudDescriptor],
        [renamedCloudDescriptor],
      ),
    ).toThrow(
      'Workflow catalog source "cloud" has conflicting labels "Cloud" and "Temporal Cloud"',
    );
  });

  it.each([
    [{ id: '', label: 'Cloud' }, 'a non-empty id'],
    [{ id: 'all', label: 'All' }, 'the reserved id "all"'],
    [{ id: 'cloud', label: '' }, 'a non-empty label'],
  ])('rejects a source without %s', (source, expectedMessage) => {
    const descriptor = {
      ...localDescriptor,
      id: 'invalid-source',
      source,
    };

    expect(() => mergeWorkflowCatalogDescriptors([descriptor], [])).toThrow(
      expectedMessage,
    );
  });

  it('retargets every catalog example to the requested namespace', () => {
    const resolved = resolveWorkflowCatalogForNamespace('feature-namespace');

    expect(resolved).toHaveLength(routeWorkflowCatalog.length);
    for (const descriptor of resolved) {
      expect(descriptor.execution.namespace).toBe('feature-namespace');
    }
  });

  it('keeps registered task queues when retargeting namespaces', () => {
    const resolved = resolveWorkflowCatalogForNamespace('feature-namespace');

    expect(
      resolved.find(({ id }) => id === localDescriptor.id)?.execution,
    ).toMatchObject({
      targetId: 'local-worker',
      namespace: 'feature-namespace',
      taskQueue: 'local-orders',
    });
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
