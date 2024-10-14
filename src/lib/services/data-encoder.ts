import { get } from 'svelte/store';

import { page } from '$app/stores';

import { translate } from '$lib/i18n/translate';
import { authUser } from '$lib/stores/auth-user';
import {
  setLastDataEncoderFailure,
  setLastDataEncoderSuccess,
} from '$lib/stores/data-encoder-config';
import type { NetworkError, Settings } from '$lib/types/global';
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
  namespace = get(page).params.namespace,
  settings = get(page).data.settings,
}: {
  type: 'decode' | 'encode';
  payloads: PotentialPayloads;
  namespace?: string;
  settings?: Settings;
}): Promise<PotentialPayloads> {
  const endpoint = getCodecEndpoint(settings);
  const passAccessToken = getCodecPassAccessToken(settings);
  const includeCredentials = getCodecIncludeCredentials(settings);

  const headers = {
    'Content-Type': 'application/json',
    'X-Namespace': namespace,
  };

  if (passAccessToken) {
    if (validateHttps(endpoint)) {
      let accessToken = get(authUser).accessToken;
      if (globalThis?.AccessToken) {
        accessToken = await globalThis?.AccessToken();
      }
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
  namespace = get(page).params.namespace,
  settings = get(page).data.settings,
}: {
  payloads: PotentialPayloads;
  namespace?: string;
  settings?: Settings;
}): Promise<PotentialPayloads> {
  return codeServerRequest({ type: 'decode', payloads, namespace, settings });
}

export async function encodePayloadsWithCodec({
  payloads,
  namespace = get(page).params.namespace,
  settings = get(page).data.settings,
}: {
  payloads: PotentialPayloads;
  namespace?: string;
  settings?: Settings;
}): Promise<PotentialPayloads> {
  return codeServerRequest({ type: 'encode', payloads, namespace, settings });
}
