import type { LayoutData, LayoutLoad } from './$types';

import { fetchSearchAttributesForNamespace } from '$lib/services/search-attributes-service';
import { allSearchAttributes } from '$lib/stores/search-attributes';

export const load: LayoutLoad = async ({
  params,
  parent,
}): Promise<LayoutData> => {
  await parent();

  // there is a console warn about using the fetch provided rather than
  // window.fetch. The client would need to be updated to facilitate this
  const attributes = await fetchSearchAttributesForNamespace(params.namespace);

  allSearchAttributes.set(attributes);
};
