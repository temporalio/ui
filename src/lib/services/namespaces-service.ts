import { notifications } from '$lib/stores/notifications';
import { paginated } from '$lib/utilities/paginated';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

import type { DescribeNamespaceResponse, ListNamespacesResponse } from '$types';

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

  const route = await routeForApi('namespaces');
  const results = await paginated(async (token: string) =>
    requestFromAPI<ListNamespacesResponse>(route, {
      request,
      token,
      onError: () => notifications.add('error', 'Unable to fetch namespaces'),
    }),
  );

  return results ?? emptyNamespace;
}

export async function fetchNamespace(
  namespace: string,
  settings?: Settings,
  request = fetch,
): Promise<DescribeNamespaceResponse> {
  const [empty] = emptyNamespace.namespaces;

  if (settings?.runtimeEnvironment?.isCloud) {
    return empty;
  }

  const route = await routeForApi('namespace', { namespace });
  const results = await requestFromAPI<DescribeNamespaceResponse>(route, {
    request,
    onError: () => notifications.add('error', 'Unable to fetch namespaces'),
  });

  return results ?? empty;
}
