import urlcat from 'urlcat';

import { toWorkflowExecutions } from '$lib/models/workflow-execution';
import { toNamespaceDetails } from '$lib/services/namespaces-service';
import type {
  DescribeNamespaceResponse,
  GetClusterInfoResponse,
  GetSystemInfoResponse,
  ListNamespacesResponse,
} from '$lib/types';
import type { Settings } from '$lib/types/global';
import type {
  CountWorkflowExecutionsResponse,
  ListWorkflowExecutionsResponse,
  SearchAttributesResponse,
  SearchAttributesValue,
} from '$lib/types/workflows';

import { toSearchAttributeTypeReadable } from './screaming-enums';

const apiBase = getApiBase();

function getApiBase(prefix = '/api/v1'): string {
  const host = import.meta.env.VITE_TEMPORAL_HOST;
  const httpPort = import.meta.env.VITE_TEMPORAL_HTTP_PORT;

  const origin = `${host}:${httpPort}`;
  return urlcat(origin, prefix);
}

const api = async <T>(url: string): Promise<T> => {
  return await (await fetch(url)).json();
};

const settings: Settings = {
  auth: {
    enabled: false,
    options: null,
  },
  bannerText: '',
  defaultNamespace: 'default',
  showTemporalSystemNamespace: false,
  feedbackURL: '',
  notifyOnNewVersion: false,
  codec: {
    endpoint: '',
    passAccessToken: false,
  },
  version: 'main',
  disableWriteActions: false,
  workflowTerminateDisabled: false,
  workflowCancelDisabled: false,
  workflowSignalDisabled: false,
  workflowResetDisabled: false,
  batchActionsDisabled: false,
  hideWorkflowQueryErrors: false,
};

export const HttpApi = Object.freeze({
  settings: () => {
    return settings;
  },
  system: async () => {
    const url = urlcat(apiBase, '/system-info', {});
    const response: GetSystemInfoResponse = await api(url);
    return response;
  },
  cluster: async () => {
    const url = urlcat(apiBase, '/cluster-info', {});
    const response: GetClusterInfoResponse = await api(url);
    return response;
  },
  namespaces: async () => {
    const url = urlcat(apiBase, '/namespaces', {});
    const response: ListNamespacesResponse = await api(url);

    // TODO: Handle pagination
    // if (response.nextPageToken) ...

    const namespaces = response.namespaces
      .filter(
        (namespace: DescribeNamespaceResponse) =>
          namespace.namespaceInfo.name !== 'temporal-system',
      )
      .map(toNamespaceDetails);
    return namespaces;
  },
  namespace: async (namespace: string) => {
    const url = urlcat(apiBase, '/namespaces/:namespace', { namespace });
    const response: DescribeNamespaceResponse = await api(url);
    return toNamespaceDetails(response);
  },
  searchAttributes: async (namespace: string) => {
    const url = urlcat(apiBase, '/namespaces/:namespace/search-attributes', {
      namespace,
    });
    const response: SearchAttributesResponse = await api(url);

    const customAttributes = { ...response.customAttributes };
    const systemAttributes = { ...response.systemAttributes };
    Object.entries(customAttributes).forEach(([key, value]) => {
      customAttributes[key] = toSearchAttributeTypeReadable(value);
    });
    Object.entries(systemAttributes).forEach(([key, value]) => {
      systemAttributes[key] = toSearchAttributeTypeReadable(value);
    });

    const searchAttributes: Record<string, SearchAttributesValue> = {
      ...customAttributes,
      ...systemAttributes,
    };
    return searchAttributes;
  },
  workflows: async (namespace: string, query: string) => {
    const url = urlcat(apiBase, '/namespaces/:namespace/workflows', {
      namespace,
      query,
    });
    const response: ListWorkflowExecutionsResponse = await api(url);
    return toWorkflowExecutions(response);
  },
  workflowCount: async (namespace: string, query: string) => {
    const groupByClause = 'GROUP BY ExecutionStatus';
    query = query ? `${query} ${groupByClause}` : `${groupByClause}`;
    const url = urlcat(apiBase, '/namespaces/:namespace/workflow-count', {
      namespace,
      query,
    });
    const counts: CountWorkflowExecutionsResponse = await api(url);
    return counts;
  },
});
