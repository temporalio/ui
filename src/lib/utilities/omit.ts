const getKeys = <T>(object: T): Iterable<keyof T> => {
  return Object.keys(object) as unknown as Iterable<keyof T>;
};

export const omit = <T>(object: T, ...keys: (keyof T)[]) => {
  const result = {} as Record<keyof T, T[keyof T]>;

  for (const key of getKeys(object)) {
    if (!keys.includes(key) && typeof key === 'string') {
      result[key] = object[key];
    }
  }

  return result;
};
