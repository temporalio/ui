/** Compares numeric event ID strings without converting them to numbers. */
export function compareEventIds(left: string, right: string): number {
  const lengthDifference = left.length - right.length;

  if (lengthDifference) {
    return lengthDifference;
  }

  if (left === right) {
    return 0;
  }

  return left < right ? -1 : 1;
}
