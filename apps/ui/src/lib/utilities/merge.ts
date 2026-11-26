type KeyValue = { [key: string]: unknown };

export const merge = <T extends KeyValue = KeyValue>(
  first: T = {} as T,
  second: T = {} as T,
): T => {
  const result: KeyValue = { ...first };

  for (const key of Object.keys(second)) {
    const value = result[key];

    if (Array.isArray(value)) {
      result[key] = value.concat(second[key]);
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      result[key] = merge(value as KeyValue, second[key] as KeyValue);
    } else {
      result[key] = second[key];
    }
  }

  return result as T;
};
