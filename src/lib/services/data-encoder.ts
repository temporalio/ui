import { translate } from '$lib/i18n/translate';
import {
  setLastDataEncoderFailure,
  setLastDataEncoderSuccess,
} from '$lib/stores/data-encoder-config';
import type { NetworkError, Settings } from '$lib/types/global';
import { validateHttps } from '$lib/utilities/is-http';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

type PotentialPayloads = { payloads: unknown[] };

export async function convertPayloadsWithCodec({
  payloads,
  namespace,
  settings,
  accessToken,
  encode = false,
}: {
  payloads: PotentialPayloads;
  namespace: string;
  settings: Settings;
  accessToken: string;
  encode?: boolean;
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
    endpoint + (encode ? '/encode' : '/decode'),
    requestOptions,
  )
    .then((response) => {
      if (!response.ok) {
        throw {
          statusCode: response.status,
          statusText: response.statusText,
          response,
          message: encode
            ? translate('encode-failed')
            : translate('decode-failed'),
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
