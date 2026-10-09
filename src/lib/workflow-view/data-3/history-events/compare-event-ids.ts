import type { HistoryEventId } from './types';

/** Compares numeric event ID strings without converting them to numbers. */
export function compareEventIds(
  left: HistoryEventId,
  right: HistoryEventId,
): number {
  const lengthDifference = left.length - right.length;

  if (lengthDifference) {
    return lengthDifference;
  }

  if (left === right) {
    return 0;
  }

  return left < right ? -1 : 1;
}
