import type {
  BrowserCatalogDescriptor,
  BrowserCatalogExecution,
} from './types';

export type CatalogExecutionKind = BrowserCatalogExecution['kind'];

export interface CatalogKindDefinition {
  kind: CatalogExecutionKind;
  label: string;
  locationLabel: string;
  location: (descriptor: BrowserCatalogDescriptor) => string;
  glyphClass: string;
  badgeClass: string;
}

const taskQueue = ({ execution }: BrowserCatalogDescriptor) =>
  execution.taskQueue;

const nexusEndpoint = ({ execution }: BrowserCatalogDescriptor) => {
  if (execution.kind !== 'standalone-nexus-operation') {
    return execution.taskQueue;
  }

  return execution.endpoint;
};

export const catalogKinds: Readonly<
  Record<CatalogExecutionKind, CatalogKindDefinition>
> = {
  workflow: {
    kind: 'workflow',
    label: 'Workflow',
    locationLabel: 'Task Queue',
    location: taskQueue,
    glyphClass: 'rounded-sm bg-action-workflow',
    badgeClass: 'bg-action-workflow-overlay',
  },
  'standalone-activity': {
    kind: 'standalone-activity',
    label: 'Standalone Activity',
    locationLabel: 'Task Queue',
    location: taskQueue,
    glyphClass: 'rounded-full bg-action-activity',
    badgeClass: 'bg-action-activity-overlay',
  },
  'standalone-nexus-operation': {
    kind: 'standalone-nexus-operation',
    label: 'Standalone Nexus Operation',
    locationLabel: 'Endpoint',
    location: nexusEndpoint,
    glyphClass: 'rotate-45 scale-[0.82] rounded-[1px] bg-action-nexus',
    badgeClass: 'bg-action-nexus-overlay',
  },
};

export const orderedCatalogKinds: readonly CatalogKindDefinition[] =
  Object.values(catalogKinds);

export const isCatalogKind = (
  value: string | null,
): value is CatalogExecutionKind =>
  value !== null && Object.hasOwn(catalogKinds, value);
