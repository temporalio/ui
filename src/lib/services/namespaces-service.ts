import { toaster } from '$lib/stores/toaster';
import { namespaces } from '$lib/stores/namespaces';
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
): Promise<void> {
  if (settings.runtimeEnvironment.isCloud) {
    namespaces.set([]);
    return;
  }

  try {
    const route = await routeForApi('namespaces');
    const results = await paginated(async (token: string) =>
      requestFromAPI<ListNamespacesResponse>(route, {
        request,
        token,
        onError: () =>
          toaster.push({
            variant: 'error',
            message: 'Unable to fetch namespaces',
          }),
      }),
    );

    const { showTemporalSystemNamespace } = settings;
    const _namespaces: DescribeNamespaceResponse[] = (
      results?.namespaces ?? []
    ).filter(
      (namespace: DescribeNamespaceResponse) =>
        showTemporalSystemNamespace ||
        namespace.namespaceInfo.name !== 'temporal-system',
    );
    namespaces.set(_namespaces);
  } catch (e) {
    namespaces.set([]);
  }
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
    onError: () =>
      toaster.push({ variant: 'error', message: 'Unable to fetch namespaces' }),
  });

  return results ?? empty;
}
