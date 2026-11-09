import { describe, expect, it } from 'vitest';

import {
  activeCatalogFilters,
  type CatalogFacetOption,
  catalogFacets,
  type CatalogFilters,
  catalogFiltersFromSearchParams,
  catalogFiltersUrl,
  catalogFilterTitle,
  changePendingRunCount,
  clearCatalogFilters,
  drawerFilterKeys,
  emptyCatalogFilters,
  toggleCatalogFilter,
} from './catalog-list-state';
import {
  activityExecution,
  nexusOperationExecution,
  testDescriptor,
  workflowExecution,
} from './catalog-test-descriptors';
import type { BrowserCatalogDescriptor } from './types';

const workflow = testDescriptor(
  'workflow',
  workflowExecution(),
  ['activities', 'retries'],
  undefined,
  ['batch-processing'],
);
const localWorkflow = testDescriptor(
  'local-workflow',
  workflowExecution('LocalWorkflow'),
  ['signals'],
  { id: 'local', label: 'Local' },
);
const activity = testDescriptor('activity', activityExecution, [
  'activities',
  'standalone',
]);
const nexusOperation = testDescriptor(
  'nexus-operation',
  nexusOperationExecution,
  ['nexus', 'standalone', 'retries'],
);

const all = [workflow, localWorkflow, activity, nexusOperation];
const sources = [
  { id: 'oss', label: 'OSS' },
  { id: 'local', label: 'Local' },
];
const facets = (filters: Partial<CatalogFilters>) =>
  catalogFacets(all, sources, { ...emptyCatalogFilters, ...filters });
const counts = (options: CatalogFacetOption[]) =>
  Object.fromEntries(options.map(({ id, count }) => [id ?? 'all', count]));
const ids = (descriptors: BrowserCatalogDescriptor[]) =>
  descriptors.map(({ id }) => id);

describe('catalogFacets', () => {
  it('returns every example and full counts without filters', () => {
    const { options, descriptors } = facets({});

    expect(ids(descriptors)).toEqual(ids(all));
    expect(counts(options.kind)).toEqual({
      all: 4,
      workflow: 2,
      'standalone-activity': 1,
      'standalone-nexus-operation': 1,
    });
    expect(counts(options.source)).toEqual({ all: 4, oss: 3, local: 1 });
  });

  it('orders features by count, then by label', () => {
    expect(
      facets({}).options.feature.map(({ id, label, count }) => [
        id,
        label,
        count,
      ]),
    ).toEqual([
      ['activities', 'Activities', 2],
      ['retries', 'Retries', 2],
      ['standalone', 'Standalone', 2],
      ['nexus', 'Nexus', 1],
      ['signals', 'Signals', 1],
    ]);
  });

  it('offers each pattern tag with its count', () => {
    expect(
      facets({}).options.pattern.map(({ id, label, count }) => [
        id,
        label,
        count,
      ]),
    ).toEqual([['batch-processing', 'Batch Processing', 1]]);
  });

  it('filters by pattern and narrows the other facet counts', () => {
    const { options, descriptors } = facets({ pattern: 'batch-processing' });

    expect(ids(descriptors)).toEqual(['workflow']);
    expect(counts(options.source)).toEqual({ all: 1, oss: 1, local: 0 });
    expect(counts(options.pattern)).toEqual({ 'batch-processing': 1 });
  });

  it('searches pattern labels', () => {
    expect(ids(facets({ query: 'batch' }).descriptors)).toEqual(['workflow']);
  });

  it('combines the kind, feature, and source filters', () => {
    expect(ids(facets({ kind: 'workflow' }).descriptors)).toEqual([
      'workflow',
      'local-workflow',
    ]);
    expect(ids(facets({ feature: 'retries' }).descriptors)).toEqual([
      'workflow',
      'nexus-operation',
    ]);
    expect(
      ids(facets({ kind: 'workflow', feature: 'retries' }).descriptors),
    ).toEqual(['workflow']);
    expect(ids(facets({ source: 'local' }).descriptors)).toEqual([
      'local-workflow',
    ]);
  });

  it("ignores a facet's own selection when it counts that facet", () => {
    const { options } = facets({ kind: 'workflow', feature: 'retries' });

    expect(counts(options.kind)).toEqual({
      all: 2,
      workflow: 1,
      'standalone-activity': 0,
      'standalone-nexus-operation': 1,
    });
    expect(counts(options.feature)).toEqual({
      activities: 1,
      retries: 1,
      signals: 1,
    });
    expect(counts(options.source)).toEqual({ all: 1, oss: 1, local: 0 });
  });

  it('keeps the selected feature visible when nothing else matches it', () => {
    const { options, descriptors } = facets({
      feature: 'signals',
      source: 'oss',
    });

    expect(descriptors).toEqual([]);
    expect(counts(options.feature)).toMatchObject({ signals: 0 });
  });

  it('searches titles, kind labels, and feature labels before it counts', () => {
    const byKind = facets({ query: '  STANDALONE ACTIVITY ' });
    expect(ids(byKind.descriptors)).toEqual(['activity']);
    expect(counts(byKind.options.kind)).toMatchObject({ all: 1, workflow: 0 });

    expect(ids(facets({ query: 'nexus' }).descriptors)).toEqual([
      'nexus-operation',
    ]);
  });
});

describe('catalog filter changes', () => {
  it('selects a value, and clears it when the same value is chosen again', () => {
    const selected = toggleCatalogFilter(
      emptyCatalogFilters,
      'kind',
      'workflow',
    );

    expect(selected.kind).toBe('workflow');
    expect(toggleCatalogFilter(selected, 'kind', 'workflow').kind).toBeNull();
    expect(toggleCatalogFilter(selected, 'kind', null).kind).toBeNull();
  });

  it('rejects an execution kind that is not registered', () => {
    expect(() =>
      toggleCatalogFilter(emptyCatalogFilters, 'kind', 'schedule'),
    ).toThrow('Unknown catalog execution kind "schedule"');
  });

  it('clears the given filters, or all filters, and keeps the search query', () => {
    const filters: CatalogFilters = {
      query: 'retry',
      kind: 'workflow',
      feature: 'retries',
      pattern: 'batch-processing',
      source: 'oss',
    };

    expect(clearCatalogFilters(filters, ['feature'])).toEqual({
      ...filters,
      feature: null,
    });
    expect(clearCatalogFilters(filters, drawerFilterKeys)).toEqual({
      ...filters,
      feature: null,
      pattern: null,
      source: null,
    });
    expect(clearCatalogFilters(filters)).toEqual({
      ...emptyCatalogFilters,
      query: 'retry',
    });
  });
});

describe('catalog filter URLs', () => {
  const base = new URL('https://ui.test/namespaces/default/catalog?tab=all');

  it('writes each filter to its own search parameter and keeps others', () => {
    const url = catalogFiltersUrl(base, {
      query: 'nexus op',
      kind: 'standalone-nexus-operation',
      feature: 'retries',
      pattern: 'batch-processing',
      source: null,
    });

    expect(url.searchParams.get('tab')).toBe('all');
    expect(url.searchParams.get('q')).toBe('nexus op');
    expect(url.searchParams.get('kind')).toBe('standalone-nexus-operation');
    expect(url.searchParams.get('feature')).toBe('retries');
    expect(url.searchParams.get('pattern')).toBe('batch-processing');
    expect(url.searchParams.has('source')).toBe(false);
    expect(catalogFiltersFromSearchParams(url.searchParams)).toEqual({
      query: 'nexus op',
      kind: 'standalone-nexus-operation',
      feature: 'retries',
      pattern: 'batch-processing',
      source: null,
    });
  });

  it('removes cleared filters from the URL', () => {
    const filtered = catalogFiltersUrl(base, {
      ...emptyCatalogFilters,
      kind: 'workflow',
    });

    expect(catalogFiltersUrl(filtered, emptyCatalogFilters).search).toBe(
      '?tab=all',
    );
  });

  it('ignores an unknown execution kind in the URL', () => {
    expect(
      catalogFiltersFromSearchParams(new URLSearchParams('kind=schedule&q=')),
    ).toEqual(emptyCatalogFilters);
  });
});

describe('activeCatalogFilters', () => {
  it('labels each selected filter from its facet option, in facet order', () => {
    const filters: CatalogFilters = {
      ...emptyCatalogFilters,
      source: 'local',
      kind: 'standalone-nexus-operation',
      feature: 'child-workflows',
      pattern: 'batch-processing',
    };

    expect(activeCatalogFilters(facets(filters), filters)).toEqual([
      { key: 'kind', label: 'Standalone Nexus Operation' },
      { key: 'feature', label: 'Child Workflows' },
      { key: 'pattern', label: 'Batch Processing' },
      { key: 'source', label: 'Local' },
    ]);
  });

  it('returns nothing without filters', () => {
    expect(activeCatalogFilters(facets({}), emptyCatalogFilters)).toEqual([]);
  });
});

describe('changePendingRunCount', () => {
  it('tracks overlapping runs per example and drops finished examples', () => {
    const first = changePendingRunCount({}, 'shared-order', 1);
    const overlapping = changePendingRunCount(
      changePendingRunCount(first, 'shared-order', 1),
      'local-order',
      1,
    );

    expect(changePendingRunCount(overlapping, 'shared-order', -1)).toEqual({
      'shared-order': 1,
      'local-order': 1,
    });
    expect(changePendingRunCount(first, 'shared-order', -1)).toEqual({});
    expect(changePendingRunCount({}, 'missing', -1)).toEqual({});
  });
});

describe('catalogFilterTitle', () => {
  it('names each facet with Temporal terms', () => {
    expect(catalogFilterTitle('kind')).toBe('Execution');
    expect(catalogFilterTitle('feature')).toBe('Feature');
    expect(catalogFilterTitle('pattern')).toBe('Pattern');
    expect(catalogFilterTitle('source')).toBe('Source');
  });
});
