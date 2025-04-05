import type { SearchAttributesResponse } from '$lib/types/workflows';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import { toSearchAttributeTypeReadable } from '$lib/utilities/screaming-enums';

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

    const customAttributes = { ...searchAttributesResponse.customAttributes };
    const systemAttributes = { ...searchAttributesResponse.systemAttributes };
    Object.entries(customAttributes).forEach(([key, value]) => {
      customAttributes[key] = toSearchAttributeTypeReadable(value);
    });
    Object.entries(systemAttributes).forEach(([key, value]) => {
      systemAttributes[key] = toSearchAttributeTypeReadable(value);
    });
    return {
      customAttributes,
      systemAttributes,
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
