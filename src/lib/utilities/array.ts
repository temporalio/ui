export function sortNumbers<T extends number = number>(
  nums: T[],
  direction: 'ascending' | 'descending' = 'ascending',
): T[] {
  if (direction === 'ascending') {
    return nums.toSorted((a, b) => a - b);
  }

  return nums.toSorted((a, b) => b - a);
}
