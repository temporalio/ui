import {
  setLastDataEncoderFailure,
  setLastDataEncoderSuccess,
} from '$lib/stores/data-encoder-config';
import { validateHttps } from '$lib/utilities/is-http';

import type { Payloads } from '$types';

export async function convertPayloadsWithCodec({
  payloads,
  namespace,
  settings,
  accessToken,
}: {
  payloads: Payloads;
  namespace: string;
  settings: Settings;
  accessToken: string;
}): Promise<Payloads> {
  const endpoint = settings?.codec?.endpoint;
  const passAccessToken = settings?.codec?.passAccessToken;

  const headers = {
    'Content-Type': 'application/json',
    'X-Namespace': namespace,
  };

  if (passAccessToken) {
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
