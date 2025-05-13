export const toURL = (
  url: string,
  params?: URLSearchParams | Record<string, string>,
  hash?: string,
): string => {
  const isURLSearchParams = params instanceof URLSearchParams;
  if (params && !isURLSearchParams) params = new URLSearchParams(params);
  if (params) url = `${url}?${params}`;
  if (hash) url = `${url}#${hash}`;
  return url;
};
