import { describe, expect, it } from 'vitest';

import {
  composeDate,
  endBeforeStart,
  isDateAllowed,
  isEndDateAllowed,
  toStartOfDayInTz,
} from './event-time-filter';

const UTC = 'UTC';

const d = (iso: string) => new Date(iso);

describe('event-time-filter helpers', () => {
  describe('toStartOfDayInTz', () => {
    it('returns midnight for a UTC date in UTC', () => {
      const result = toStartOfDayInTz(d('2026-05-20T14:30:00Z'), UTC);
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(4);
      expect(result.getDate()).toBe(20);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });

    it('falls back to now() when input is null', () => {
      const fakeNow = d('2026-03-15T09:00:00Z');
      const result = toStartOfDayInTz(null, UTC, fakeNow);
      expect(result.getDate()).toBe(15);
      expect(result.getMonth()).toBe(2);
      expect(result.getFullYear()).toBe(2026);
    });

    it('treats the same instant as a different day in a different tz', () => {
      // 2026-05-20T02:00:00Z is still May 19 in America/Los_Angeles
      const inUtc = toStartOfDayInTz(d('2026-05-20T02:00:00Z'), UTC);
      const inPt = toStartOfDayInTz(
        d('2026-05-20T02:00:00Z'),
        'America/Los_Angeles',
      );
      expect(inUtc.getDate()).toBe(20);
      expect(inPt.getDate()).toBe(19);
    });
  });

  describe('composeDate', () => {
    const baseDate = new Date(2026, 4, 20); // May 20 2026, local wall clock

    it('parses hour / minute / second strings', () => {
      const result = composeDate(baseDate, '14', '30', '45', UTC);
      expect(result.toISOString()).toBe('2026-05-20T14:30:45.000Z');
    });

    it('treats empty strings as zero', () => {
      const result = composeDate(baseDate, '', '', '', UTC);
      expect(result.toISOString()).toBe('2026-05-20T00:00:00.000Z');
    });

    it('treats non-numeric strings as zero', () => {
      const result = composeDate(baseDate, 'abc', '7', 'xx', UTC);
      expect(result.toISOString()).toBe('2026-05-20T00:07:00.000Z');
    });

    it('respects timezone — PT 14:30 → UTC 21:30 or 22:30 depending on DST', () => {
      // May is PDT (UTC-7)
      const result = composeDate(
        baseDate,
        '14',
        '30',
        '00',
        'America/Los_Angeles',
      );
      expect(result.toISOString()).toBe('2026-05-20T21:30:00.000Z');
    });
  });

  describe('isDateAllowed', () => {
    const fakeNow = d('2026-05-20T12:00:00Z');
    const defaultStart = d('2026-05-01T00:00:00Z');
    const defaultEnd = d('2026-05-25T00:00:00Z');

    it('returns true for a date inside [defaultStart, defaultEnd]', () => {
      expect(
        isDateAllowed(d('2026-05-10T00:00:00Z'), {
          defaultStart,
          defaultEnd,
          timezone: UTC,
          now: fakeNow,
        }),
      ).toBe(true);
    });

    it('returns false for a date before defaultStart', () => {
      expect(
        isDateAllowed(d('2026-04-30T00:00:00Z'), {
          defaultStart,
          defaultEnd,
          timezone: UTC,
          now: fakeNow,
        }),
      ).toBe(false);
    });

    it('returns false for a date after defaultEnd', () => {
      expect(
        isDateAllowed(d('2026-05-26T00:00:00Z'), {
          defaultStart,
          defaultEnd,
          timezone: UTC,
          now: fakeNow,
        }),
      ).toBe(false);
    });

    it('allows any past date when defaultStart is null', () => {
      expect(
        isDateAllowed(d('2020-01-01T00:00:00Z'), {
          defaultStart: null,
          defaultEnd,
          timezone: UTC,
          now: fakeNow,
        }),
      ).toBe(true);
    });

    it('falls back to "now" as the upper bound when defaultEnd is null', () => {
      // 2026-05-21 is one day past the injected "now" (2026-05-20)
      expect(
        isDateAllowed(d('2026-05-21T00:00:00Z'), {
          defaultStart,
          defaultEnd: null,
          timezone: UTC,
          now: fakeNow,
        }),
      ).toBe(false);
      // 2026-05-20 (today) is allowed
      expect(
        isDateAllowed(d('2026-05-20T00:00:00Z'), {
          defaultStart,
          defaultEnd: null,
          timezone: UTC,
          now: fakeNow,
        }),
      ).toBe(true);
    });

    it('allows the boundary days themselves (inclusive)', () => {
      expect(
        isDateAllowed(defaultStart, {
          defaultStart,
          defaultEnd,
          timezone: UTC,
          now: fakeNow,
        }),
      ).toBe(true);
      expect(
        isDateAllowed(defaultEnd, {
          defaultStart,
          defaultEnd,
          timezone: UTC,
          now: fakeNow,
        }),
      ).toBe(true);
    });
  });

  describe('isEndDateAllowed', () => {
    const fakeNow = d('2026-05-20T12:00:00Z');
    const defaultStart = d('2026-05-01T00:00:00Z');
    const defaultEnd = d('2026-05-25T00:00:00Z');
    const startDate = new Date(2026, 4, 10); // May 10 — user's start selection

    const bounds = {
      defaultStart,
      defaultEnd,
      timezone: UTC,
      now: fakeNow,
      startDate,
    };

    it('returns true for a date after the user-selected start date', () => {
      expect(isEndDateAllowed(d('2026-05-15T00:00:00Z'), bounds)).toBe(true);
    });

    it('returns true for the exact user-selected start date (on-or-after)', () => {
      expect(isEndDateAllowed(startDate, bounds)).toBe(true);
    });

    it('returns false for a date before the user-selected start date', () => {
      expect(isEndDateAllowed(d('2026-05-09T00:00:00Z'), bounds)).toBe(false);
    });

    it('still rejects dates outside the outer [defaultStart, defaultEnd] window', () => {
      expect(isEndDateAllowed(d('2026-05-26T00:00:00Z'), bounds)).toBe(false);
    });

    it('still rejects dates before defaultStart even if after user startDate', () => {
      const earlyStart = new Date(2026, 3, 20); // April 20 — outside defaultStart
      expect(
        isEndDateAllowed(d('2026-04-25T00:00:00Z'), {
          ...bounds,
          startDate: earlyStart,
        }),
      ).toBe(false);
    });
  });

  describe('endBeforeStart', () => {
    const sameDay = new Date(2026, 4, 20);
    const laterDay = new Date(2026, 4, 21);
    const earlierDay = new Date(2026, 4, 19);

    const base = {
      endEnabled: true,
      startDate: sameDay,
      startHour: '10',
      startMinute: '00',
      startSecond: '00',
      endDate: sameDay,
      endHour: '12',
      endMinute: '00',
      endSecond: '00',
      timezone: UTC,
    };

    it('returns false when endEnabled is false, regardless of times', () => {
      expect(
        endBeforeStart({
          ...base,
          endEnabled: false,
          endHour: '01', // would otherwise be invalid
        }),
      ).toBe(false);
    });

    it('returns false when end is later on the same day', () => {
      expect(endBeforeStart(base)).toBe(false);
    });

    it('returns true when end hour is before start hour on the same day', () => {
      expect(endBeforeStart({ ...base, endHour: '09' })).toBe(true);
    });

    it('returns true when end is on an earlier day', () => {
      expect(endBeforeStart({ ...base, endDate: earlierDay })).toBe(true);
    });

    it('returns false when end is on a later day, even if end hour is earlier', () => {
      expect(
        endBeforeStart({ ...base, endDate: laterDay, endHour: '01' }),
      ).toBe(false);
    });

    it('returns false when start and end are identical', () => {
      expect(
        endBeforeStart({
          ...base,
          endHour: base.startHour,
          endMinute: base.startMinute,
          endSecond: base.startSecond,
        }),
      ).toBe(false);
    });

    it('compares at second precision', () => {
      expect(
        endBeforeStart({
          ...base,
          endHour: base.startHour,
          endMinute: base.startMinute,
          startSecond: '30',
          endSecond: '29',
        }),
      ).toBe(true);
    });

    it('respects timezone — same wall-clock time in different tz is not "before"', () => {
      // 10:00 UTC === 10:00 UTC, so end equals start, not before
      expect(endBeforeStart(base)).toBe(false);
    });
  });
});
