import {
  setLastDataEncoderFailure,
  setLastDataEncoderSuccess,
} from '$lib/stores/data-encoder-config';
import { validateHttps } from '$lib/utilities/is-http';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

import type { Payloads } from '$types';

export function setCodecServerHeaders(
  namespace: string,
  settings: Settings,
  accessToken: string,
) {
  let validationFailed = false;
  const endpoint = settings?.codec?.endpoint;
  const passAccessToken = settings?.codec?.passAccessToken;

  const headers = {
    'Content-Type': 'application/json',
    'X-Namespace': namespace,
  };

  if (globalThis?.CodecServerHeaderOptions) {
    Object.entries(globalThis.CodecServerHeaderOptions)?.forEach(
      ([key, value]) => {
        if (key && value) headers[key] = value;
      },
    );
  }

  if (passAccessToken) {
    if (validateHttps(endpoint)) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else {
      setLastDataEncoderFailure();
      validationFailed = true;
    }
  }

  return { headers, validationFailed };
}

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
  const { headers, validationFailed } = setCodecServerHeaders(
    namespace,
    settings,
    accessToken,
  );
  if (validationFailed) return payloads;

  const encoderResponse: Promise<Payloads> = fetch(endpoint + '/decode', {
    headers,
    method: 'POST',
    body: stringifyWithBigInt(payloads),
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
