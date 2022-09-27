import { browser } from '$app/env';
import { getUser } from '$lib/stores/user';
import { noop } from 'svelte/internal';
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
  body: TemporalAPIError;
};

export type ErrorCallback = (error: APIErrorResponse) => void;

type toURLParams = Parameters<typeof toURL>;

type RequestFromAPIOptions = {
  params?: toURLParams[1];
  request?: typeof fetch;
  options?: Parameters<typeof fetch>[1];
  token?: string;
  onRetry?: RetryCallback;
  onError?: ErrorCallback;
  notifyOnError?: boolean;
  handleError?: typeof handleRequestError;
  shouldRetry?: boolean;
  retryInterval?: number;
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
  retryCount = 10,
): Promise<T> => {
  const {
    params = {},
    request = fetch,
    token,
    shouldRetry = false,
    notifyOnError = true,
    handleError = handleRequestError,
    onRetry = noop,
    onError,
    retryInterval = 5000,
    isBrowser = browser,
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

      if (shouldRetry && retryCount > 0) {
        return new Promise((resolve) => {
          const retriesRemaining = retryCount - 1;
          onRetry(retriesRemaining);
          setTimeout(() => {
            resolve(requestFromAPI(endpoint, init, retriesRemaining));
          }, retryInterval);
        });
      }
    } else {
      throw error;
    }
  }
};

const withSecurityOptions = (
  options: RequestInit,
  isBrowser = browser,
): RequestInit => {
  const opts: RequestInit = { credentials: 'include', ...options };
  opts.headers = withCsrf(options?.headers, isBrowser);
  return opts;
};

const withAuth = async (
  options: RequestInit,
  isBrowser = browser,
): Promise<RequestInit> => {
  if (getUser().accessToken) {
    options.headers = await withBearerToken(
      options?.headers,
      async () => getUser().accessToken,
      isBrowser,
    );
    options.headers = withIdToken(
      options?.headers,
      getUser().idToken,
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
  isBrowser = browser,
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
  isBrowser = browser,
): HeadersInit => {
  if (!isBrowser) return headers;

  if (idToken) {
    headers['Authorization-Extras'] = idToken;
  }

  return headers;
};

const withCsrf = (headers: HeadersInit, isBrowser = browser): HeadersInit => {
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
