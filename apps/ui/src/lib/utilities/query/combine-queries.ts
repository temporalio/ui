const stripLiterals = (query: string): string =>
  query.replace(/`[^`]*`|"[^"]*"|'[^']*'/g, '');

const stripGroups = (query: string): string => {
  let result = query;
  let previous = '';
  while (result !== previous) {
    previous = result;
    result = result.replace(/\([^()]*\)/g, '');
  }
  return result;
};

const hasUngroupedOr = (query: string): boolean =>
  /\bor\b/i.test(stripGroups(stripLiterals(query)));

const group = (query: string): string =>
  hasUngroupedOr(query) ? `(${query})` : query;

export const combineQueries = (base: string, addition: string): string => {
  const left = (base ?? '').trim();
  const right = (addition ?? '').trim();

  if (!left) return right;
  if (!right) return left;
  if (left === right) return left;

  return `${group(left)} AND ${group(right)}`;
};
