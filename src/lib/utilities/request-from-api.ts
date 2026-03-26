import { BROWSER } from 'esm-env';

import type { NetworkError } from '$lib/types/global';

import {
  type RequestContext,
  runPostResponse,
  runPreRequest,
} from './core-provider';
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

  let query = new URLSearchParams();
  if (params?.entries) {
    query = params as URLSearchParams;
    if (token) query.set('nextPageToken', token);
  } else {
    const nextPageToken = token ? { next_page_token: token } : {};
    const paramsWithoutUndefined = Object.fromEntries(
      Object.entries({ ...params, ...nextPageToken }).filter(
        ([_, v]) => v !== undefined,
      ),
    ) as Record<string, string>;
    query = new URLSearchParams(paramsWithoutUndefined);
  }
  const url = toURL(endpoint, query);

  try {
    const baseOptions: RequestInit = {
      ...init.options,
      headers: withCallerType(init.options?.headers),
    };

    const queryIsTooLong = [...query.values()].some(
      (value) => value.length > MAX_QUERY_LENGTH,
    );

    const executeRequest = async (ctx: {
      url: string;
      options: RequestInit;
    }) =>
      queryIsTooLong
        ? new Response(
            JSON.stringify({ message: 'Query string is too long' }),
            { status: 414, statusText: 'URI Too Long' },
          )
        : await request(ctx.url, ctx.options);

    let context = { url, options: baseOptions };

    if (isBrowser) {
      context = await runPreRequest(context);
    }

    let response = await executeRequest(context);

    if (isBrowser) {
      response = await runPostResponse(response, {
        ...context,
        retry: async () => {
          let retryContext: RequestContext = {
            url,
            options: {
              ...init.options,
              headers: withCallerType(init.options?.headers),
            },
          };
          retryContext = await runPreRequest(retryContext);
          return executeRequest(retryContext);
        },
      });
    }

    const { status, statusText } = response;
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

const withCallerType = (
  headers: HeadersInit | undefined,
): Record<string, string> => {
  const h: Record<string, string> = (headers as Record<string, string>) ?? {};
  h['Caller-Type'] = 'operator';
  return h;
};
