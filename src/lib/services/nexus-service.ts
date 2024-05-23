import type { NexusEndpoint } from '$lib/types/nexus';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export const fetchNexusEndpoints = async (
  request = fetch,
): Promise<NexusEndpoint[]> => {
  const route = routeForApi('nexus-endpoints');
  const { endpoints }: { endpoints: NexusEndpoint[] } =
    await requestFromAPI<NexusEndpoint>(route, {
      request,
    });
  return endpoints;
};

export const fetchNexusEndpoint = async (
  id: string,
  request = fetch,
): Promise<NexusEndpoint> => {
  const route = routeForApi('nexus-endpoint', { endpointId: id });
  const endpoint: NexusEndpoint = await requestFromAPI<NexusEndpoint>(route, {
    request,
  });
  return endpoint;
};

export const createNexusEndpoint = async (
  body: NexusEndpoint,
  request = fetch,
): Promise<NexusEndpoint> => {
  const route = routeForApi('nexus-endpoint');
  const endpoint: NexusEndpoint = await requestFromAPI<NexusEndpoint>(route, {
    request,
  });
  return endpoint;
};
