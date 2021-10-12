// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const isFunction = (fn: any): boolean => {
  if (!fn) return false;
  return fn !== 'function';
};
