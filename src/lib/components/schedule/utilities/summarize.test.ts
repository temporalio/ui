import { describe, expect, it } from 'vitest';

import { getScheduleSpecSummary, summarizeScheduleSpec } from './summarize';
import { formSpecSchema, type FormSpecSchema } from '../schema/form';

import type { ScheduleSpec } from '$types';

const spec = (input: unknown): FormSpecSchema => formSpecSchema.parse(input);

describe('getScheduleSpecSummary', () => {
  it('returns an empty string for a none spec', () => {
    expect(getScheduleSpecSummary({ kind: 'none' } as FormSpecSchema)).toBe('');
  });

  describe('cron', () => {
    it('describes a valid cron string', () => {
      const summary = getScheduleSpecSummary(
        spec({ kind: 'cron', cronString: '0 12 * * *' }),
      );
      expect(summary).toContain('12:00');
    });

    it('returns an empty string for an invalid cron string', () => {
      expect(
        getScheduleSpecSummary({
          kind: 'cron',
          cronString: 'nonsense',
        } as FormSpecSchema),
      ).toBe('');
    });
  });

  describe('week', () => {
    it('summarizes every day of the week', () => {
      const summary = getScheduleSpecSummary(
        spec({
          kind: 'week',
          calendar: {
            dayOfWeek: [{ start: 0, end: 6 }],
            hour: [{ start: 9 }],
            minute: [{ start: 30 }],
          },
        }),
      );
      expect(summary).toBe('Everyday at 09:30');
    });

    it('summarizes weekdays', () => {
      const summary = getScheduleSpecSummary(
        spec({
          kind: 'week',
          calendar: { dayOfWeek: [{ start: 1, end: 5 }] },
        }),
      );
      expect(summary).toBe('Weekdays at 00:00');
    });

    it('summarizes weekends', () => {
      const summary = getScheduleSpecSummary(
        spec({
          kind: 'week',
          calendar: { dayOfWeek: [{ start: 0 }, { start: 6 }] },
        }),
      );
      expect(summary).toBe('Weekends at 00:00');
    });

    it('lists individual days', () => {
      const summary = getScheduleSpecSummary(
        spec({
          kind: 'week',
          calendar: { dayOfWeek: [{ start: 1 }, { start: 3 }] },
        }),
      );
      expect(summary).toContain('Monday');
      expect(summary).toContain('Wednesday');
    });
  });

  describe('month', () => {
    it('summarizes a specific day and month', () => {
      const summary = getScheduleSpecSummary(
        spec({
          kind: 'month',
          calendar: { dayOfMonth: [{ start: 1 }], month: [{ start: 1 }] },
        }),
      );
      expect(summary).toContain('day 1');
      expect(summary).toContain('January');
    });

    it('summarizes every month when all months are selected', () => {
      const summary = getScheduleSpecSummary(
        spec({
          kind: 'month',
          calendar: {
            dayOfMonth: [{ start: 15 }],
            month: [{ start: 1, end: 12 }],
          },
        }),
      );
      expect(summary).toContain('every month');
    });
  });

  describe('interval', () => {
    it('summarizes the interval and offset', () => {
      const summary = getScheduleSpecSummary(
        spec({ kind: 'interval', interval: { interval: '3600s' } }),
      );
      expect(summary).toBe('Every 1 hour(s) offset by 0 second(s)');
    });

    it('returns an empty string when no interval is set', () => {
      expect(
        getScheduleSpecSummary({
          kind: 'interval',
          interval: {},
        } as FormSpecSchema),
      ).toBe('');
    });
  });

  describe('frozen', () => {
    it('uses the interval summary when an interval is present', () => {
      const summary = getScheduleSpecSummary(
        spec({ kind: 'frozen', interval: { interval: '60s' } }),
      );
      expect(summary).toBe('Every 1 minute(s) offset by 0 second(s)');
    });

    it('appends the year when one is pinned', () => {
      const summary = getScheduleSpecSummary(
        spec({
          kind: 'frozen',
          calendar: {
            dayOfWeek: [{ start: 1, end: 5 }],
            year: [{ start: 2026 }],
          },
        }),
      );
      expect(summary).toContain('Weekdays');
      expect(summary).toContain('2026');
    });

    it('lists every time when the calendar has multiple hour ranges', () => {
      const summary = getScheduleSpecSummary(
        spec({
          kind: 'frozen',
          calendar: {
            dayOfWeek: [{ start: 1, end: 5 }],
            hour: [{ start: 9 }, { start: 17 }],
            minute: [{ start: 0 }],
          },
        }),
      );
      expect(summary).toBe('Weekdays at 09:00 and 17:00');
    });

    it('summarizes a stepped minute range as every n minutes', () => {
      const summary = getScheduleSpecSummary(
        spec({
          kind: 'frozen',
          calendar: {
            minute: [{ start: 0, end: 59, step: 15 }],
            hour: [{ start: 0, end: 23 }],
          },
        }),
      );
      expect(summary).toContain('every 15 minutes');
    });

    it('summarizes a stepped hour range as every n hours', () => {
      const summary = getScheduleSpecSummary(
        spec({
          kind: 'frozen',
          calendar: {
            dayOfWeek: [{ start: 1, end: 5 }],
            hour: [{ start: 0, end: 22, step: 2 }],
            minute: [{ start: 0 }],
          },
        }),
      );
      expect(summary).toBe('Weekdays every 2 hours');
    });

    it('summarizes full minute and hour ranges as every minute', () => {
      const summary = getScheduleSpecSummary(
        spec({
          kind: 'frozen',
          calendar: {
            minute: [{ start: 0, end: 59 }],
            hour: [{ start: 0, end: 23 }],
          },
        }),
      );
      expect(summary).toContain('every minute');
    });

    it('appends every year when several are pinned', () => {
      const summary = getScheduleSpecSummary(
        spec({
          kind: 'frozen',
          calendar: {
            dayOfWeek: [{ start: 1, end: 5 }],
            year: [{ start: 2025, end: 2027 }],
          },
        }),
      );
      expect(summary).toContain('Weekdays');
      expect(summary).toContain('2025');
      expect(summary).toContain('2026');
      expect(summary).toContain('2027');
    });
  });
});

describe('summarizeScheduleSpec', () => {
  it('returns an empty array for missing input', () => {
    expect(summarizeScheduleSpec(null)).toEqual([]);
    expect(summarizeScheduleSpec(undefined)).toEqual([]);
  });

  it('summarizes each structured calendar entry', () => {
    const summaries = summarizeScheduleSpec({
      structuredCalendar: [{ dayOfWeek: [{ start: 1, end: 5 }] }],
    } as ScheduleSpec);

    expect(summaries).toEqual(['Weekdays at 00:00']);
  });

  it('summarizes interval entries', () => {
    const summaries = summarizeScheduleSpec({
      interval: [{ interval: '3600s' }],
    } as ScheduleSpec);

    expect(summaries).toEqual(['Every 1 hour(s) offset by 0 second(s)']);
  });
});
