export const sortAlphabetically = <T = string>(
  list: T[],
  key: (item: T) => string = (item) => item as unknown as string,
): T[] => [...list].sort((a, b) => key(a).localeCompare(key(b)));
