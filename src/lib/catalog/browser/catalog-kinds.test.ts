import { describe, expect, it } from 'vitest';

import {
  catalogKinds,
  isCatalogKind,
  orderedCatalogKinds,
} from './catalog-kinds';
import {
  activityExecution,
  nexusOperationExecution,
  testDescriptor,
  workflowExecution,
} from './catalog-test-descriptors';

describe('catalogKinds', () => {
  it('lists workflows first, then standalone activities and Nexus operations', () => {
    expect(orderedCatalogKinds.map(({ kind }) => kind)).toEqual([
      'workflow',
      'standalone-activity',
      'standalone-nexus-operation',
    ]);
  });

  it('labels Nexus operations by endpoint and other kinds by task queue', () => {
    const locations = [
      workflowExecution(),
      activityExecution,
      nexusOperationExecution,
    ].map((execution) => {
      const descriptor = testDescriptor(execution.kind, execution);
      const { locationLabel, location } = catalogKinds[execution.kind];
      return [locationLabel, location(descriptor)];
    });

    expect(locations).toEqual([
      ['Task Queue', 'catalog-tasks'],
      ['Task Queue', 'catalog-tasks'],
      ['Nexus Endpoint', 'catalog-endpoint'],
    ]);
  });
});

describe('isCatalogKind', () => {
  it('accepts only registered kinds', () => {
    expect(isCatalogKind('workflow')).toBe(true);
    expect(isCatalogKind('standalone-nexus-operation')).toBe(true);
    expect(isCatalogKind('toString')).toBe(false);
    expect(isCatalogKind(null)).toBe(false);
  });
});
