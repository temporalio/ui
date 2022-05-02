import {
  setLastDataEncoderFailure,
  setLastDataEncoderSuccess,
} from '$lib/stores/data-encoder-config';
import type { Payloads } from '$types';

export async function convertPayloadsWithCodec(
  payload: Payloads,
  endpoint: string,
): Promise<Payloads> {
  const encoderResponse: Promise<Payloads> = fetch(endpoint + '/decode', {
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
