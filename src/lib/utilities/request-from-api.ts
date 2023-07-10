import { BROWSER } from 'esm-env';

import { getAuthUser } from '$lib/stores/auth-user';
import type { NetworkError } from '$lib/types/global';

import { handleError as handleRequestError } from './handle-error';
import { isFunction } from './is-function';
import { toURL } from './to-url';

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
};

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

  const nextPageToken = token ? { next_page_token: token } : {};
  const query = new URLSearchParams({
    ...params,
    ...nextPageToken,
  });
  const url = toURL(endpoint, query);

  try {
    options = withSecurityOptions(options, isBrowser);
    options = await withAuth(options, isBrowser);

    const response = await request(url, options);
    const body = await response.json();

    const { status, statusText } = response;

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
  options: RequestInit,
  isBrowser = BROWSER,
): RequestInit => {
  const opts: RequestInit = { credentials: 'include', ...options };
  opts.headers = withCsrf(options?.headers, isBrowser);
  return opts;
};

const withAuth = async (
  options: RequestInit,
  isBrowser = BROWSER,
): Promise<RequestInit> => {
  if (getAuthUser().accessToken) {
    options.headers = await withBearerToken(
      options?.headers,
      async () => getAuthUser().accessToken,
      isBrowser,
    );
    options.headers = withIdToken(
      options?.headers,
      getAuthUser().idToken,
      isBrowser,
    );
  } else if (globalThis?.AccessToken) {
    options.headers = await withBearerToken(
      options?.headers,
      globalThis.AccessToken,
      isBrowser,
    );
  }

  return options;
};

const withBearerToken = async (
  headers: HeadersInit,
  accessToken: () => Promise<string>,
  isBrowser = BROWSER,
): Promise<HeadersInit> => {
  // At this point in the code path, headers will always be set.
  /* c8 ignore next */
  if (!headers) headers = {};
  if (!isBrowser) return headers;

  try {
    const token = await accessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    /* c8 ignore next 4 */
  } catch (e) {
    console.error(e);
  }

  return headers;
};

const withIdToken = (
  headers: HeadersInit = {},
  idToken: string,
  isBrowser = BROWSER,
): HeadersInit => {
  if (!isBrowser) return headers;

  if (idToken) {
    headers['Authorization-Extras'] = idToken;
  }

  return headers;
};

const withCsrf = (headers: HeadersInit, isBrowser = BROWSER): HeadersInit => {
  if (!headers) headers = {};
  if (!isBrowser) return headers;

  const csrfCookie = '_csrf=';
  const csrfHeader = 'X-CSRF-TOKEN';
  try {
    const cookies = document.cookie.split(';');
    let csrf = cookies.find((c) => c.includes(csrfCookie));
    if (csrf && !headers[csrfHeader]) {
      csrf = csrf.trim().slice(csrfCookie.length);
      headers[csrfHeader] = csrf;
    }
    /* c8 ignore next 4 */
  } catch (error) {
    console.error(error);
  }

  return headers;
};
