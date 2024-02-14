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
import { has } from '$lib/utilities/has';
import { validateHttps } from '$lib/utilities/is-http';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

export type PotentialPayloads = { payloads: unknown[] };

export async function convertPayloadsWithCodec({
  payloads,
  namespace = get(page).params.namespace,
  settings = get(page).data.settings,
  accessToken = get(authUser).accessToken,
  encode = false,
}: {
  payloads: PotentialPayloads;
  namespace?: string;
  settings?: Settings;
  accessToken?: string;
  encode?: boolean;
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
    endpoint + (encode ? '/encode' : '/decode'),
    requestOptions,
  )
    .then((response) => {
      if (has(response, 'ok') && !response.ok) {
        throw {
          statusCode: response.status,
          statusText: response.statusText,
          response,
          message: encode
            ? translate('common.encode-failed')
            : translate('common.decode-failed'),
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

      return payloads;
    });

  return encoderResponse;
}
