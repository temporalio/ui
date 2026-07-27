import type { NexusEndpoint } from '$lib/types/nexus';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

type NexusEndpoints = { endpoints: NexusEndpoint[] };

export const fetchNexusEndpoints = async (
  search: string = '',
  request = fetch,
): Promise<NexusEndpoint[]> => {
  const route = routeForApi('nexus-endpoints');
  const { endpoints } = await requestFromAPI<NexusEndpoints>(route, {
    request,
    params: { name: search },
  });
  return endpoints || [];
};

export const fetchNexusEndpoint = async (
  id: string,
  request = fetch,
): Promise<{ endpoint: NexusEndpoint }> => {
  const route = routeForApi('nexus-endpoint', { endpointId: id });
  const endpoint = await requestFromAPI<{ endpoint: NexusEndpoint }>(route, {
    request,
    notifyOnError: false,
  });
  return endpoint;
};

export const createNexusEndpoint = async (
  body: Partial<NexusEndpoint> & { projectId?: string },
  request = fetch,
): Promise<NexusEndpoint> => {
  const route = routeForApi('nexus-endpoints');
  const endpoint: NexusEndpoint = await requestFromAPI<NexusEndpoint>(route, {
    request,
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        ...body,
      }),
    },
    notifyOnError: false,
  });
  return endpoint;
};

export const updateNexusEndpoint = async (
  id: string,
  body: Partial<NexusEndpoint>,
  request = fetch,
): Promise<NexusEndpoint> => {
  const route = routeForApi('nexus-endpoint.update', { endpointId: id });
  const endpoint: NexusEndpoint = await requestFromAPI<NexusEndpoint>(route, {
    request,
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        ...body,
      }),
    },
    notifyOnError: false,
  });
  return endpoint;
};

export const deleteNexusEndpoint = async (
  id: string,
  version: string,
  request = fetch,
): Promise<NexusEndpoint> => {
  const route = routeForApi('nexus-endpoint', { endpointId: id });
  const endpoint: NexusEndpoint = await requestFromAPI<NexusEndpoint>(route, {
    request,
    options: {
      method: 'DELETE',
    },
    params: { version },
  });
  return endpoint;
};
