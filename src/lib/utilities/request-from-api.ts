import { toURL } from './to-url';

type toURLParams = Parameters<typeof toURL>;
type RequestFromAPIOptions = {
  params?: toURLParams[1];
  request?: typeof fetch;
  token?: string;
};

const base = import.meta.env.VITE_API;

/**
 *  A utility method for making requests to the Temporal API.
 *
 * @param endpoint The path of the API endpoint you want to request data from.
 *
 * @param options Additional options to be used when making the API request.
 * @param options.params Query (or search) parameters to be suffixed to the
 * path.
 * @param options.token Shorthand for a `nextPageToken` query parameter.
 * @param options.request A replacement for the native `fetch` function.
 *
 * @returns Promise with the response from the API parsed into an object.
 */
export const requestFromAPI = async <T>(
  endpoint: toURLParams[0],
  { params = {}, request = fetch, token }: RequestFromAPIOptions = {},
): Promise<T> => {
  if (!endpoint.startsWith('/')) endpoint = '/' + endpoint;
  const nextPageToken = token ? { next_page_token: token } : {};

  const url = toURL(base + endpoint, { ...params, ...nextPageToken });

  const response = await request(url);
  return await response.json();
};
