import { fetchSearchAttributesForNamespace } from '$lib/services/search-attributes-service';
import { allSearchAttributes } from '$lib/stores/search-attributes';
import type { LayoutData, LayoutLoad } from './$types';

export const load: LayoutLoad = async ({
  params,
  fetch,
}): Promise<LayoutData> => {
  const attributes = await fetchSearchAttributesForNamespace(
    params.namespace,
    fetch,
  );

  allSearchAttributes.set(attributes);
};
