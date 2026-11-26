export const pick = <T, K extends keyof T>(
  source: T,
  ...keys: K[]
): Pick<T, K> => {
  const result: Partial<Pick<T, K>> = {};
  for (const key of keys) {
    result[key] = source[key];
  }
  return result as Pick<T, K>;
};
