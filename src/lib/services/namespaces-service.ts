import { notifications } from '$lib/stores/notifications';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { ApiRoutes } from '$lib/utilities/route-for-api';

import type { ListNamespacesResponse } from '$types';

const emptyNamespace = {
  namespaces: [],
};

export async function fetchNamespaces(
  settings: Settings,
  request = fetch,
): Promise<ListNamespacesResponse> {
  if (settings.runtimeEnvironment.isCloud) {
    return emptyNamespace;
  }

  const results = await requestFromAPI<ListNamespacesResponse>(
    ApiRoutes.namespaces(),
    {
      request,
      onError: () => notifications.add('error', 'Unable to fetch namespaces'),
    },
  );

  return results ?? emptyNamespace;
}
