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

export type CatalogTableGroup = {
  kind: BrowserCatalogExecution['kind'];
  heading: string;
  label: string;
  nameHeader: string;
  locationHeader: string;
  location: (descriptor: BrowserCatalogDescriptor) => string;
  descriptors: BrowserCatalogDescriptor[];
};

const taskQueue = ({ execution }: BrowserCatalogDescriptor) =>
  execution.taskQueue;

const tableDefinitions: Omit<CatalogTableGroup, 'descriptors'>[] = [
  {
    kind: 'workflow',
    heading: 'Workflows',
    label: 'Workflow examples',
    nameHeader: 'Workflow',
    locationHeader: 'Task queue',
    location: taskQueue,
  },
  {
    kind: 'standalone-activity',
    heading: 'Standalone Activities',
    label: 'Standalone Activity examples',
    nameHeader: 'Activity',
    locationHeader: 'Task queue',
    location: taskQueue,
  },
  {
    kind: 'standalone-nexus-operation',
    heading: 'Standalone Nexus Operations',
    label: 'Standalone Nexus Operation examples',
    nameHeader: 'Nexus Operation',
    locationHeader: 'Endpoint',
    location: ({ execution }) =>
      execution.kind === 'standalone-nexus-operation'
        ? execution.endpoint
        : execution.taskQueue,
  },
];

export const catalogTableGroups = (
  descriptors: readonly BrowserCatalogDescriptor[],
): CatalogTableGroup[] => {
  const groups = tableDefinitions
    .map((definition) => ({
      ...definition,
      descriptors: descriptors.filter(
        ({ execution }) => execution.kind === definition.kind,
      ),
    }))
    .filter((group) => group.descriptors.length > 0);

  return groups.length ? groups : [{ ...tableDefinitions[0], descriptors: [] }];
};
