import { describe, expect, it } from 'vitest';

import { calendarDateStrToTimestamp, isoStringToCalendarDateStr } from './date';

describe('calendarDateStrToTimestamp', () => {
  it('pins a calendar date to UTC midnight', () => {
    expect(calendarDateStrToTimestamp('2026-10-10')).toBe(
      '2026-10-10T00:00:00.000Z',
    );
  });
});

describe('isoStringToCalendarDateStr', () => {
  it('reads the UTC calendar date from an instant', () => {
    expect(isoStringToCalendarDateStr('2026-10-10T00:00:00.000Z')).toBe(
      '2026-10-10',
    );
  });

  it('uses the UTC day regardless of the time of day', () => {
    expect(isoStringToCalendarDateStr('2026-10-10T23:59:59.000Z')).toBe(
      '2026-10-10',
    );
  });
});

describe('calendar date round-trip', () => {
  it('returns the same date it started with', () => {
    const date = '2026-10-10';
    expect(isoStringToCalendarDateStr(calendarDateStrToTimestamp(date))).toBe(
      date,
    );
  });
});
