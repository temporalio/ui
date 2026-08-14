import { describe, expect, it } from 'vitest';

import {
  calendarDateStrToEndOfDayTimestamp,
  calendarDateStrToTimestamp,
  dateAndTimeToTimestamp,
  isoStringToCalendarDateStr,
} from './date';

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

describe('calendarDateStrToEndOfDayTimestamp', () => {
  it('anchors a calendar date to end-of-day of the given timezone', () => {
    expect(calendarDateStrToEndOfDayTimestamp('2026-10-10', 'UTC')).toBe(
      '2026-10-10T23:59:59.000Z',
    );
    // 23:59:59 Eastern (UTC-4 in October) is 03:59:59 UTC the next day.
    expect(
      calendarDateStrToEndOfDayTimestamp('2026-10-10', 'America/New_York'),
    ).toBe('2026-10-11T03:59:59.000Z');
  });

  it('reads back as the same calendar date', () => {
    const timeZone = 'America/New_York';
    expect(
      isoStringToCalendarDateStr(
        calendarDateStrToEndOfDayTimestamp('2026-10-10', timeZone),
        timeZone,
      ),
    ).toBe('2026-10-10');
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

describe('dateAndTimeToTimestamp', () => {
  it('interprets the wall-clock time in the given timezone', () => {
    const date = new Date(2026, 9, 10);

    expect(dateAndTimeToTimestamp(date, 9, 30, 0, 'UTC')).toBe(
      '2026-10-10T09:30:00.000Z',
    );
    // Tokyo is UTC+9 year-round, so 09:30 local is 00:30 UTC.
    expect(dateAndTimeToTimestamp(date, 9, 30, 0, 'Asia/Tokyo')).toBe(
      '2026-10-10T00:30:00.000Z',
    );
  });

  it('accepts string time parts and pads single digits', () => {
    const date = new Date(2026, 9, 10);

    expect(dateAndTimeToTimestamp(date, '9', '5', '7', 'UTC')).toBe(
      '2026-10-10T09:05:07.000Z',
    );
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
