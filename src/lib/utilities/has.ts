import { isObject } from './is';

export const has = <K extends Readonly<string[]>, V = unknown>(
  target: unknown,
  ...properties: K
): target is Record<K[number], V> => {
  if (!hasAnyKeys(target)) return false;
  for (const property of properties) {
    if (!Object.prototype.hasOwnProperty.call(target, property)) return false;
  }
  return true;
};

export const hasAnyKeys = (
  obj: unknown,
): obj is ReturnType<typeof isObject> => {
  if (!isObject(obj)) return false;
  return !!Object.keys(obj).length;
};
