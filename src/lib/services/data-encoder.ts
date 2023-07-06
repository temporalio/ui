import {
  setLastDataEncoderFailure,
  setLastDataEncoderSuccess,
} from '$lib/stores/data-encoder-config';
import type { Settings } from '$lib/types/global';
import { validateHttps } from '$lib/utilities/is-http';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

type PotentialPayloads = { payloads: unknown[] };

export async function convertPayloadsWithCodec({
  payloads,
  namespace,
  settings,
  accessToken,
}: {
  payloads: PotentialPayloads;
  namespace: string;
  settings: Settings;
  accessToken: string;
}): Promise<PotentialPayloads> {
  const endpoint = settings?.codec?.endpoint;
  const passAccessToken = settings?.codec?.passAccessToken;
  const includeCredentials = settings?.codec?.includeCredentials;

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

  const requestOptions = includeCredentials
    ? {
        headers,
        credentials: 'include' as RequestCredentials,
        method: 'POST',
        body: stringifyWithBigInt(payloads),
      }
    : {
        headers,
        method: 'POST',
        body: stringifyWithBigInt(payloads),
      };

  const encoderResponse: Promise<PotentialPayloads> = fetch(
    endpoint + '/decode',
    requestOptions,
  )
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
