import {
  type CatalogExecutionKind,
  catalogKinds,
  isCatalogKind,
  orderedCatalogKinds,
} from './catalog-kinds';
import type { BrowserCatalogDescriptor, BrowserCatalogSource } from './types';

export type PendingRunCounts = Readonly<Record<string, number>>;

export const changePendingRunCount = (
  counts: PendingRunCounts,
  exampleId: string,
  change: 1 | -1,
): PendingRunCounts => {
  const nextCount = Math.max(0, (counts[exampleId] ?? 0) + change);

  if (nextCount > 0) return { ...counts, [exampleId]: nextCount };

  const { [exampleId]: _removed, ...remaining } = counts;
  return remaining;
};

export const featureLabel = (feature: string): string => {
  const words = feature.replaceAll('-', ' ').trim();
  return words.charAt(0).toLocaleUpperCase() + words.slice(1);
};

export type CatalogFilterKey = 'kind' | 'feature' | 'source';

export const catalogFilterKeys: readonly CatalogFilterKey[] = [
  'kind',
  'feature',
  'source',
];

export const drawerFilterKeys: readonly CatalogFilterKey[] = [
  'feature',
  'source',
];

export interface CatalogFilters {
  query: string;
  kind: CatalogExecutionKind | null;
  feature: string | null;
  source: string | null;
}

export const emptyCatalogFilters: CatalogFilters = {
  query: '',
  kind: null,
  feature: null,
  source: null,
};

const parseKind = (value: string | null): CatalogExecutionKind | null => {
  if (value === null || isCatalogKind(value)) return value;
  throw new Error(`Unknown catalog execution kind "${value}"`);
};

const withFilterValue = (
  filters: CatalogFilters,
  key: CatalogFilterKey,
  value: string | null,
): CatalogFilters => {
  if (key === 'kind') return { ...filters, kind: parseKind(value) };
  return { ...filters, [key]: value };
};

export const toggleCatalogFilter = (
  filters: CatalogFilters,
  key: CatalogFilterKey,
  value: string | null,
): CatalogFilters =>
  withFilterValue(filters, key, filters[key] === value ? null : value);

export const clearCatalogFilters = (
  filters: CatalogFilters,
  keys: readonly CatalogFilterKey[] = catalogFilterKeys,
): CatalogFilters =>
  keys.reduce((next, key) => withFilterValue(next, key, null), filters);

export interface CatalogFacetOption {
  id: string | null;
  label: string;
  count: number;
}

export interface CatalogFacets {
  options: Readonly<Record<CatalogFilterKey, CatalogFacetOption[]>>;
  descriptors: BrowserCatalogDescriptor[];
}

export interface ActiveCatalogFilter {
  key: CatalogFilterKey;
  label: string;
}

interface FacetOptionContext {
  candidates: readonly BrowserCatalogDescriptor[];
  counts: ReadonlyMap<string, number>;
  sources: readonly BrowserCatalogSource[];
  selected: string | null;
}

interface FacetDefinition {
  title: string;
  values: (descriptor: BrowserCatalogDescriptor) => string[];
  options: (context: FacetOptionContext) => CatalogFacetOption[];
}

const allOption = (label: string, count: number): CatalogFacetOption => ({
  id: null,
  label,
  count,
});

const byCountThenLabel = (a: CatalogFacetOption, b: CatalogFacetOption) =>
  b.count - a.count || a.label.localeCompare(b.label);

const facetDefinitions: Readonly<Record<CatalogFilterKey, FacetDefinition>> = {
  kind: {
    title: 'Execution kind',
    values: ({ execution }) => [execution.kind],
    options: ({ candidates, counts }) => [
      allOption('All kinds', candidates.length),
      ...orderedCatalogKinds.map(({ kind, label }) => ({
        id: kind,
        label,
        count: counts.get(kind) ?? 0,
      })),
    ],
  },
  feature: {
    title: 'Feature',
    values: ({ capabilityTags }) => [...new Set(capabilityTags)],
    options: ({ counts, selected }) =>
      [...new Set([...counts.keys(), ...(selected ? [selected] : [])])]
        .map((id) => ({
          id,
          label: featureLabel(id),
          count: counts.get(id) ?? 0,
        }))
        .sort(byCountThenLabel),
  },
  source: {
    title: 'Source',
    values: ({ source }) => [source.id],
    options: ({ candidates, counts, sources }) => [
      allOption('All sources', candidates.length),
      ...sources.map(({ id, label }) => ({
        id,
        label,
        count: counts.get(id) ?? 0,
      })),
    ],
  },
};

export const catalogFilterTitle = (key: CatalogFilterKey): string =>
  facetDefinitions[key].title;

const mapFilterKeys = <Value>(
  build: (key: CatalogFilterKey) => Value,
): Record<CatalogFilterKey, Value> => ({
  kind: build('kind'),
  feature: build('feature'),
  source: build('source'),
});

const matchesQuery = (descriptor: BrowserCatalogDescriptor, query: string) => {
  if (!query) return true;

  return [
    descriptor.title,
    descriptor.description,
    descriptor.execution.kind,
    catalogKinds[descriptor.execution.kind].label,
    ...descriptor.capabilityTags.map(featureLabel),
  ]
    .join(' ')
    .toLocaleLowerCase()
    .includes(query);
};

const matchesFacets = (
  descriptor: BrowserCatalogDescriptor,
  filters: CatalogFilters,
  ignoredKey?: CatalogFilterKey,
) =>
  catalogFilterKeys.every((key) => {
    const selected = filters[key];
    if (key === ignoredKey || selected === null) return true;
    return facetDefinitions[key].values(descriptor).includes(selected);
  });

const countValues = (
  descriptors: readonly BrowserCatalogDescriptor[],
  values: FacetDefinition['values'],
) => {
  const counts = new Map<string, number>();
  for (const value of descriptors.flatMap(values)) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
};

export const catalogFacets = (
  descriptors: readonly BrowserCatalogDescriptor[],
  sources: readonly BrowserCatalogSource[],
  filters: CatalogFilters,
): CatalogFacets => {
  const query = filters.query.trim().toLocaleLowerCase();
  const searched = descriptors.filter((descriptor) =>
    matchesQuery(descriptor, query),
  );

  const options = mapFilterKeys((key) => {
    const { values, options: buildOptions } = facetDefinitions[key];
    const candidates = searched.filter((descriptor) =>
      matchesFacets(descriptor, filters, key),
    );

    return buildOptions({
      candidates,
      counts: countValues(candidates, values),
      sources,
      selected: filters[key],
    });
  });

  return {
    options,
    descriptors: searched.filter((descriptor) =>
      matchesFacets(descriptor, filters),
    ),
  };
};

export const activeCatalogFilters = (
  facets: CatalogFacets,
  filters: CatalogFilters,
): ActiveCatalogFilter[] =>
  catalogFilterKeys.flatMap((key) => {
    const selected = filters[key];
    if (selected === null) return [];

    const option = facets.options[key].find(({ id }) => id === selected);
    return [{ key, label: option?.label ?? selected }];
  });

const searchParamNames: readonly [keyof CatalogFilters, string][] = [
  ['query', 'q'],
  ['kind', 'kind'],
  ['feature', 'feature'],
  ['source', 'source'],
];

export const catalogFiltersFromSearchParams = (
  params: URLSearchParams,
): CatalogFilters => {
  const kind = params.get('kind');

  return {
    query: params.get('q') ?? '',
    kind: isCatalogKind(kind) ? kind : null,
    feature: params.get('feature') || null,
    source: params.get('source') || null,
  };
};

export const catalogFiltersUrl = (url: URL, filters: CatalogFilters): URL => {
  const next = new URL(url);

  for (const [field, name] of searchParamNames) {
    next.searchParams.delete(name);
    const value = filters[field];
    if (value) next.searchParams.set(name, value);
  }

  return next;
};
