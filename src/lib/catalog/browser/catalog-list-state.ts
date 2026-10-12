import type {
  BrowserCatalogDescriptor,
  BrowserCatalogExecution,
} from './types';

export type PendingRunCounts = Readonly<Record<string, number>>;

export const changePendingRunCount = (
  counts: PendingRunCounts,
  exampleId: string,
  change: 1 | -1,
): PendingRunCounts => {
  const nextCount = Math.max(0, (counts[exampleId] ?? 0) + change);
  const nextCounts = { ...counts };

  if (nextCount === 0) {
    delete nextCounts[exampleId];
  } else {
    nextCounts[exampleId] = nextCount;
  }

  return nextCounts;
};

export type CatalogExecutionKind = BrowserCatalogExecution['kind'];

export type CatalogKindDefinition = {
  kind: CatalogExecutionKind;
  label: string;
  locationHeader: string;
  location: (descriptor: BrowserCatalogDescriptor) => string;
};

const taskQueue = ({ execution }: BrowserCatalogDescriptor) =>
  execution.taskQueue;

export const catalogKinds: readonly CatalogKindDefinition[] = [
  {
    kind: 'workflow',
    label: 'Workflow',
    locationHeader: 'Task Queue',
    location: taskQueue,
  },
  {
    kind: 'standalone-activity',
    label: 'Standalone Activity',
    locationHeader: 'Task Queue',
    location: taskQueue,
  },
  {
    kind: 'standalone-nexus-operation',
    label: 'Standalone Nexus Operation',
    locationHeader: 'Endpoint',
    location: ({ execution }) =>
      execution.kind === 'standalone-nexus-operation'
        ? execution.endpoint
        : execution.taskQueue,
  },
];

export const catalogKind = (kind: CatalogExecutionKind) =>
  catalogKinds.find((definition) => definition.kind === kind) ??
  catalogKinds[0];

export const capabilityTagLabel = (tag: string) => {
  const words = tag.replaceAll('-', ' ').trim();
  return words.charAt(0).toLocaleUpperCase() + words.slice(1);
};

export type CatalogFilters = {
  query: string;
  kind: 'all' | CatalogExecutionKind;
  tag: string | null;
  source: 'all' | string;
};

export const emptyCatalogFilters: CatalogFilters = {
  query: '',
  kind: 'all',
  tag: null,
  source: 'all',
};

export type CatalogFacetOption<Id extends string = string> = {
  id: Id;
  label: string;
  count: number;
};

export type CatalogFacets = {
  kinds: CatalogFacetOption<'all' | CatalogExecutionKind>[];
  features: CatalogFacetOption[];
  sources: CatalogFacetOption[];
  descriptors: BrowserCatalogDescriptor[];
};

type Facet = 'kind' | 'tag' | 'source';

const matchesQuery = (descriptor: BrowserCatalogDescriptor, query: string) =>
  [
    descriptor.title,
    descriptor.description,
    descriptor.execution.kind,
    ...descriptor.capabilityTags,
  ]
    .join(' ')
    .toLocaleLowerCase()
    .includes(query);

/**
 * Filters the catalog and counts each facet option. A facet's counts ignore
 * that facet's own selection, so every option shows how many examples it
 * would show if chosen.
 */
export const catalogFacets = (
  descriptors: readonly BrowserCatalogDescriptor[],
  sources: readonly { id: string; label: string }[],
  { query, kind, tag, source }: CatalogFilters,
): CatalogFacets => {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const searched = descriptors.filter((descriptor) =>
    matchesQuery(descriptor, normalizedQuery),
  );
  const keep = (descriptor: BrowserCatalogDescriptor, skip?: Facet) =>
    (skip === 'kind' || kind === 'all' || descriptor.execution.kind === kind) &&
    (skip === 'tag' || !tag || descriptor.capabilityTags.includes(tag)) &&
    (skip === 'source' || source === 'all' || descriptor.source.id === source);

  const forKind = searched.filter((descriptor) => keep(descriptor, 'kind'));
  const kinds: CatalogFacets['kinds'] = [
    { id: 'all', label: 'All kinds', count: forKind.length },
    ...catalogKinds.map(({ kind: id, label }) => ({
      id,
      label,
      count: forKind.filter(({ execution }) => execution.kind === id).length,
    })),
  ];

  const tagCounts = new Map<string, number>();
  for (const descriptor of searched.filter((d) => keep(d, 'tag'))) {
    for (const capability of new Set(descriptor.capabilityTags)) {
      tagCounts.set(capability, (tagCounts.get(capability) ?? 0) + 1);
    }
  }
  if (tag && !tagCounts.has(tag)) tagCounts.set(tag, 0);
  const features = [...tagCounts]
    .map(([id, count]) => ({ id, label: capabilityTagLabel(id), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const forSource = searched.filter((descriptor) => keep(descriptor, 'source'));
  const sourceOptions: CatalogFacets['sources'] = [
    { id: 'all', label: 'All sources', count: forSource.length },
    ...sources.map(({ id, label }) => ({
      id,
      label,
      count: forSource.filter((descriptor) => descriptor.source.id === id)
        .length,
    })),
  ];

  return {
    kinds,
    features,
    sources: sourceOptions,
    descriptors: searched.filter((descriptor) => keep(descriptor)),
  };
};
