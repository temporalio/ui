import { catalogKinds, orderedCatalogKinds } from './catalog-kinds';
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

export const catalogFilterTitles: Readonly<Record<CatalogFilterKey, string>> = {
  kind: 'Execution kind',
  feature: 'Feature',
  source: 'Source',
};

export interface CatalogFilters {
  query: string;
  kind: string | null;
  feature: string | null;
  source: string | null;
}

export const emptyCatalogFilters: CatalogFilters = {
  query: '',
  kind: null,
  feature: null,
  source: null,
};

export const toggleCatalogFilter = (
  filters: CatalogFilters,
  key: CatalogFilterKey,
  value: string | null,
): CatalogFilters => ({
  ...filters,
  [key]: filters[key] === value ? null : value,
});

export const clearCatalogFilter = (
  filters: CatalogFilters,
  key: CatalogFilterKey,
): CatalogFilters => ({ ...filters, [key]: null });

export const clearCatalogFilters = (
  filters: CatalogFilters,
): CatalogFilters => ({
  ...emptyCatalogFilters,
  query: filters.query,
});

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

const facetValues: Readonly<
  Record<CatalogFilterKey, (descriptor: BrowserCatalogDescriptor) => string[]>
> = {
  kind: ({ execution }) => [execution.kind],
  feature: ({ capabilityTags }) => [...new Set(capabilityTags)],
  source: ({ source }) => [source.id],
};

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
    return facetValues[key](descriptor).includes(selected);
  });

const countValues = (
  descriptors: readonly BrowserCatalogDescriptor[],
  key: CatalogFilterKey,
) => {
  const counts = new Map<string, number>();
  for (const value of descriptors.flatMap(facetValues[key])) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
};

const featureOptions = (
  counts: ReadonlyMap<string, number>,
  selected: string | null,
) => {
  const ids = selected && !counts.has(selected) ? [selected] : [];

  return [...counts.keys(), ...ids]
    .map((id) => ({ id, label: featureLabel(id), count: counts.get(id) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
};

const allOption = (label: string, count: number): CatalogFacetOption => ({
  id: null,
  label,
  count,
});

export const catalogFacets = (
  descriptors: readonly BrowserCatalogDescriptor[],
  sources: readonly BrowserCatalogSource[],
  filters: CatalogFilters,
): CatalogFacets => {
  const query = filters.query.trim().toLocaleLowerCase();
  const searched = descriptors.filter((descriptor) =>
    matchesQuery(descriptor, query),
  );
  const candidatesFor = (key: CatalogFilterKey) =>
    searched.filter((descriptor) => matchesFacets(descriptor, filters, key));

  const kindCandidates = candidatesFor('kind');
  const kindCounts = countValues(kindCandidates, 'kind');
  const featureCounts = countValues(candidatesFor('feature'), 'feature');
  const sourceCandidates = candidatesFor('source');
  const sourceCounts = countValues(sourceCandidates, 'source');

  return {
    options: {
      kind: [
        allOption('All kinds', kindCandidates.length),
        ...orderedCatalogKinds.map(({ kind, label }) => ({
          id: kind,
          label,
          count: kindCounts.get(kind) ?? 0,
        })),
      ],
      feature: featureOptions(featureCounts, filters.feature),
      source: [
        allOption('All sources', sourceCandidates.length),
        ...sources.map(({ id, label }) => ({
          id,
          label,
          count: sourceCounts.get(id) ?? 0,
        })),
      ],
    },
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
