import { BROWSER } from 'esm-env';

import type { NetworkError } from '$lib/types/global';

import { refreshTokens } from './auth-refresh';
import { handleError as handleRequestError } from './handle-error';
import { isFunction } from './is-function';
import { toURL } from './to-url';
import {
  getAccessToken,
  getIdToken,
  isCloudAuthProvider,
} from './token-provider';

export type TemporalAPIError = {
  code: number;
  message: string;
  details: unknown[];
};

export type RetryCallback = (retriesRemaining: number) => void;

export type APIErrorResponse = {
  status: number;
  statusText: string;
  statusCode?: number;
  body: TemporalAPIError;
};

export type ErrorCallback = (error: APIErrorResponse) => void;

type toURLParams = Parameters<typeof toURL>;

type RequestFromAPIOptions = {
  params?: toURLParams[1];
  request?: typeof fetch;
  options?: Parameters<typeof fetch>[1];
  token?: string;
  onError?: ErrorCallback;
  notifyOnError?: boolean;
  handleError?: typeof handleRequestError;
  isBrowser?: boolean;
  signal?: AbortController['signal'];
};

export const MAX_QUERY_LENGTH = 15000;

export const isTemporalAPIError = (obj: unknown): obj is TemporalAPIError =>
  (obj as TemporalAPIError)?.message !== undefined &&
  typeof (obj as TemporalAPIError)?.message === 'string';

/**
 *  A utility method for making requests to the Temporal API.
 *
 * @param endpoint The path of the API endpoint you want to request data from.
 *
 * @param options.params Query (or search) parameters to be suffixed to the
 * path.
 * @param options.token Shorthand for a `nextPageToken` query parameter.
 * @param options.request A replacement for the native `fetch` function.
 *
 * @returns Promise with the response from the API parsed into an object.
 */
export const requestFromAPI = async <T>(
  endpoint: toURLParams[0],
  init: RequestFromAPIOptions = {},
): Promise<T> => {
  const {
    params = {},
    request = fetch,
    token,
    notifyOnError = true,
    handleError = handleRequestError,
    onError,
    isBrowser = BROWSER,
  } = init;
  let { options } = init;

  let query = new URLSearchParams();
  if (params?.entries) {
    query = params as URLSearchParams;
    if (token) query.set('nextPageToken', token);
  } else {
    const nextPageToken = token ? { next_page_token: token } : {};
    // Filter out undefined values before passing to URLSearchParams
    const paramsWithoutUndefined = Object.fromEntries(
      Object.entries({ ...params, ...nextPageToken }).filter(
        ([_, v]) => v !== undefined,
      ),
    ) as Record<string, string>;
    query = new URLSearchParams(paramsWithoutUndefined);
  }
  const url = toURL(endpoint, query);

  try {
    options = withSecurityOptions(options, isBrowser);
    if (!endpoint.endsWith('api/v1/settings')) {
      options = await withAuth(options);
    }

    const queryIsTooLong = [...query.values()].some(
      (value) => value.length > MAX_QUERY_LENGTH,
    );

    const makeRequest = async () =>
      queryIsTooLong
        ? new Response(
            JSON.stringify({ message: 'Query string is too long' }),
            {
              status: 414,
              statusText: 'URI Too Long',
            },
          )
        : await request(url, options);

    let response = await makeRequest();
    let { status, statusText } = response;

    if (isBrowser && status === 401) {
      if (isCloudAuthProvider()) {
        // Cloud path: getAccessToken() handles refresh internally,
        // so re-calling it gets a fresh token.
        options = withSecurityOptions(init.options, isBrowser);
        if (!endpoint.endsWith('api/v1/settings')) {
          options = await withAuth(options);
        }
        response = await makeRequest();
        status = response.status;
        statusText = response.statusText;
      } else {
        const refreshed = await refreshTokens();
        if (refreshed) {
          options = withSecurityOptions(init.options, isBrowser);
          if (!endpoint.endsWith('api/v1/settings')) {
            options = await withAuth(options);
          }
          response = await makeRequest();
          status = response.status;
          statusText = response.statusText;
        }
      }
    }

    const body = await response.json();

    if (!response.ok) {
      if (onError && isFunction(onError)) {
        onError({ status, statusText, body });
      } else {
        throw {
          statusCode: response.status,
          statusText: response.statusText,
          response,
          message: body?.message ?? response.statusText,
        } as NetworkError;
      }
    }

    return body;
  } catch (error: unknown) {
    if (notifyOnError) {
      handleError(error);
    } else {
      throw error;
    }
  }
};

const withSecurityOptions = (
  options: RequestInit | undefined,
  isBrowser = BROWSER,
): RequestInit => {
  const opts: RequestInit = { credentials: 'include', ...options };
  opts.headers = withCsrf(opts.headers, isBrowser);
  return opts;
};

const withAuth = async (options: RequestInit): Promise<RequestInit> => {
  const headers: Record<string, string> =
    (options.headers as Record<string, string>) ?? {};

  const token = await getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const idToken = await getIdToken();
  if (idToken) {
    headers['Authorization-Extras'] = idToken;
  }

  options.headers = headers;
  return options;
};

const withCsrf = (
  headers: HeadersInit | undefined,
  isBrowser = BROWSER,
): Record<string, string> => {
  const h: Record<string, string> = (headers as Record<string, string>) ?? {};
  h['Caller-Type'] = 'operator';
  if (!isBrowser) return h;

  const csrfCookie = '_csrf=';
  const csrfHeader = 'X-CSRF-TOKEN';
  try {
    const cookies = document.cookie.split(';');
    let csrf = cookies.find((c) => c.includes(csrfCookie));
    if (csrf && !h[csrfHeader]) {
      csrf = csrf.trim().slice(csrfCookie.length);
      h[csrfHeader] = csrf;
    }
    /* c8 ignore next 4 */
  } catch (error) {
    console.error(error);
  }

  return h;
};
