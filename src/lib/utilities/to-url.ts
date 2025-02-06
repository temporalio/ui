export const toURL = (
  url: string,
  params?: URLSearchParams | Record<string, string>,
  hash?: string,
): string => {
  const isURLSearchParams = params instanceof URLSearchParams;
  if (params && !isURLSearchParams) params = new URLSearchParams(params);
  if (params) return `${url}?${params}`;
  if (hash) return `${url}#${hash}`;
  return url;
};
