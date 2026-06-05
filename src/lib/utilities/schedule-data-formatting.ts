import { sortNumStrings } from './array';

export function sortAndStringifyNumStrings<T extends `${number}` = `${number}`>(
  numStrings: T[],
) {
  return sortNumStrings(numStrings).join(',');
}
