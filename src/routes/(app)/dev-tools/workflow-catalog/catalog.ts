import { localWorkflowCatalog } from 'virtual:workflow-catalog-local';

import { workflowCatalog } from '$lib/workflow-catalog/browser/catalog';
import type { BrowserWorkflowCatalogDescriptor } from '$lib/workflow-catalog/browser/types';

export const mergeWorkflowCatalogDescriptors = (
  sharedDescriptors: readonly BrowserWorkflowCatalogDescriptor[],
  localDescriptors: readonly BrowserWorkflowCatalogDescriptor[],
): BrowserWorkflowCatalogDescriptor[] => {
  const merged = [...sharedDescriptors, ...localDescriptors];
  const descriptorIds = new Set<string>();

  for (const descriptor of merged) {
    if (descriptorIds.has(descriptor.id)) {
      throw new Error(
        `Duplicate workflow catalog descriptor ID "${descriptor.id}"`,
      );
    }

    descriptorIds.add(descriptor.id);
  }

  return merged;
};

export const findRouteWorkflowDescriptor = (
  descriptors: readonly BrowserWorkflowCatalogDescriptor[],
  exampleId: string,
): BrowserWorkflowCatalogDescriptor | undefined =>
  descriptors.find((descriptor) => descriptor.id === exampleId);

export const routeWorkflowCatalog = mergeWorkflowCatalogDescriptors(
  workflowCatalog,
  localWorkflowCatalog,
);
