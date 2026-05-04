import { page } from '$app/state';

import { translate } from '$lib/i18n/translate';
import {
  setLastDataEncoderFailure,
  setLastDataEncoderSuccess,
} from '$lib/stores/data-encoder-config';
import type { Payloads } from '$lib/types';
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

const delay = (ms: number, signal?: AbortSignal): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
};

export async function codeServerRequest({
  type,
  payloads,
  signal,
}: {
  type: 'decode' | 'encode';
  payloads: PotentialPayloads;
  signal?: AbortSignal;
}): Promise<Payloads> {
  const settings = page.data.settings;
  const namespace = page.params.namespace;
  const endpoint = getCodecEndpoint(settings);

  if (!endpoint) {
    if (type === 'decode') return payloads;
    throw new Error('No codec endpoint configured');
  }

  const passAccessToken = getCodecPassAccessToken(settings);
  const includeCredentials = getCodecIncludeCredentials(settings);

  const headers: Record<string, string> = {
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
        signal,
      }
    : {
        headers,
        method: 'POST',
        body: stringifyWithBigInt(payloads),
        signal,
      };

  const delays = [0, 500, 1000];
  let lastErr: unknown;

  for (let attempt = 0; attempt < delays.length; attempt++) {
    if (attempt > 0) {
      try {
        await delay(delays[attempt], signal);
      } catch {
        break;
      }
    }
    if (signal?.aborted) break;

    try {
      const response = await fetch(endpoint + `/${type}`, requestOptions);

      if (response.ok === false) {
        const err = {
          statusCode: response.status,
          statusText: response.statusText,
          response,
          message: translate(`common.${type}-failed`),
        } as NetworkError;

        if (response.status >= 400 && response.status < 500) {
          setLastDataEncoderFailure(err);
          if (type === 'decode') return payloads;
          throw err;
        }

        lastErr = err;
        continue;
      }

      const data = await response.json();
      setLastDataEncoderSuccess();
      return data;
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'statusCode' in err &&
        (err as { statusCode: number }).statusCode >= 400 &&
        (err as { statusCode: number }).statusCode < 500
      ) {
        throw err;
      }
      if (signal?.aborted) break;
      lastErr = err;
    }
  }

  setLastDataEncoderFailure(lastErr);
  if (type === 'decode') return payloads;
  throw lastErr;
}

export async function decodePayloadsWithCodec({
  payloads,
}: {
  payloads: PotentialPayloads;
}): Promise<Payloads> {
  return codeServerRequest({ type: 'decode', payloads });
}

export async function encodePayloadsWithCodec({
  payloads,
}: {
  payloads: PotentialPayloads;
}): Promise<Payloads> {
  return codeServerRequest({ type: 'encode', payloads });
}
