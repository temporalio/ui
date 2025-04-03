import { ListSearchAttributesResponse } from '$lib/schemas';
import type { SearchAttributesResponseHumanized } from '$lib/types/workflows';
import { mapEntries } from '$lib/utilities/map-entries';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import { toSearchAttributeTypeReadable } from '$lib/utilities/screaming-enums';

export const fetchSearchAttributesForNamespace = async (
  namespace: string,
  request = fetch,
): Promise<SearchAttributesResponseHumanized> => {
  try {
    // get the search attributes from the API
    const parsed = await parsedResponse({ namespace, request });

    // parse the response to a human readable format
    return humanizeSearchAttributes(parsed);
  } catch (err) {
    // handle the error and return a default value
    handleError({ namespace, err });
  }
};

async function parsedResponse({
  namespace,
  request = fetch,
}: {
  namespace: string;
  request?: typeof fetch;
}) {
  const route = routeForApi('search-attributes', { namespace });
  const searchAttributesResponse =
    await requestFromAPI<ListSearchAttributesResponse>(route, {
      request,
    });

  // The parse call is integral to the service implementation as it passes the
  // response through the zod schema and validates the content
  return ListSearchAttributesResponse.parse(searchAttributesResponse);
}

function humanizeSearchAttributes(
  parsed: ListSearchAttributesResponse,
): SearchAttributesResponseHumanized {
  return {
    customAttributes: mapEntries(
      parsed.customAttributes || {},
      toSearchAttributeTypeReadable,
    ),

    systemAttributes: mapEntries(
      parsed.systemAttributes || {},
      toSearchAttributeTypeReadable,
    ),
  };
}

function handleError({
  namespace,
  err,
}: {
  namespace: string;
  err: unknown;
}): SearchAttributesResponseHumanized {
  const message = 'Error fetching search attributes for namespace:';
  console.error(message, namespace, err);

  return {
    customAttributes: {},
    systemAttributes: {},
  };
}
