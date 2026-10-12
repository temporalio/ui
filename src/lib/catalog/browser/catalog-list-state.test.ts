import { describe, expect, it } from 'vitest';

import { catalogTableGroups } from './catalog-list-state';
import type {
  BrowserCatalogDescriptor,
  BrowserCatalogExecution,
} from './types';

const target = {
  targetId: 'catalog',
  namespace: 'default',
  taskQueue: 'catalog-tasks',
};

const descriptor = (
  id: string,
  execution: BrowserCatalogExecution,
): BrowserCatalogDescriptor => ({
  id,
  source: { id: 'oss', label: 'OSS' },
  title: id,
  description: '',
  capabilityTags: [],
  expectedEvidence: [],
  input: { defaultValue: [], schema: {} },
  startOptions: { defaultValue: {}, schema: {} },
  execution,
});

const workflow = descriptor('workflow', {
  ...target,
  kind: 'workflow',
  workflowType: 'Workflow',
});
const activity = descriptor('activity', {
  ...target,
  kind: 'standalone-activity',
  activityType: 'activity',
  timeouts: {},
  policies: {},
});
const nexusOperation = descriptor('nexus-operation', {
  ...target,
  kind: 'standalone-nexus-operation',
  endpoint: 'catalog-endpoint',
  service: 'service',
  operation: 'operation',
  policies: {},
});

describe('catalogTableGroups', () => {
  it('groups examples by execution kind with workflows first', () => {
    const groups = catalogTableGroups([nexusOperation, activity, workflow]);

    expect(groups.map(({ kind, descriptors }) => [kind, descriptors])).toEqual([
      ['workflow', [workflow]],
      ['standalone-activity', [activity]],
      ['standalone-nexus-operation', [nexusOperation]],
    ]);
  });

  it('omits kinds without matching examples', () => {
    const groups = catalogTableGroups([nexusOperation]);

    expect(groups.map(({ kind }) => kind)).toEqual([
      'standalone-nexus-operation',
    ]);
  });

  it('keeps an empty workflow group when nothing matches', () => {
    const groups = catalogTableGroups([]);

    expect(groups.map(({ kind, descriptors }) => [kind, descriptors])).toEqual([
      ['workflow', []],
    ]);
  });

  it('labels Nexus operations by endpoint and other kinds by task queue', () => {
    const groups = catalogTableGroups([workflow, activity, nexusOperation]);

    expect(
      groups.map(({ locationHeader, location, descriptors }) => [
        locationHeader,
        descriptors.map(location),
      ]),
    ).toEqual([
      ['Task queue', ['catalog-tasks']],
      ['Task queue', ['catalog-tasks']],
      ['Endpoint', ['catalog-endpoint']],
    ]);
  });
});
