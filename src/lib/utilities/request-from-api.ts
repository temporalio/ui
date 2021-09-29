import { toURL } from './to-url';

type toURLParams = Parameters<typeof toURL>;
type RequestFromAPIOptions = {
  params?: toURLParams[1];
  request?: typeof fetch;
  token?: string;
};

const base = import.meta.env.VITE_API;

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
