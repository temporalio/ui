import { toSearchParams, URLSearchParamLike } from './url-search-params';

export const toURL = (url: string, params?: URLSearchParamLike): string => {
  let result = url;
  const paramsAsString = toSearchParams(params).toString();

  if (paramsAsString) result += '?' + paramsAsString;

  return result;
};
