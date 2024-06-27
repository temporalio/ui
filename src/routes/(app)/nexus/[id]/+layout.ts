import { fetchNexusEndpoint } from '$lib/services/nexus-service.js';
// import { decodePayload } from '$lib/utilities/decode-payload.js';

export const load = async ({ params, fetch }) => {
  const { id } = params;
  const endpoint = await fetchNexusEndpoint(id, fetch);
  // const descriptionString =
  //   decodePayload(endpoint?.spec?.description)?.data || '';
  //TODO: set description as the description string somehow
  return endpoint;
};
