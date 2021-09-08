type KeyValue = { [key: string]: string | number | boolean };

export type URLSearchParamLike = KeyValue | URLSearchParams;

const removeUndefinedValues = (obj: KeyValue): KeyValue => {
  const result = { ...obj };
  Object.keys(result).forEach(
    (key) => result[key] === undefined && delete result[key],
  );
  return result;
};

export const toSearchParams = (query: URLSearchParamLike): URLSearchParams => {
  if (query instanceof URLSearchParams) return query;
  return new URLSearchParams(
    removeUndefinedValues(query) as Record<string, string>,
  );
};

export const urlSearchParamsToObject = (search: URLSearchParams): KeyValue => {
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
