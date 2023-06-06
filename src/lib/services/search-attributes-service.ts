import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import type {
  SearchAttributesResponse,
  SearchAttributes,
} from '$lib/types/workflows';

export const fetchSearchAttributesForNamespace = async (
  namespace: string,
  request = fetch,
): Promise<Omit<SearchAttributesResponse, 'storageSchema'>> => {
  const route = routeForApi('search-attributes', { namespace });
  return requestFromAPI<SearchAttributesResponse>(route, {
    request,
  }).then((searchAttributesResponse) => ({
    customAttributes: searchAttributesResponse.customAttributes,
    systemAttributes: searchAttributesResponse.systemAttributes,
  }));
};
