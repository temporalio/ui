import { notifications } from '$lib/stores/notifications';
import { paginated } from '$lib/utilities/paginated';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

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

  const results = await paginated(async (token: string) =>
    requestFromAPI<ListNamespacesResponse>(routeForApi('namespaces'), {
      request,
      token,
      onError: () => notifications.add('error', 'Unable to fetch namespaces'),
    }),
  );

  return results ?? emptyNamespace;
}
