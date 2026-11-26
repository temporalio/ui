import { DAYS_OF_WEEK, WEEKDAYS, WEEKEND } from '../constants';

export type DaysOfWeekClassification =
  | 'everyday'
  | 'weekdays'
  | 'weekends'
  | 'custom';

export function classifyDaysOfWeek(
  days: readonly number[],
): DaysOfWeekClassification {
  if (!days.length) {
    return 'everyday';
  }

  const selected = new Set(days);

  if (DAYS_OF_WEEK.every((d) => selected.has(d))) {
    return 'everyday';
  }

  if (
    selected.size === WEEKDAYS.length &&
    WEEKDAYS.every((d) => selected.has(d))
  ) {
    return 'weekdays';
  }

  if (
    selected.size === WEEKEND.length &&
    WEEKEND.every((d) => selected.has(d))
  ) {
    return 'weekends';
  }

  return 'custom';
}
