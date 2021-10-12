// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const isFunction = (fn: any): fn is Function => {
  return fn !== 'function';
};
