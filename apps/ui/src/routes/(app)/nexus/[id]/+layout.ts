import { fetchNexusEndpoint } from '$lib/services/nexus-service.js';
import { decodeSingleReadablePayloadWithCodec } from '$lib/utilities/decode-payload.js';

export const load = async ({ params, fetch, parent }) => {
  const { id } = params;

  try {
    const { endpoint } = await fetchNexusEndpoint(id, fetch);
    const data = await parent();

    let description = '';
    try {
      if (endpoint?.spec?.description?.data) {
        const decodedDescription = await decodeSingleReadablePayloadWithCodec(
          endpoint.spec.description,
          data.settings,
        );

        if (typeof decodedDescription === 'string') {
          description = decodedDescription;
        }
      }
    } catch (e) {
      console.error('Error decoding Nexus Endpoint description:', e);
    }
    endpoint.spec.descriptionString = description;
    return {
      endpoint,
    };
  } catch (e) {
    console.error('Error loading Nexus Endpoint:', e);
  }
};
