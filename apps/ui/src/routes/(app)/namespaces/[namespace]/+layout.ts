import type { LayoutData, LayoutLoad } from './$types';

import { fetchSearchAttributesForNamespace } from '$lib/services/search-attributes-service';
import { allSearchAttributes } from '$lib/stores/search-attributes';

export const load: LayoutLoad = async ({
  params,
  parent,
  fetch,
}): Promise<LayoutData> => {
  await parent();
  const attributes = await fetchSearchAttributesForNamespace(
    params.namespace,
    fetch,
  );

  allSearchAttributes.set(attributes);
};
