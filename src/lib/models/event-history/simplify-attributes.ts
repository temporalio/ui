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

export const simplifyAttributes = (
  attributes: EventAttributesWithType,
): EventAttributesWithType => {
  for (const [key, value] of Object.entries(attributes)) {
    if (canBeSimplified(value)) {
      attributes[key] = getValueForFirstKey(value);
    }
  }

  return attributes;
};
