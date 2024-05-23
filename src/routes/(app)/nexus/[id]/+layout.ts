import { fetchNexusEndpoint } from '$lib/services/nexus-service.js';

export const load = async ({ params, fetch }) => {
  const { id } = params;
  const endpoint = await fetchNexusEndpoint(id, fetch);
  return endpoint;
};
