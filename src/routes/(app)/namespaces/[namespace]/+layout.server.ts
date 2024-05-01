import type { LayoutData, LayoutServerLoad } from './$types';

import { HttpApi } from '$lib/utilities/http-api';

export const load: LayoutServerLoad = async ({
  params,
}): Promise<LayoutData> => {
  const attributes = await HttpApi.searchAttributes(params.namespace);

  return {
    attributes,
  };
};
