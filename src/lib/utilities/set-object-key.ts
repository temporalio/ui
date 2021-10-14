const isLast = (path: string[]) => path.length === 0;

export const set = <T = Record<string, unknown>>(
  object: T,
  path: string | string[],
  value: unknown,
): T => {
  let current = object;
  if (!Array.isArray(path)) path = path.split('.');

  while (path.length) {
    const segment = path.shift();
    if (isLast(path)) {
      current[segment] = value;
    } else {
      if (typeof current[segment] === 'undefined') current[segment] = {};
      current = current[segment];
    }
  }

  return object;
};
