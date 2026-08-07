import type {
  BrowserWorkflowCatalogDescriptor,
  BrowserWorkflowCatalogSource,
} from './types';

export function assertWorkflowCatalogSource(
  source: unknown,
): asserts source is BrowserWorkflowCatalogSource {
  if (
    typeof source !== 'object' ||
    source === null ||
    !('id' in source) ||
    typeof source.id !== 'string' ||
    source.id.trim().length === 0
  ) {
    throw new Error('Workflow catalog source must use a non-empty id');
  }

  if (source.id === 'all') {
    throw new Error('Workflow catalog source cannot use the reserved id "all"');
  }

  if (
    !('label' in source) ||
    typeof source.label !== 'string' ||
    source.label.trim().length === 0
  ) {
    throw new Error('Workflow catalog source must use a non-empty label');
  }
}

export const workflowCatalogSources = (
  descriptors: readonly BrowserWorkflowCatalogDescriptor[],
): BrowserWorkflowCatalogSource[] => {
  const sources = new Map<string, BrowserWorkflowCatalogSource>();

  for (const { source } of descriptors) {
    assertWorkflowCatalogSource(source);
    const existing = sources.get(source.id);

    if (existing && existing.label !== source.label) {
      throw new Error(
        `Workflow catalog source "${source.id}" has conflicting labels "${existing.label}" and "${source.label}"`,
      );
    }

    if (!existing) sources.set(source.id, source);
  }

  return [...sources.values()];
};
