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
      expect(summary).toBe('At 09:30 every day');
    });

    it('summarizes weekdays', () => {
      const summary = getScheduleSpecSummary(
        spec({
          kind: 'week',
          calendar: { dayOfWeek: [{ start: 1, end: 5 }] },
        }),
      );
      expect(summary).toBe('At 00:00 on weekdays');
    });

    it('summarizes weekends', () => {
      const summary = getScheduleSpecSummary(
        spec({
          kind: 'week',
          calendar: { dayOfWeek: [{ start: 0 }, { start: 6 }] },
        }),
      );
      expect(summary).toBe('At 00:00 on weekends');
    });

    it('lists individual days', () => {
      const summary = getScheduleSpecSummary(
        spec({
          kind: 'week',
          calendar: { dayOfWeek: [{ start: 1 }, { start: 3 }] },
        }),
      );
      expect(summary).toBe('At 00:00 on Monday and Wednesday');
    });

    it('renders contiguous days as a window', () => {
      const summary = getScheduleSpecSummary(
        spec({
          kind: 'week',
          calendar: { dayOfWeek: [{ start: 1, end: 4 }] },
        }),
      );
      expect(summary).toBe('At 00:00 on Monday-Thursday');
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
      expect(summary).toBe('At 00:00 on day 1 of January');
    });

    it('omits the month fragment when all months are selected', () => {
      const summary = getScheduleSpecSummary(
        spec({
          kind: 'month',
          calendar: {
            dayOfMonth: [{ start: 15 }],
            month: [{ start: 1, end: 12 }],
          },
        }),
      );
      expect(summary).toBe('At 00:00 on day 15');
    });

    it('renders contiguous days of the month as a window', () => {
      const summary = getScheduleSpecSummary(
        spec({
          kind: 'month',
          calendar: { dayOfMonth: [{ start: 1, end: 15 }] },
        }),
      );
      expect(summary).toBe('At 00:00 on days 1-15');
    });

    it('renders contiguous months as a window', () => {
      const summary = getScheduleSpecSummary(
        spec({
          kind: 'month',
          calendar: { month: [{ start: 1, end: 3 }] },
        }),
      );
      expect(summary).toBe('At 00:00 in January-March');
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
      expect(summary).toBe('At 00:00 on weekdays in 2026');
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
      expect(summary).toBe('At 09:00 and 17:00 on weekdays');
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
      expect(summary).toBe('Every 15 minutes every day');
    });

    it('leads with the repetition for restricted days', () => {
      const summary = getScheduleSpecSummary(
        spec({
          kind: 'frozen',
          calendar: {
            second: [{ start: 0, step: 1 }],
            minute: [{ start: 0, end: 59, step: 30 }],
            hour: [{ start: 0, end: 23, step: 1 }],
            dayOfMonth: [{ start: 1, end: 31, step: 1 }],
            month: [{ start: 1, end: 12, step: 1 }],
            dayOfWeek: [{ start: 1, end: 1, step: 1 }],
          },
        }),
      );
      expect(summary).toBe('Every 30 minutes on Monday');
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
      expect(summary).toBe('Every 2 hours on weekdays');
    });

    it('bounds stepped minutes to an hour window', () => {
      const summary = getScheduleSpecSummary(
        spec({
          kind: 'frozen',
          calendar: {
            dayOfWeek: [{ start: 1, end: 5 }],
            minute: [{ start: 0, end: 59, step: 15 }],
            hour: [{ start: 9, end: 17 }],
          },
        }),
      );
      expect(summary).toBe('Every 15 minutes 09:00-17:00 on weekdays');
    });

    it('bounds stepped hours to a window anchored at the fixed minute', () => {
      const summary = getScheduleSpecSummary(
        spec({
          kind: 'frozen',
          calendar: {
            dayOfWeek: [{ start: 1, end: 5 }],
            hour: [{ start: 9, end: 17, step: 2 }],
            minute: [{ start: 30 }],
          },
        }),
      );
      expect(summary).toBe('Every 2 hours 09:30-17:30 on weekdays');
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
      expect(summary).toBe('Every minute every day');
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
      expect(summary).toBe('At 00:00 on weekdays in 2025-2027');
    });

    it('summarizes contiguous hours at a fixed minute as hourly in a window', () => {
      const summary = getScheduleSpecSummary(
        spec({
          kind: 'frozen',
          calendar: {
            dayOfWeek: [{ start: 1, end: 5 }],
            hour: [{ start: 9, end: 17 }],
            minute: [{ start: 0 }],
          },
        }),
      );
      expect(summary).toBe('Every hour 09:00-17:00 on weekdays');
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

    expect(summaries).toEqual(['At 00:00 on weekdays']);
  });

  it('summarizes interval entries', () => {
    const summaries = summarizeScheduleSpec({
      interval: [{ interval: '3600s' }],
    } as ScheduleSpec);

    expect(summaries).toEqual(['Every 1 hour(s) offset by 0 second(s)']);
  });
});
