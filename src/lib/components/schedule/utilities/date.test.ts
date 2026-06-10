import { describe, expect, it } from 'vitest';

import { calendarDateStrToTimestamp, isoStringToCalendarDateStr } from './date';

describe('calendarDateStrToTimestamp', () => {
  it('anchors a calendar date to midnight of the given timezone', () => {
    expect(calendarDateStrToTimestamp('2026-10-10', 'UTC')).toBe(
      '2026-10-10T00:00:00.000Z',
    );
    // Eastern is UTC-4 in October (EDT), so local midnight is 04:00 UTC.
    expect(calendarDateStrToTimestamp('2026-10-10', 'America/New_York')).toBe(
      '2026-10-10T04:00:00.000Z',
    );
  });
});

describe('isoStringToCalendarDateStr', () => {
  it('reads the calendar date in the given timezone', () => {
    expect(
      isoStringToCalendarDateStr(
        '2026-10-10T04:00:00.000Z',
        'America/New_York',
      ),
    ).toBe('2026-10-10');
  });

  it('rolls to the previous day when the instant precedes local midnight', () => {
    // 02:00 UTC is still Oct 9 in Eastern time.
    expect(
      isoStringToCalendarDateStr(
        '2026-10-10T02:00:00.000Z',
        'America/New_York',
      ),
    ).toBe('2026-10-09');
  });
});

describe('calendar date round-trip', () => {
  it('returns the same date in the schedule timezone, independent of viewer', () => {
    const date = '2026-10-10';
    const timeZone = 'America/New_York';

    expect(
      isoStringToCalendarDateStr(
        calendarDateStrToTimestamp(date, timeZone),
        timeZone,
      ),
    ).toBe(date);
  });
});
