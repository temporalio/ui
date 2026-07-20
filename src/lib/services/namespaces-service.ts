import { namespaces } from '$lib/stores/namespaces';
import { toaster } from '$lib/stores/toaster';
import type {
  DescribeNamespaceResponse,
  ListNamespacesResponse,
} from '$lib/types';
import type { NextPageToken, Replace, Settings } from '$lib/types/global';
import { paginated } from '$lib/utilities/paginated';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import {
  toNamespaceArchivalStateReadable,
  toNamespaceStateReadable,
} from '$lib/utilities/screaming-enums';

type PaginatedNamespacesResponse = Replace<
  ListNamespacesResponse,
  { nextPageToken?: NextPageToken }
>;

const emptyNamespace: { namespaces: DescribeNamespaceResponse[] } = {
  namespaces: [],
};

const toNamespaceDetails = (
  namespace: DescribeNamespaceResponse,
): DescribeNamespaceResponse => {
  if (namespace.config) {
    if (namespace.config.historyArchivalState != null) {
      namespace.config.historyArchivalState = toNamespaceArchivalStateReadable(
        namespace.config.historyArchivalState,
      );
    }
    if (namespace.config.visibilityArchivalState != null) {
      namespace.config.visibilityArchivalState =
        toNamespaceArchivalStateReadable(
          namespace.config.visibilityArchivalState,
        );
    }
  }

  if (namespace.namespaceInfo && namespace.namespaceInfo.state != null) {
    namespace.namespaceInfo.state = toNamespaceStateReadable(
      namespace.namespaceInfo.state,
    );
  }
  return namespace;
};

export async function fetchNamespaces(
  settings: Settings,
  request = fetch,
): Promise<void> {
  const { showTemporalSystemNamespace, runtimeEnvironment } = settings;

  if (runtimeEnvironment.isCloud) {
    namespaces.set([]);
    return;
  }

  try {
    const route = routeForApi('namespaces');
    const results = await paginated(
      async (token?: NextPageToken) =>
        (await requestFromAPI<PaginatedNamespacesResponse>(route, {
          request,
          token: token as string,
          onError: () =>
            toaster.push({
              variant: 'error',
              message: 'Unable to fetch namespaces',
            }),
        })) ?? {},
    );

    const _namespaces: DescribeNamespaceResponse[] = (results?.namespaces ?? [])
      .filter(
        (namespace: DescribeNamespaceResponse) =>
          showTemporalSystemNamespace ||
          namespace.namespaceInfo?.name !== 'temporal-system',
      )
      .map(toNamespaceDetails);

    namespaces.set(_namespaces);
  } catch {
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

  const route = routeForApi('namespace', { namespace });
  const results = await requestFromAPI<DescribeNamespaceResponse>(route, {
    request,
    onError: () =>
      toaster.push({ variant: 'error', message: 'Unable to fetch namespace' }),
  });

  return results ? toNamespaceDetails(results) : empty;
}
