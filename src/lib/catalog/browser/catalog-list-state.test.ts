import { describe, expect, it } from 'vitest';

import {
  capabilityTagLabel,
  catalogFacets,
  type CatalogFilters,
  catalogKind,
  emptyCatalogFilters,
} from './catalog-list-state';
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
  capabilityTags: string[] = [],
  source = { id: 'oss', label: 'OSS' },
): BrowserCatalogDescriptor => ({
  id,
  source,
  title: id,
  description: '',
  capabilityTags,
  expectedEvidence: [],
  input: { defaultValue: [], schema: {} },
  startOptions: { defaultValue: {}, schema: {} },
  execution,
});

const workflow = descriptor(
  'workflow',
  { ...target, kind: 'workflow', workflowType: 'Workflow' },
  ['activities', 'retries'],
);
const localWorkflow = descriptor(
  'local-workflow',
  { ...target, kind: 'workflow', workflowType: 'LocalWorkflow' },
  ['signals'],
  { id: 'local', label: 'Local' },
);
const activity = descriptor(
  'activity',
  {
    ...target,
    kind: 'standalone-activity',
    activityType: 'activity',
    timeouts: {},
    policies: {},
  },
  ['activities', 'standalone'],
);
const nexusOperation = descriptor(
  'nexus-operation',
  {
    ...target,
    kind: 'standalone-nexus-operation',
    endpoint: 'catalog-endpoint',
    service: 'service',
    operation: 'operation',
    policies: {},
  },
  ['nexus', 'standalone', 'retries'],
);

const all = [workflow, localWorkflow, activity, nexusOperation];
const sources = [
  { id: 'oss', label: 'OSS' },
  { id: 'local', label: 'Local' },
];
const facets = (filters: Partial<CatalogFilters>) =>
  catalogFacets(all, sources, { ...emptyCatalogFilters, ...filters });
const counts = (options: { id: string; count: number }[]) =>
  Object.fromEntries(options.map(({ id, count }) => [id, count]));
const ids = (descriptors: BrowserCatalogDescriptor[]) =>
  descriptors.map(({ id }) => id);

describe('catalogFacets', () => {
  it('returns every example and full counts without filters', () => {
    const result = facets({});

    expect(ids(result.descriptors)).toEqual(ids(all));
    expect(counts(result.kinds)).toEqual({
      all: 4,
      workflow: 2,
      'standalone-activity': 1,
      'standalone-nexus-operation': 1,
    });
    expect(counts(result.sources)).toEqual({ all: 4, oss: 3, local: 1 });
  });

  it('orders features by count, then by label', () => {
    expect(facets({}).features.map(({ id, count }) => [id, count])).toEqual([
      ['activities', 2],
      ['retries', 2],
      ['standalone', 2],
      ['nexus', 1],
      ['signals', 1],
    ]);
  });

  it('combines the kind, feature, and source filters', () => {
    expect(ids(facets({ kind: 'workflow' }).descriptors)).toEqual([
      'workflow',
      'local-workflow',
    ]);
    expect(ids(facets({ tag: 'retries' }).descriptors)).toEqual([
      'workflow',
      'nexus-operation',
    ]);
    expect(
      ids(facets({ kind: 'workflow', tag: 'retries' }).descriptors),
    ).toEqual(['workflow']);
    expect(ids(facets({ source: 'local' }).descriptors)).toEqual([
      'local-workflow',
    ]);
  });

  it("ignores a facet's own selection when it counts that facet", () => {
    const result = facets({ kind: 'workflow', tag: 'retries' });

    expect(counts(result.kinds)).toEqual({
      all: 2,
      workflow: 1,
      'standalone-activity': 0,
      'standalone-nexus-operation': 1,
    });
    expect(counts(result.features)).toEqual({
      activities: 1,
      retries: 1,
      signals: 1,
    });
    expect(counts(result.sources)).toEqual({ all: 1, oss: 1, local: 0 });
  });

  it('keeps the selected feature visible when nothing else matches it', () => {
    const result = facets({ tag: 'signals', source: 'oss' });

    expect(result.descriptors).toEqual([]);
    expect(counts(result.features)).toMatchObject({ signals: 0 });
  });

  it('applies search before it counts', () => {
    const result = facets({ query: '  NEXUS ' });

    expect(ids(result.descriptors)).toEqual(['nexus-operation']);
    expect(counts(result.kinds)).toMatchObject({ all: 1, workflow: 0 });
  });
});

describe('catalogKind', () => {
  it('labels Nexus operations by endpoint and other kinds by task queue', () => {
    expect(
      [workflow, activity, nexusOperation].map((d) => {
        const { locationHeader, location } = catalogKind(d.execution.kind);
        return [locationHeader, location(d)];
      }),
    ).toEqual([
      ['Task queue', 'catalog-tasks'],
      ['Task queue', 'catalog-tasks'],
      ['Endpoint', 'catalog-endpoint'],
    ]);
  });
});

describe('capabilityTagLabel', () => {
  it('turns a tag slug into a sentence-case label', () => {
    expect(capabilityTagLabel('child-workflows')).toBe('Child workflows');
    expect(capabilityTagLabel('Workflow')).toBe('Workflow');
  });
});
