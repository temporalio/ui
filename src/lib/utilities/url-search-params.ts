export type URLSearchParamLike =
  | { [key: string]: string | number | boolean }
  | URLSearchParams;

export const toSearchParams = (query: URLSearchParamLike) => {
  if (query instanceof URLSearchParams) return query;
  return new URLSearchParams(query as Record<string, string>);
};

export const urlSearchParamsToObject = (search: URLSearchParams) => {
  return search
    .toString()
    .split('&')
    .map((param) => param.split('='))
    .reduce((result: { [key: string]: string }, pair: string[]) => {
      const [key, value] = pair;
      return { ...result, [key]: value };
    }, {});
};

export const mergeSearchParams = (
  first: URLSearchParams,
  second: URLSearchParams,
): URLSearchParams => {
  return toSearchParams({
    ...urlSearchParamsToObject(first),
    ...urlSearchParamsToObject(second),
  });
};
