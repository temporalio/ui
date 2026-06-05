export function sortNumStrings<T extends `${number}` = `${number}`>(
  numStrings: T[],
  direction: 'ascending' | 'descending' = 'ascending',
): T[] {
  if (direction === 'ascending') {
    return numStrings.toSorted((a, b) => Number(a) - Number(b));
  }

  return numStrings.toSorted((a, b) => Number(b) - Number(a));
}
