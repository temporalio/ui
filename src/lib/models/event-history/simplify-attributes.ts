import type { PendingActivityInfo } from '$types';

const canBeSimplified = (value: unknown): value is Record<string, string> => {
  if (value === null) return false;
  if (value === undefined) return false;
  if (typeof value !== 'object') return false;

  const keys = Object.keys(value);
  const [key] = keys;

  if (keys.length !== 1) return false;
  if (typeof value[key] !== 'string') return false;

  return true;
};

const getValueForFirstKey = (value: Record<string, string>): string => {
  for (const v of Object.values(value)) {
    return v;
  }
};

export function simplifyAttributes(
  attributes: EventAttributesWithType,
): EventAttributesWithType;
export function simplifyAttributes(
  attributes: PendingActivityInfo,
): PendingActivityInfo;
export function simplifyAttributes(
  attributes: EventAttributesWithType | PendingActivityInfo,
): EventAttributesWithType | PendingActivityInfo {
  for (const [key, value] of Object.entries(attributes)) {
    if (canBeSimplified(value)) {
      attributes[key] = getValueForFirstKey(value);
    }
  }

  return attributes;
}
