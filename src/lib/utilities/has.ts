import { isObject } from './is';

export const has = <K extends string, V = unknown>(
  target: unknown,
  property: K,
): target is Record<K, V> => {
  return Object.prototype.hasOwnProperty.call(target, property);
};

export const hasKeys = <K extends Readonly<string[]>>(
  target: unknown,
  ...keys: K
): target is Record<K[number], unknown> => {
  if (!hasAnyKeys) return false;
  for (const key of keys) {
    if (!has(target, key)) return false;
  }
  return true;
};

export const hasAnyKeys = (
  obj: unknown,
): obj is ReturnType<typeof isObject> => {
  if (!isObject(obj)) return false;
  return !!Object.keys(obj).length;
};
