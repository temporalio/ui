import { page } from '$app/state';

import { translate } from '$lib/i18n/translate';
import {
  setLastDataEncoderFailure,
  setLastDataEncoderSuccess,
} from '$lib/stores/data-encoder-config';
import type { NetworkError } from '$lib/types/global';
import { getAccessToken, getIdToken } from '$lib/utilities/core-provider';
import {
  getCodecEndpoint,
  getCodecIncludeCredentials,
  getCodecPassAccessToken,
} from '$lib/utilities/get-codec';
import { validateHttps } from '$lib/utilities/is-http';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

export type PotentialPayloads = { payloads: unknown[] };

export async function codeServerRequest({
  type,
  payloads,
}: {
  type: 'decode' | 'encode';
  payloads: PotentialPayloads;
}): Promise<PotentialPayloads> {
  const settings = page.data.settings;
  const namespace = page.params.namespace;
  const endpoint = getCodecEndpoint(settings);

  if (!endpoint) {
    if (type === 'decode') return payloads;
    throw new Error('No codec endpoint configured');
  }

  const passAccessToken = getCodecPassAccessToken(settings);
  const includeCredentials = getCodecIncludeCredentials(settings);

  const headers = {
    'Content-Type': 'application/json',
    'X-Namespace': namespace,
  };

  if (passAccessToken) {
    if (validateHttps(endpoint)) {
      const accessToken = await getAccessToken();
      const idToken = await getIdToken();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      if (idToken) {
        headers['Authorization-Extras'] = idToken;
      }
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

  const decoderResponse: Promise<PotentialPayloads> = fetch(
    endpoint + `/${type}`,
    requestOptions,
  )
    .then((response) => {
      if (response.ok === false) {
        throw {
          statusCode: response.status,
          statusText: response.statusText,
          response,
          message: translate(`common.${type}-failed`),
        } as NetworkError;
      } else {
        return response.json();
      }
    })
    .then((response) => {
      setLastDataEncoderSuccess();

      return response;
    })
    .catch((err: unknown) => {
      setLastDataEncoderFailure(err);
      if (type === 'decode') {
        return payloads;
      } else {
        throw err;
      }
    });

  return decoderResponse;
}

export async function decodePayloadsWithCodec({
  payloads,
}: {
  payloads: PotentialPayloads;
}): Promise<PotentialPayloads> {
  return codeServerRequest({ type: 'decode', payloads });
}

export async function encodePayloadsWithCodec({
  payloads,
}: {
  payloads: PotentialPayloads;
}): Promise<PotentialPayloads> {
  return codeServerRequest({ type: 'encode', payloads });
}
