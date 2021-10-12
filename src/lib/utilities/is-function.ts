// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const isFunction = (fn: any): boolean => {
  if (!(fn instanceof Function)) return false;
  if (typeof fn !== 'function') return false;
  return true;
};
