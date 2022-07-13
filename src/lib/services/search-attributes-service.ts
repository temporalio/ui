import { searchAttributes } from '$lib/stores/search-attributes';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

import type { GetSearchAttributesResponse } from '$types';

export const fetchSearchAttributes = async (
  request = fetch,
): Promise<GetSearchAttributesResponse> => {
  return await requestFromAPI<GetSearchAttributesResponse>(
    routeForApi('search-attributes'),
    {
      request,
    },
  ).then((searchAttributesResponse) => {
    console.log({ searchAttributesResponse });
    if (searchAttributesResponse.keys) {
      searchAttributes.set(searchAttributesResponse.keys);
    }

    return searchAttributesResponse;
  });
};
