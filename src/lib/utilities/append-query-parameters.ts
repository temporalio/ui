export const appendQueryParameters = (
  href: string,
  query: URLSearchParams,
): string => {
  if (!query) return href;
  if (query.toString()) {
    return `${href}?${query}`;
  } else {
    return href;
  }
};
