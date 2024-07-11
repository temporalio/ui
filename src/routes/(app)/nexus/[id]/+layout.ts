import { fetchNexusEndpoint } from '$lib/services/nexus-service.js';
import { decodeSingleReadablePayloadWithCodec } from '$lib/utilities/decode-payload.js';

export const load = async ({ params, fetch, parent }) => {
  const { id } = params;
  const { endpoint } = await fetchNexusEndpoint(id, fetch);
  const data = await parent();

  let description = '';
  if (endpoint?.spec?.description?.data) {
    const decodedDescription = await decodeSingleReadablePayloadWithCodec(
      endpoint.spec.description,
      data.settings,
    );
    description = decodedDescription;
  }
  endpoint.spec.descriptionString = description;
  return {
    endpoint,
  };
};
