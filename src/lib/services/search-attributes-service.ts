import type { SearchAttributesResponse } from '$lib/types/workflows';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export const fetchSearchAttributesForNamespace = async (
  namespace: string,
  request = fetch,
): Promise<Omit<SearchAttributesResponse, 'storageSchema'>> => {
  try {
    const route = routeForApi('search-attributes', { namespace });
    const searchAttributesResponse =
      await requestFromAPI<SearchAttributesResponse>(route, {
        request,
      });
    return {
      customAttributes: searchAttributesResponse.customAttributes,
      systemAttributes: searchAttributesResponse.systemAttributes,
    };
  } catch (e) {
    console.error(
      'Error fetching search attributes for namespace',
      namespace,
      e,
    );
    return {
      customAttributes: {},
      systemAttributes: {},
    };
  }
};
