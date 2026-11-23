const splitOnce = (
  value: string,
  separator: string,
): [string, string | undefined] => {
  const index = value.indexOf(separator);
  if (index === -1) {
    return [value, undefined];
  }
  return [value.slice(0, index), value.slice(index + 1)];
};

export const toURL = (
  url: string,
  params?: URLSearchParams | Record<string, string>,
  hash?: string,
): string => {
  const [withoutHash, existingHash] = splitOnce(url, '#');
  const [path, existingQuery] = splitOnce(withoutHash, '?');
  const searchParams =
    params && !(params instanceof URLSearchParams)
      ? new URLSearchParams(params)
      : params;

  let query = existingQuery;
  if (searchParams && existingQuery !== undefined) {
    const merged = new URLSearchParams(existingQuery);
    for (const key of new Set(searchParams.keys())) {
      const [firstValue, ...otherValues] = searchParams.getAll(key);
      merged.set(key, firstValue);
      for (const value of otherValues) {
        merged.append(key, value);
      }
    }
    query = merged.toString();
  } else if (searchParams) {
    query = searchParams.toString();
  }

  let result = path;
  if (query !== undefined) {
    result = `${result}?${query}`;
  }
  const nextHash = hash || existingHash;
  if (nextHash) {
    result = `${result}#${nextHash}`;
  }
  return result;
};
