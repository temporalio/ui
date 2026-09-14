import type { BrowserCatalogDescriptor, BrowserCatalogSource } from './types';

export function assertCatalogSource(
  source: unknown,
): asserts source is BrowserCatalogSource {
  if (
    typeof source !== 'object' ||
    source === null ||
    !('id' in source) ||
    typeof source.id !== 'string' ||
    source.id.trim().length === 0
  ) {
    throw new Error('Catalog source must use a non-empty id');
  }

  if (source.id === 'all') {
    throw new Error('Catalog source cannot use the reserved id "all"');
  }

  if (
    !('label' in source) ||
    typeof source.label !== 'string' ||
    source.label.trim().length === 0
  ) {
    throw new Error('Catalog source must use a non-empty label');
  }
}

export const catalogSources = (
  descriptors: readonly BrowserCatalogDescriptor[],
): BrowserCatalogSource[] => {
  const sources = new Map<string, BrowserCatalogSource>();

  for (const { source } of descriptors) {
    assertCatalogSource(source);
    const existing = sources.get(source.id);

    if (existing && existing.label !== source.label) {
      throw new Error(
        `Catalog source "${source.id}" has conflicting labels "${existing.label}" and "${source.label}"`,
      );
    }

    if (!existing) sources.set(source.id, source);
  }

  return [...sources.values()];
};
