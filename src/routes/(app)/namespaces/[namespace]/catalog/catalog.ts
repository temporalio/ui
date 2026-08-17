import { localCatalog } from 'virtual:catalog-local';

import { catalog } from '$lib/catalog/browser/catalog';
import { catalogSources } from '$lib/catalog/browser/catalog-sources';
import {
  type CatalogRouting,
  resolveCatalogRouting,
} from '$lib/catalog/browser/routing';
import type { BrowserCatalogDescriptor } from '$lib/catalog/browser/types';

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
