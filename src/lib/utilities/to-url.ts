export const toURL = (
  url: string,
  params?: URLSearchParams | Record<string, string>,
): string => {
  const isURLSearchParams = params instanceof URLSearchParams;
  if (params && !isURLSearchParams) params = new URLSearchParams(params);
  if (params) return `${url}?${params}`;
  return url;
};
