export const trimTrailingSlash = (x: string): string => {
  return x.replace(/\/+$/, '');
};
