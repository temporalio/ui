import { describe, expect, it } from 'vitest';

import { getScheduleSpecSummary, getSpecSummary } from './spec';

describe('getSpecSummary', () => {
  it('summarizes a daily week spec with zero-padded 24h time', () => {
    expect(
      getSpecSummary({
        type: 'week',
        daysOfWeek: ['0', '1', '2', '3', '4', '5', '6'],
        time: { hour: 8, minute: 30 },
      }),
    ).toBe('Everyday at 08:30 UTC');
  });

  it('respects the timezone argument', () => {
    expect(
      getSpecSummary(
        {
          type: 'week',
          daysOfWeek: ['0', '1', '2', '3', '4', '5', '6'],
          time: { hour: 8, minute: 30 },
        },
        'America/New_York',
      ),
    ).toBe('Everyday at 08:30 America/New_York');
  });

  it('summarizes weekdays', () => {
    expect(
      getSpecSummary({
        type: 'week',
        daysOfWeek: ['1', '2', '3', '4', '5'],
        time: { hour: 9, minute: 0 },
      }),
    ).toBe('Weekdays at 09:00 UTC');
  });

  it('summarizes an interval spec', () => {
    expect(
      getSpecSummary({ type: 'interval', interval: '300s', phase: '0s' }),
    ).toMatch(/^Every 5 .* offset by 0 /);
  });

  it('returns an empty string for an unspecified spec', () => {
    expect(getSpecSummary({ type: 'unspecified' })).toBe('');
  });
});

describe('getScheduleSpecSummary (proto -> canonical -> summary)', () => {
  it('returns an empty string when there are no specs', () => {
    expect(getScheduleSpecSummary({})).toBe('');
    expect(getScheduleSpecSummary(null)).toBe('');
  });

  it('matches getSpecSummary for an equivalent weekly structured calendar', () => {
    const proto = {
      structuredCalendar: [
        {
          hour: [{ start: 8, end: 8, step: 1 }],
          minute: [{ start: 30, end: 30, step: 1 }],
          dayOfWeek: [{ start: 1, end: 5, step: 1 }],
        },
      ],
    };

    expect(getScheduleSpecSummary(proto)).toBe(
      getSpecSummary({
        type: 'week',
        daysOfWeek: ['1', '2', '3', '4', '5'],
        time: { hour: 8, minute: 30 },
      }),
    );
    expect(getScheduleSpecSummary(proto)).toBe('Weekdays at 08:30 UTC');
  });

  it('matches getSpecSummary for an equivalent monthly structured calendar', () => {
    const proto = {
      structuredCalendar: [
        {
          hour: [{ start: 0, end: 0, step: 1 }],
          minute: [{ start: 0, end: 0, step: 1 }],
          dayOfMonth: [{ start: 1, end: 1, step: 1 }],
          month: [{ start: 1, end: 1, step: 1 }],
        },
      ],
    };

    expect(getScheduleSpecSummary(proto)).toBe(
      getSpecSummary({
        type: 'month',
        daysOfMonth: ['1'],
        months: ['1'],
        time: { hour: 0, minute: 0 },
      }),
    );
  });

  it('turns a structured-calendar cron comment into a cron summary', () => {
    expect(
      getScheduleSpecSummary({
        structuredCalendar: [{ comment: '0 30 8 * * 1-5' }],
      }),
    ).toMatch(/8:30/);
  });

  it('summarizes proto intervals', () => {
    expect(
      getScheduleSpecSummary({ interval: [{ interval: '300s', phase: '0s' }] }),
    ).toMatch(/^Every 5 /);
  });

  it('joins multiple specs with a semicolon', () => {
    const summary = getScheduleSpecSummary({
      cronString: ['0 0 * * *'],
      interval: [{ interval: '300s', phase: '0s' }],
    });

    expect(summary.split(';')).toHaveLength(2);
  });
});
