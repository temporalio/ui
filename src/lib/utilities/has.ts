export const has = (target: unknown, property: string): boolean => {
  return Object.prototype.hasOwnProperty.call(target, property);
};

export const hasKeys = (obj: {
  [key: string | number | symbol]: unknown;
}): boolean => {
  return !!Object.keys(obj).length;
};
