import { describe, expect, it } from 'vitest';

import {
  getCalendarSpecLabel,
  getIntervalLabel,
  getScheduleSpecLabel,
} from './schedule-spec-label';

describe('getIntervalLabel', () => {
  it('should return empty string for zero interval', () => {
    expect(getIntervalLabel({ interval: { seconds: '0', nanos: 0 } })).toBe('');
  });

  it('should return empty string for missing interval', () => {
    expect(getIntervalLabel({})).toBe('');
  });

  it('should handle every 5 minutes', () => {
    expect(getIntervalLabel({ interval: { seconds: '300', nanos: 0 } })).toBe(
      'Every 5 minutes',
    );
  });

  it('should handle every 10 minutes', () => {
    expect(getIntervalLabel({ interval: { seconds: '600', nanos: 0 } })).toBe(
      'Every 10 minutes',
    );
  });

  it('should handle every 30 minutes', () => {
    expect(getIntervalLabel({ interval: { seconds: '1800', nanos: 0 } })).toBe(
      'Every 30 minutes',
    );
  });

  it('should handle every hour', () => {
    expect(getIntervalLabel({ interval: { seconds: '3600', nanos: 0 } })).toBe(
      'Every 1 hour',
    );
  });

  it('should handle every 5 hours', () => {
    expect(getIntervalLabel({ interval: { seconds: '18000', nanos: 0 } })).toBe(
      'Every 5 hours',
    );
  });

  it('should handle every 12 hours', () => {
    expect(getIntervalLabel({ interval: { seconds: '43200', nanos: 0 } })).toBe(
      'Every 12 hours',
    );
  });

  it('should handle every day', () => {
    expect(getIntervalLabel({ interval: { seconds: '86400', nanos: 0 } })).toBe(
      'Every 1 day',
    );
  });

  it('should handle every 2 days', () => {
    expect(
      getIntervalLabel({ interval: { seconds: '172800', nanos: 0 } }),
    ).toBe('Every 2 days');
  });

  it('should handle phase offset', () => {
    expect(
      getIntervalLabel({
        interval: { seconds: '3600', nanos: 0 },
        phase: { seconds: '1800', nanos: 0 },
      }),
    ).toBe('Every 1 hour, offset by 30 minutes');
  });

  it('should handle string format interval', () => {
    expect(getIntervalLabel({ interval: '18000s', phase: '0s' })).toBe(
      'Every 5 hours',
    );
  });

  it('should handle string format with phase', () => {
    expect(getIntervalLabel({ interval: '3600s', phase: '900s' })).toBe(
      'Every 1 hour, offset by 15 minutes',
    );
  });

  it('should handle numeric seconds field', () => {
    expect(getIntervalLabel({ interval: { seconds: 300, nanos: 0 } })).toBe(
      'Every 5 minutes',
    );
  });

  it('should handle non-standard durations in seconds', () => {
    expect(getIntervalLabel({ interval: { seconds: '45', nanos: 0 } })).toBe(
      'Every 45 seconds',
    );
  });

  it('should handle large interval of 7 days', () => {
    expect(
      getIntervalLabel({ interval: { seconds: '604800', nanos: 0 } }),
    ).toBe('Every 7 days');
  });

  it('should handle large interval of 30 days', () => {
    expect(
      getIntervalLabel({ interval: { seconds: '2592000', nanos: 0 } }),
    ).toBe('Every 30 days');
  });

  it('should handle mixed duration of days and hours', () => {
    expect(getIntervalLabel({ interval: { seconds: '90000', nanos: 0 } })).toBe(
      'Every 1 day, 1 hour',
    );
  });

  it('should handle mixed duration of hours and minutes', () => {
    expect(getIntervalLabel({ interval: { seconds: '5450', nanos: 0 } })).toBe(
      'Every 1 hour, 30 minutes, 50 seconds',
    );
  });
});

describe('getCalendarSpecLabel', () => {
  it('should return empty string for empty specs', () => {
    expect(getCalendarSpecLabel([])).toBe('');
  });

  it('should return cron comment when present', () => {
    expect(getCalendarSpecLabel([{ comment: '0 30 8 * * 1-5' }])).toBe(
      '0 30 8 * * 1-5',
    );
  });

  it('should handle every day at specific time', () => {
    expect(
      getCalendarSpecLabel([
        {
          second: [{ start: 0, end: 0, step: 1 }],
          minute: [{ start: 30, end: 30, step: 1 }],
          hour: [{ start: 8, end: 8, step: 1 }],
          dayOfMonth: [{ start: 1, end: 31, step: 1 }],
          month: [{ start: 1, end: 12, step: 1 }],
          dayOfWeek: [{ start: 0, end: 6, step: 1 }],
        },
      ]),
    ).toBe('Every day at 8:30 AM UTC');
  });

  it('should handle every weekday at specific time', () => {
    expect(
      getCalendarSpecLabel([
        {
          second: [{ start: 0, end: 0, step: 1 }],
          minute: [{ start: 30, end: 30, step: 1 }],
          hour: [{ start: 8, end: 8, step: 1 }],
          dayOfMonth: [{ start: 1, end: 31, step: 1 }],
          month: [{ start: 1, end: 12, step: 1 }],
          dayOfWeek: [
            { start: 1, end: 1, step: 1 },
            { start: 2, end: 2, step: 1 },
            { start: 3, end: 3, step: 1 },
            { start: 4, end: 4, step: 1 },
            { start: 5, end: 5, step: 1 },
          ],
        },
      ]),
    ).toBe('Every weekday at 8:30 AM UTC');
  });

  it('should handle weekdays with range shorthand', () => {
    expect(
      getCalendarSpecLabel([
        {
          minute: [{ start: 0 }],
          hour: [{ start: 9 }],
          dayOfWeek: [{ start: 1, end: 5, step: 1 }],
        },
      ]),
    ).toBe('Every weekday at 9:00 AM UTC');
  });

  it('should handle every weekend at specific time', () => {
    expect(
      getCalendarSpecLabel([
        {
          minute: [{ start: 0 }],
          hour: [{ start: 10 }],
          dayOfWeek: [{ start: 0 }, { start: 6 }],
        },
      ]),
    ).toBe('Every weekend at 10:00 AM UTC');
  });

  it('should handle specific days of the week', () => {
    expect(
      getCalendarSpecLabel([
        {
          minute: [{ start: 0 }],
          hour: [{ start: 14 }],
          dayOfWeek: [{ start: 1 }, { start: 3 }, { start: 5 }],
        },
      ]),
    ).toBe('Every Monday, Wednesday, Friday at 2:00 PM UTC');
  });

  it('should handle monthly on specific day', () => {
    expect(
      getCalendarSpecLabel([
        {
          minute: [{ start: 0 }],
          hour: [{ start: 8 }],
          dayOfMonth: [{ start: 15 }],
        },
      ]),
    ).toBe('Monthly on the 15th at 8:00 AM UTC');
  });

  it('should handle monthly on the 1st', () => {
    expect(
      getCalendarSpecLabel([
        {
          minute: [{ start: 0 }],
          hour: [{ start: 0 }],
          dayOfMonth: [{ start: 1 }],
        },
      ]),
    ).toBe('Monthly on the 1st at 12:00 AM UTC');
  });

  it('should handle every unique end of month for a year', () => {
    expect(
      getCalendarSpecLabel([
        {
          minute: [{ start: 0 }],
          hour: [{ start: 0 }],
          dayOfMonth: [{ start: 31 }],
          month: [
            {
              start: 1,
              end: 1,
              step: 1,
            },
          ],
        },
        {
          minute: [{ start: 0 }],
          hour: [{ start: 0 }],
          dayOfMonth: [{ start: 28 }],
          month: [
            {
              start: 2,
              end: 2,
              step: 1,
            },
          ],
        },
        {
          minute: [{ start: 0 }],
          hour: [{ start: 0 }],
          dayOfMonth: [{ start: 31 }],
          month: [
            {
              start: 3,
              end: 3,
              step: 1,
            },
          ],
        },
        {
          minute: [{ start: 0 }],
          hour: [{ start: 0 }],
          dayOfMonth: [{ start: 30 }],
          month: [
            {
              start: 4,
              end: 4,
              step: 1,
            },
          ],
        },
        {
          minute: [{ start: 0 }],
          hour: [{ start: 0 }],
          dayOfMonth: [{ start: 31 }],
          month: [
            {
              start: 5,
              end: 5,
              step: 1,
            },
          ],
        },
        {
          minute: [{ start: 0 }],
          hour: [{ start: 0 }],
          dayOfMonth: [{ start: 30 }],
          month: [
            {
              start: 6,
              end: 6,
              step: 1,
            },
          ],
        },
        {
          minute: [{ start: 0 }],
          hour: [{ start: 0 }],
          dayOfMonth: [{ start: 31 }],
          month: [
            {
              start: 7,
              end: 7,
              step: 1,
            },
          ],
        },
        {
          minute: [{ start: 0 }],
          hour: [{ start: 0 }],
          dayOfMonth: [{ start: 31 }],
          month: [
            {
              start: 8,
              end: 8,
              step: 1,
            },
          ],
        },
        {
          minute: [{ start: 0 }],
          hour: [{ start: 0 }],
          dayOfMonth: [{ start: 30 }],
          month: [
            {
              start: 9,
              end: 9,
              step: 1,
            },
          ],
        },
        {
          minute: [{ start: 0 }],
          hour: [{ start: 0 }],
          dayOfMonth: [{ start: 31 }],
          month: [
            {
              start: 10,
              end: 10,
              step: 1,
            },
          ],
        },
        {
          minute: [{ start: 0 }],
          hour: [{ start: 0 }],
          dayOfMonth: [{ start: 30 }],
          month: [
            {
              start: 11,
              end: 11,
              step: 1,
            },
          ],
        },
        {
          minute: [{ start: 0 }],
          hour: [{ start: 0 }],
          dayOfMonth: [{ start: 31 }],
          month: [
            {
              start: 12,
              end: 12,
              step: 1,
            },
          ],
        },
      ]),
    ).toBe(
      'Annually on January 31st at 12:00 AM UTC; Annually on February 28th at 12:00 AM UTC; Annually on March 31st at 12:00 AM UTC; Annually on April 30th at 12:00 AM UTC; Annually on May 31st at 12:00 AM UTC; Annually on June 30th at 12:00 AM UTC; Annually on July 31st at 12:00 AM UTC; Annually on August 31st at 12:00 AM UTC; Annually on September 30th at 12:00 AM UTC; Annually on October 31st at 12:00 AM UTC; Annually on November 30th at 12:00 AM UTC; Annually on December 31st at 12:00 AM UTC',
    );
  });

  it('should handle annual schedule', () => {
    expect(
      getCalendarSpecLabel([
        {
          minute: [{ start: 0 }],
          hour: [{ start: 9 }],
          dayOfMonth: [{ start: 25 }],
          month: [{ start: 12 }],
        },
      ]),
    ).toBe('Annually on December 25th at 9:00 AM UTC');
  });

  it('should handle multiple times per day', () => {
    expect(
      getCalendarSpecLabel([
        {
          minute: [{ start: 0 }],
          hour: [{ start: 9 }, { start: 17 }],
        },
      ]),
    ).toBe('Every day at 9:00 AM and 5:00 PM UTC');
  });

  it('should handle midnight', () => {
    expect(
      getCalendarSpecLabel([
        {
          minute: [{ start: 0 }],
          hour: [{ start: 0 }],
        },
      ]),
    ).toBe('Every day at 12:00 AM UTC');
  });

  it('should handle noon', () => {
    expect(
      getCalendarSpecLabel([
        {
          minute: [{ start: 0 }],
          hour: [{ start: 12 }],
        },
      ]),
    ).toBe('Every day at 12:00 PM UTC');
  });

  it('should handle custom timezone', () => {
    expect(
      getCalendarSpecLabel(
        [
          {
            minute: [{ start: 30 }],
            hour: [{ start: 8 }],
          },
        ],
        'America/New_York',
      ),
    ).toBe('Every day at 8:30 AM America/New_York');
  });

  it('should handle multiple calendar specs', () => {
    expect(
      getCalendarSpecLabel([
        {
          minute: [{ start: 0 }],
          hour: [{ start: 9 }],
          dayOfWeek: [{ start: 1, end: 5, step: 1 }],
        },
        {
          minute: [{ start: 0 }],
          hour: [{ start: 12 }],
          dayOfWeek: [{ start: 0 }, { start: 6 }],
        },
      ]),
    ).toBe('Every weekday at 9:00 AM UTC; Every weekend at 12:00 PM UTC');
  });

  it('should handle three times per day', () => {
    expect(
      getCalendarSpecLabel([
        {
          minute: [{ start: 0 }],
          hour: [{ start: 8 }, { start: 12 }, { start: 18 }],
        },
      ]),
    ).toBe('Every day at 8:00 AM, 12:00 PM, and 6:00 PM UTC');
  });

  it('should produce fallback for complex patterns', () => {
    const label = getCalendarSpecLabel([
      {
        minute: [{ start: 0 }],
        hour: [{ start: 9 }],
        dayOfMonth: [{ start: 1 }, { start: 15 }],
        month: [{ start: 3 }, { start: 6 }, { start: 9 }],
        dayOfWeek: [{ start: 1 }],
      },
    ]);
    expect(label).toContain('March');
    expect(label).toContain('Monday');
  });

  it('should handle weekday mornings and weekend afternoons as separate specs', () => {
    expect(
      getCalendarSpecLabel([
        {
          minute: [{ start: 0 }],
          hour: [{ start: 7 }],
          dayOfWeek: [{ start: 1, end: 5, step: 1 }],
        },
        {
          minute: [{ start: 0 }],
          hour: [{ start: 14 }],
          dayOfWeek: [{ start: 0 }, { start: 6 }],
        },
      ]),
    ).toBe('Every weekday at 7:00 AM UTC; Every weekend at 2:00 PM UTC');
  });

  it('should handle quarterly schedule on the 1st', () => {
    expect(
      getCalendarSpecLabel([
        {
          minute: [{ start: 0 }],
          hour: [{ start: 9 }],
          dayOfMonth: [{ start: 1 }],
          month: [{ start: 1 }],
        },
        {
          minute: [{ start: 0 }],
          hour: [{ start: 9 }],
          dayOfMonth: [{ start: 1 }],
          month: [{ start: 4 }],
        },
        {
          minute: [{ start: 0 }],
          hour: [{ start: 9 }],
          dayOfMonth: [{ start: 1 }],
          month: [{ start: 7 }],
        },
        {
          minute: [{ start: 0 }],
          hour: [{ start: 9 }],
          dayOfMonth: [{ start: 1 }],
          month: [{ start: 10 }],
        },
      ]),
    ).toBe(
      'Annually on January 1st at 9:00 AM UTC; Annually on April 1st at 9:00 AM UTC; Annually on July 1st at 9:00 AM UTC; Annually on October 1st at 9:00 AM UTC',
    );
  });

  it('should handle every other day via step', () => {
    const label = getCalendarSpecLabel([
      {
        minute: [{ start: 0 }],
        hour: [{ start: 6 }],
        dayOfWeek: [{ start: 0, end: 6, step: 2 }],
      },
    ]);
    expect(label).toBe(
      'Every Sunday, Tuesday, Thursday, Saturday at 6:00 AM UTC',
    );
  });

  it('should handle single day Sunday', () => {
    expect(
      getCalendarSpecLabel([
        {
          minute: [{ start: 0 }],
          hour: [{ start: 8 }],
          dayOfWeek: [{ start: 0 }],
        },
      ]),
    ).toBe('Every Sunday at 8:00 AM UTC');
  });

  it('should handle four times per day on weekdays', () => {
    expect(
      getCalendarSpecLabel([
        {
          minute: [{ start: 0 }],
          hour: [{ start: 6 }, { start: 10 }, { start: 14 }, { start: 18 }],
          dayOfWeek: [{ start: 1, end: 5, step: 1 }],
        },
      ]),
    ).toBe('Every weekday at 6:00 AM, 10:00 AM, 2:00 PM, and 6:00 PM UTC');
  });

  it('should handle bi-monthly on the 15th', () => {
    const label = getCalendarSpecLabel([
      {
        minute: [{ start: 0 }],
        hour: [{ start: 12 }],
        dayOfMonth: [{ start: 15 }],
        month: [{ start: 1, end: 12, step: 2 }],
      },
    ]);
    expect(label).toContain('January');
    expect(label).toContain('15th');
    expect(label).toContain('12:00 PM');
  });

  it('should handle multiple days of month', () => {
    const label = getCalendarSpecLabel([
      {
        minute: [{ start: 0 }],
        hour: [{ start: 9 }],
        dayOfMonth: [{ start: 1 }, { start: 15 }],
      },
    ]);
    expect(label).toContain('1st');
    expect(label).toContain('15th');
  });
});

describe('getScheduleSpecLabel', () => {
  it('should return empty string for empty spec', () => {
    expect(getScheduleSpecLabel({})).toBe('');
  });

  it('should dispatch to calendar spec', () => {
    expect(
      getScheduleSpecLabel({
        structuredCalendar: [
          {
            minute: [{ start: 30 }],
            hour: [{ start: 8 }],
            dayOfWeek: [{ start: 1, end: 5, step: 1 }],
          },
        ],
      }),
    ).toBe('Every weekday at 8:30 AM UTC');
  });

  it('should dispatch to interval spec', () => {
    expect(
      getScheduleSpecLabel({
        interval: [{ interval: { seconds: '18000', nanos: 0 } }],
      }),
    ).toBe('Every 5 hours');
  });

  it('should handle both calendar and interval', () => {
    expect(
      getScheduleSpecLabel({
        structuredCalendar: [
          {
            minute: [{ start: 0 }],
            hour: [{ start: 9 }],
          },
        ],
        interval: [{ interval: { seconds: '3600', nanos: 0 } }],
      }),
    ).toBe('Every day at 9:00 AM UTC; Every 1 hour');
  });

  it('should handle multiple intervals', () => {
    expect(
      getScheduleSpecLabel({
        interval: [
          { interval: { seconds: '3600', nanos: 0 } },
          { interval: { seconds: '300', nanos: 0 } },
        ],
      }),
    ).toBe('Every 1 hour; Every 5 minutes');
  });

  it('should pass timezone to calendar spec', () => {
    expect(
      getScheduleSpecLabel(
        {
          structuredCalendar: [
            {
              minute: [{ start: 0 }],
              hour: [{ start: 17 }],
            },
          ],
        },
        'Europe/London',
      ),
    ).toBe('Every day at 5:00 PM Europe/London');
  });

  it('should handle calendar specs with intervals combined', () => {
    expect(
      getScheduleSpecLabel({
        structuredCalendar: [
          {
            minute: [{ start: 0 }],
            hour: [{ start: 9 }],
            dayOfWeek: [{ start: 1, end: 5, step: 1 }],
          },
          {
            minute: [{ start: 0 }],
            hour: [{ start: 12 }],
            dayOfWeek: [{ start: 0 }, { start: 6 }],
          },
        ],
        interval: [{ interval: { seconds: '1800', nanos: 0 } }],
      }),
    ).toBe(
      'Every weekday at 9:00 AM UTC; Every weekend at 12:00 PM UTC; Every 30 minutes',
    );
  });

  it('should handle empty calendar with intervals', () => {
    expect(
      getScheduleSpecLabel({
        structuredCalendar: [],
        interval: [{ interval: { seconds: '7200', nanos: 0 } }],
      }),
    ).toBe('Every 2 hours');
  });

  it('should handle calendar with empty intervals', () => {
    expect(
      getScheduleSpecLabel({
        structuredCalendar: [
          {
            minute: [{ start: 30 }],
            hour: [{ start: 14 }],
          },
        ],
        interval: [],
      }),
    ).toBe('Every day at 2:30 PM UTC');
  });
});
