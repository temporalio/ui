import { searchAttributes } from '$lib/stores/search-attributes';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export const fetchSearchAttributes = async (
  settings: Settings,
  request = fetch,
): Promise<SearchAttributesResponse> => {
  if (settings.runtimeEnvironment.isCloud) return;

  return await requestFromAPI<SearchAttributesResponse>(
    routeForApi('search-attributes'),
    {
      request,
    },
  ).then((searchAttributesResponse) => {
    if (searchAttributesResponse?.keys) {
      searchAttributes.set(searchAttributesResponse.keys);
    }

    return searchAttributesResponse;
  });
};
