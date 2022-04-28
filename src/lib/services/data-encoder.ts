import {
  setLastDataEncoderFailure,
  setLastDataEncoderSuccess,
} from '$lib/stores/data-encoder-config';
import type { Payload } from '$types';

export async function convertPayloadWithCodec(
  payload: Payload,
  endpoint: string,
): Promise<Payload> {
  const encoderResponse: Promise<Payload> = fetch(endpoint + '/decode', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
    .then((r) => r.json())
    .then((response) => {
      setLastDataEncoderSuccess();

      return response;
    })
    .catch(() => {
      setLastDataEncoderFailure();

      return payload;
    });

  return encoderResponse;
}
