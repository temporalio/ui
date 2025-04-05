export const isFunction = <T>(fn: unknown): fn is T => {
  return typeof fn === 'function';
};
