import {
  setLastDataEncoderFailure,
  setLastDataEncoderSuccess,
} from '$lib/stores/data-encoder-config';
import { validateHttps } from '$lib/utilities/is-http';

import type { Payloads } from '$lib/extra-types';

export async function convertPayloadsWithCodec({
  payloads,
  namespace,
  settings,
}: {
  payloads: Payloads;
  namespace: string;
  settings: Settings;
}): Promise<Payloads> {
  const { endpoint, accessToken } = settings.codec;

  const headers = {
    'Content-Type': 'application/json',
    'X-Namespace': namespace,
  };

  if (accessToken) {
    if (validateHttps(endpoint)) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else {
      setLastDataEncoderFailure();

      return payloads;
    }
  }

  const encoderResponse: Promise<Payloads> = fetch(endpoint + '/decode', {
    headers,
    method: 'POST',
    body: JSON.stringify(payloads),
  })
    .then((r) => r.json())
    .then((response) => {
      setLastDataEncoderSuccess();

      return response;
    })
    .catch(() => {
      setLastDataEncoderFailure();

      return payloads;
    });

  return encoderResponse;
}
