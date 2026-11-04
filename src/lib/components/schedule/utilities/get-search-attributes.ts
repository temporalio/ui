import type { SearchAttribute } from '$lib/types';
import { setSearchAttributes } from '$lib/utilities/encode-payload';

export function getSearchAttributes(
  attrs: Parameters<typeof setSearchAttributes>[0],
): SearchAttribute | null {
  if (!attrs.length) {
    return null;
  }

  return {
    indexedFields: { ...setSearchAttributes(attrs) },
  };
}
