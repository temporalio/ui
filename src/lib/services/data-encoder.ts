import { BROWSER } from 'esm-env';

import { page } from '$app/state';

import { translate } from '$lib/i18n/translate';
import {
  setLastDataEncoderFailure,
  setLastDataEncoderSuccess,
} from '$lib/stores/data-encoder-config';
import type { Payload, Payloads } from '$lib/types';
import type { NetworkError } from '$lib/types/global';
import { getAccessToken, getIdToken } from '$lib/utilities/core-provider';
import {
  getCodecEndpoint,
  getCodecIncludeCredentials,
  getCodecPassAccessToken,
} from '$lib/utilities/get-codec';
import { validateHttps } from '$lib/utilities/is-http';
import {
  parseWithBigInt,
  stringifyWithBigInt,
} from '$lib/utilities/parse-with-big-int';

export type PotentialPayloads = { payloads: unknown[] };

export type CodecDecodeOptions = {
  /** Opt in only for the workflow input and result previews. */
  cache?: boolean;
};

export const NO_CODEC_SERVER_CONFIGURED_ERROR = new Error(
  'No codec server configured',
);

// Workflow input/result previews opt in to share decoding with their expanded
// views. Keep decrypted data in browser memory only, scoped to the current run.
// Bound the entry count and estimated serialized size, evicting the least
// recently used first.
const MAX_DECODE_CACHE_ENTRIES = 20;
const MAX_DECODE_CACHE_BYTES = 10 * 1024 * 1024;
const decodeCache = new Map<
  string,
  { promise: Promise<Payloads>; bytes: number }
>();
let decodeCacheBytes = 0;
let decodeCacheScope = '';

export function clearCodecDecodeCache(): void {
  decodeCache.clear();
  decodeCacheBytes = 0;
  decodeCacheScope = '';
}

function removeCachedDecode(key: string): void {
  const entry = decodeCache.get(key);
  if (!entry) return;
  decodeCacheBytes -= entry.bytes;
  decodeCache.delete(key);
}

function trimDecodeCache(): void {
  while (
    decodeCache.size > MAX_DECODE_CACHE_ENTRIES ||
    decodeCacheBytes > MAX_DECODE_CACHE_BYTES
  ) {
    removeCachedDecode(decodeCache.keys().next().value!);
  }
}

async function cachedDecode(
  key: string,
  payloads: PotentialPayloads,
  request: () => Promise<Payloads>,
): Promise<Payloads> {
  let entry = decodeCache.get(key);
  if (entry) {
    decodeCache.delete(key);
    decodeCache.set(key, entry);
  } else {
    entry = { promise: request(), bytes: key.length * 2 };
    decodeCache.set(key, entry);
    decodeCacheBytes += entry.bytes;
    trimDecodeCache();

    const pending = entry;
    entry.promise = entry.promise.then(
      (result) => {
        // Failed requests return the original payloads. Do not cache that
        // fallback; opening the payload again must be able to retry decoding.
        if (decodeCache.get(key) === pending) {
          if (result === payloads) {
            removeCachedDecode(key);
          } else {
            const bytes = stringifyWithBigInt(result).length * 2;
            pending.bytes += bytes;
            decodeCacheBytes += bytes;
            trimDecodeCache();
          }
        }
        return result;
      },
      (error) => {
        if (decodeCache.get(key) === pending) removeCachedDecode(key);
        throw error;
      },
    );
  }

  // Callers may parse/mutate payload objects. Keep the cached response intact.
  return parseWithBigInt(stringifyWithBigInt(await entry.promise));
}

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
  cache = false,
}: {
  type: 'decode' | 'encode' | 'download';
  payloads: PotentialPayloads;
  signal?: AbortSignal;
} & CodecDecodeOptions): Promise<Payloads> {
  const settings = page.data.settings;
  const { namespace, workflow, run } = page.params;
  const endpoint = getCodecEndpoint(settings);

  if (!endpoint) {
    clearCodecDecodeCache();
    // Codec payloads are opaque JSON (unknown[]) crossing the REST boundary;
    // downstream consumers treat them as proto Payloads.
    if (type === 'decode') return payloads as unknown as Payloads;
    throw NO_CODEC_SERVER_CONFIGURED_ERROR;
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
      clearCodecDecodeCache();
      setLastDataEncoderFailure();
      return payloads as unknown as Payloads;
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

  // explicitly not constructing a new URL here because it
  // drops any route prefix the user has configured, eg localhost:8080/codec-server
  const url = `${endpoint}/${type}?preserveStorageRefs=true`;

  const scope = stringifyWithBigInt({
    endpoint,
    namespace,
    workflow,
    run,
    passAccessToken,
    includeCredentials,
    headers,
  });
  if (scope !== decodeCacheScope) {
    clearCodecDecodeCache();
    decodeCacheScope = scope;
  }

  const request = () => fetchCodecPayloads(type, payloads, url, requestOptions);
  // Requests with an AbortSignal retain independent cancellation semantics.
  if (BROWSER && cache && type === 'decode' && !signal) {
    return cachedDecode(requestOptions.body, payloads, request);
  }
  return request();
}

async function fetchCodecPayloads(
  type: 'decode' | 'encode' | 'download',
  payloads: PotentialPayloads,
  url: string,
  requestOptions: RequestInit,
): Promise<Payloads> {
  const { signal } = requestOptions;
  const delays = [0, 500, 1000];
  let lastErr: unknown;

  for (let attempt = 0; attempt < delays.length; attempt++) {
    if (attempt > 0) {
      try {
        await delay(delays[attempt], signal ?? undefined);
      } catch {
        break;
      }
    }
    if (signal?.aborted) break;

    try {
      const response = await fetch(url, requestOptions);

      if (response.ok === false) {
        const err = {
          statusCode: response.status,
          statusText: response.statusText,
          response,
          message: translate(`common.${type}-failed`),
        } as NetworkError;

        if (response.status >= 400 && response.status < 500) {
          setLastDataEncoderFailure(err);
          if (type === 'decode') return payloads as unknown as Payloads;
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
  if (type === 'decode') return payloads as unknown as Payloads;
  throw lastErr;
}

export async function decodePayloadsWithCodec({
  payloads,
  cache = false,
}: {
  payloads: PotentialPayloads;
} & CodecDecodeOptions): Promise<Payloads> {
  return codeServerRequest({ type: 'decode', payloads, cache });
}

export async function encodePayloadsWithCodec({
  payloads,
}: {
  payloads: PotentialPayloads;
}): Promise<Payloads> {
  return codeServerRequest({ type: 'encode', payloads });
}

export async function downloadExternalPayloadWithCodec(
  payload: Payload,
): Promise<Payloads> {
  return codeServerRequest({
    type: 'download',
    payloads: { payloads: [payload] },
  });
}
