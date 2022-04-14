export const isString = (x: unknown): x is string => typeof x === 'string';

export const isNull = (x: unknown): x is null => x === null;

export const isObject = (x: unknown): x is { unknown: unknown } => {
  if (isNull(x)) return false;
  if (Array.isArray(x)) return false;
  if (typeof x === 'object') return true;
  return false;
};

export const isNumber = (x: unknown): x is number => {
  if (typeof x === 'number') return true;
  return false;
};
