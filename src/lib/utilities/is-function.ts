// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const isFunction = <T>(fn: any): fn is T => {
  return typeof fn === 'function';
};
