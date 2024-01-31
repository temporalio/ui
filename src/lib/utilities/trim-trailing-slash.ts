export const trimTrailingSlash = (x: string): string => {
  return x.endsWith('/') ? x.slice(0, -1) : x;
};
