export const has = (target: unknown, property: string): boolean => {
  return Object.prototype.hasOwnProperty.call(target, property);
};
