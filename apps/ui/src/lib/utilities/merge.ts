type KeyValue = { [key: string]: string | number | boolean };

export const merge = <T = KeyValue>(
  first: T = {} as T,
  second: T = {} as T,
): T => {
  const result = { ...first };

  for (const key of Object.keys(second)) {
    const value = result[key];

    if (Array.isArray(value)) {
      result[key] = result[key].concat(second[key]);
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      result[key] = merge(result[key], second[key]);
    } else {
      result[key] = second[key];
    }
  }

  return result;
};
