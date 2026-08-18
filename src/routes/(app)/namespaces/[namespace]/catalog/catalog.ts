import { localCatalog } from 'virtual:catalog-local';

import { catalog } from '$lib/catalog/browser/catalog';
import { catalogSources } from '$lib/catalog/browser/catalog-sources';
import {
  type CatalogRouting,
  resolveCatalogRouting,
} from '$lib/catalog/browser/routing';
import type { BrowserCatalogDescriptor } from '$lib/catalog/browser/types';

type CatalogLocalRefreshPayload = {
  descriptors: BrowserCatalogDescriptor[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isJsonValue = (value: unknown): boolean =>
  value === null ||
  typeof value === 'boolean' ||
  typeof value === 'number' ||
  typeof value === 'string' ||
  (Array.isArray(value) && value.every(isJsonValue)) ||
  (isRecord(value) && Object.values(value).every(isJsonValue));

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const isRuntimeJsonDocument = (value: unknown): boolean =>
  isRecord(value) &&
  isJsonValue(value.defaultValue) &&
  (typeof value.schema === 'boolean' || isRecord(value.schema)) &&
  isJsonValue(value.schema);

const isExecution = (value: unknown): boolean => {
  if (
    !isRecord(value) ||
    typeof value.targetId !== 'string' ||
    typeof value.namespace !== 'string' ||
    typeof value.taskQueue !== 'string'
  ) {
    return false;
  }

  if (value.kind === 'workflow') {
    return (
      typeof value.workflowType === 'string' &&
      (value.nexusEndpoints === undefined ||
        isStringArray(value.nexusEndpoints))
    );
  }

  if (value.kind === 'standalone-activity') {
    return (
      typeof value.activityType === 'string' &&
      isRecord(value.timeouts) &&
      isJsonValue(value.timeouts) &&
      isRecord(value.policies) &&
      isJsonValue(value.policies)
    );
  }

  return (
    value.kind === 'standalone-nexus-operation' &&
    typeof value.endpoint === 'string' &&
    typeof value.service === 'string' &&
    typeof value.operation === 'string' &&
    isRecord(value.policies) &&
    isJsonValue(value.policies)
  );
};

const isLocalDescriptor = (value: unknown): value is BrowserCatalogDescriptor =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.title === 'string' &&
  typeof value.description === 'string' &&
  isStringArray(value.capabilityTags) &&
  isStringArray(value.expectedEvidence) &&
  isRuntimeJsonDocument(value.input) &&
  isRuntimeJsonDocument(value.startOptions) &&
  (value.setupMarkdown === undefined ||
    typeof value.setupMarkdown === 'string') &&
  isRecord(value.source) &&
  value.source.id === 'local' &&
  value.source.label === 'Local' &&
  isExecution(value.execution);

const assertCatalogLocalRefreshPayload: (
  payload: unknown,
) => asserts payload is CatalogLocalRefreshPayload = (payload) => {
  if (
    !isRecord(payload) ||
    !Array.isArray(payload.descriptors) ||
    !payload.descriptors.every(isLocalDescriptor)
  ) {
    throw new Error('Invalid catalog-local refresh payload');
  }
};

export const mergeCatalogDescriptors = (
  sharedDescriptors: readonly BrowserCatalogDescriptor[],
  localDescriptors: readonly BrowserCatalogDescriptor[],
): BrowserCatalogDescriptor[] => {
  const merged = [...sharedDescriptors, ...localDescriptors];
  const descriptorIds = new Set<string>();

  for (const descriptor of merged) {
    if (descriptorIds.has(descriptor.id)) {
      throw new Error(`Duplicate catalog descriptor ID "${descriptor.id}"`);
    }

    descriptorIds.add(descriptor.id);
  }

  catalogSources(merged);

  return merged;
};

export const findRouteCatalogDescriptor = (
  descriptors: readonly BrowserCatalogDescriptor[],
  exampleId: string,
): BrowserCatalogDescriptor | undefined =>
  descriptors.find((descriptor) => descriptor.id === exampleId);

export const routeCatalog = mergeCatalogDescriptors(catalog, localCatalog);

export const replaceRouteLocalCatalog = (payload: unknown): void => {
  assertCatalogLocalRefreshPayload(payload);
  const merged = mergeCatalogDescriptors(catalog, payload.descriptors);
  routeCatalog.splice(0, routeCatalog.length, ...merged);
};

type CatalogLocalHotContext = {
  on: (
    event: 'catalog-local:refresh',
    listener: (payload: unknown) => void,
  ) => void;
};

export const installCatalogLocalRefresh = (
  hot: CatalogLocalHotContext | undefined,
): void => {
  hot?.on('catalog-local:refresh', replaceRouteLocalCatalog);
};

installCatalogLocalRefresh(import.meta.hot);

const routingForNamespace = (
  descriptors: readonly BrowserCatalogDescriptor[],
  namespace: string,
): CatalogRouting =>
  Object.fromEntries(
    descriptors.map(({ execution }) => [
      execution.targetId,
      { namespace, taskQueue: execution.taskQueue },
    ]),
  );

export const resolveCatalogForNamespace = (
  namespace: string,
): BrowserCatalogDescriptor[] => {
  const resolvedExecutions = resolveCatalogRouting(
    routeCatalog.map(({ execution }) => execution),
    routingForNamespace(routeCatalog, namespace),
  );

  return routeCatalog.map((descriptor, index) => ({
    ...descriptor,
    execution: resolvedExecutions[index] ?? descriptor.execution,
  }));
};
