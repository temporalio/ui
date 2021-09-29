import { toURL } from './to-url';

type toURLParams = Parameters<typeof toURL>;
type RequestFromAPIOptions = {
  request: typeof fetch;
};

const base = import.meta.env.VITE_API;

export const requestFromAPI = async <T>(
  endpoint: toURLParams[0],
  params: toURLParams[1] = {},
  { request = fetch }: RequestFromAPIOptions,
): Promise<T> => {
  if (!endpoint.startsWith('/')) endpoint = '/' + endpoint;

  const url = toURL(base + endpoint, params);

  const response = await request(url);
  return await response.json();
};
