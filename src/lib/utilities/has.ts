import { isObject } from './is';

export const has = <K extends string, V = unknown>(
  target: unknown,
  property: K,
): target is Record<K, V> => {
  return Object.prototype.hasOwnProperty.call(target, property);
};

export const hasKeys = (obj: {
  [key: string | number | symbol]: unknown;
}): boolean => {
  if (!isObject(obj)) return false;
  return !!Object.keys(obj).length;
};
