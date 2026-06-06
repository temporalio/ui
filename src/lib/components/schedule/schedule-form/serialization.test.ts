import { describe, expect, it } from 'vitest';

import type { FullSchedule } from '$lib/types/schedule';

import { scheduleToFormData } from './serialization';

const baseParams = {
  searchAttributes: {},
  customSearchAttributes: {},
  scheduleId: 'test-schedule',
};

const getValues = (schedule: FullSchedule | null) =>
  scheduleToFormData({ ...baseParams, schedule });

describe('scheduleToFormData spec parsing', () => {
  it('parses a weekly structuredCalendar (IRange[]) into a week spec', () => {
    const schedule = {
      spec: {
        structuredCalendar: [
          {
            dayOfWeek: [{ start: 1, end: 5, step: 1 }],
            hour: [{ start: 9, end: 9 }],
            minute: [{ start: 30, end: 30 }],
          },
        ],
      },
    } as unknown as FullSchedule;

    const { specs } = getValues(schedule);

    expect(specs).toHaveLength(1);
    expect(specs[0]).toEqual({
      type: 'week',
      daysOfWeek: ['1', '2', '3', '4', '5'],
      time: { hour: 9, minute: 30 },
    });
  });

  it('parses a monthly structuredCalendar (IRange[]) into a month spec', () => {
    const schedule = {
      spec: {
        structuredCalendar: [
          {
            dayOfMonth: [
              { start: 1, end: 1 },
              { start: 15, end: 15 },
            ],
            month: [{ start: 6, end: 6 }],
            hour: [{ start: 0, end: 0 }],
            minute: [{ start: 0, end: 0 }],
          },
        ],
      },
    } as unknown as FullSchedule;

    const { specs } = getValues(schedule);

    expect(specs).toHaveLength(1);
    expect(specs[0]).toEqual({
      type: 'month',
      daysOfMonth: ['1', '15'],
      months: ['6'],
      time: { hour: 0, minute: 0 },
    });
  });

  it('parses the deprecated string calendar form', () => {
    const schedule = {
      spec: {
        calendar: [
          {
            dayOfWeek: '1,3,5',
            hour: '8',
            minute: '0',
          },
        ],
      },
    } as unknown as FullSchedule;

    const { specs } = getValues(schedule);

    expect(specs[0]).toEqual({
      type: 'week',
      daysOfWeek: ['1', '3', '5'],
      time: { hour: 8, minute: 0 },
    });
  });

  it('restores the "after N occurrences" end condition from limitedActions', () => {
    const schedule = {
      spec: { interval: [{ interval: '300s', phase: '0s' }] },
      state: { limitedActions: true, remainingActions: 5 },
    } as unknown as FullSchedule;

    const values = getValues(schedule);

    expect(values.endDateType).toBe('after');
    expect(values.endAfterOccurrences).toBe(5);
  });

  it('defaults end condition to never without an end time or limited actions', () => {
    const schedule = {
      spec: { interval: [{ interval: '300s', phase: '0s' }] },
      state: {},
    } as unknown as FullSchedule;

    const values = getValues(schedule);

    expect(values.endDateType).toBe('never');
    expect(values.endAfterOccurrences).toBeUndefined();
  });
});
