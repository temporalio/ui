import { describe, expect, it } from 'vitest';

import type { ScheduleRange } from '$lib/types/schedule';

import { structuredCalendarToFrequency } from './schedule-frequency-formatting';

const generateCalendar = ({
  minute = 0,
  hour = 0,
  month = [],
  dayOfWeek = [],
  dayOfMonth = [],
}: {
  minute?: number;
  hour?: number;
  month?: ScheduleRange[];
  dayOfWeek?: ScheduleRange[];
  dayOfMonth?: ScheduleRange[];
}) => {
  return {
    second: [{ start: 0, end: 0, step: 1 }],
    minute: [{ start: minute, end: minute, step: 1 }],
    hour: [{ start: hour, end: hour, step: 1 }],
    month: month.length ? month : [{ start: 1, end: 12, step: 1 }],
    year: [],
    dayOfMonth: dayOfMonth.length
      ? dayOfMonth
      : [{ start: 1, end: 31, step: 1 }],
    dayOfWeek: dayOfWeek.length ? dayOfWeek : [{ start: 0, end: 6, step: 1 }],
  };
};

describe('structuredCalendarToFrequency', () => {
  it(`daily default frequency`, () => {
    const calendar = generateCalendar({});
    const expected = 'Daily at 12:00am UTC';
    expect(structuredCalendarToFrequency(calendar)).toBe(expected);
  });
  it(`daily custom am frequency`, () => {
    const calendar = generateCalendar({ hour: 3, minute: 57 });
    const expected = 'Daily at 03:57am UTC';
    expect(structuredCalendarToFrequency(calendar)).toBe(expected);
  });
  it(`daily custom pm frequency`, () => {
    const calendar = generateCalendar({ hour: 16, minute: 12 });
    const expected = 'Daily at 04:12pm UTC';
    expect(structuredCalendarToFrequency(calendar)).toBe(expected);
  });

  it(`single day of week frequency at noon`, () => {
    const dayOfWeek: ScheduleRange = [{ start: 3, end: 3, step: 1 }];
    const calendar = generateCalendar({ hour: 12, minute: 0, dayOfWeek });
    const expected = 'Wednesday at 12:00pm UTC';
    expect(structuredCalendarToFrequency(calendar)).toBe(expected);
  });
  it(`two days of week frequency at 8pm`, () => {
    const dayOfWeek: ScheduleRange = [
      { start: 0, end: 0, step: 1 },
      { start: 5, end: 5, step: 1 },
    ];
    const calendar = generateCalendar({ hour: 20, minute: 0, dayOfWeek });
    const expected = 'Sunday, Friday at 08:00pm UTC';
    expect(structuredCalendarToFrequency(calendar)).toBe(expected);
  });
  it(`multiple days of week frequency`, () => {
    const dayOfWeek: ScheduleRange = [
      { start: 1, end: 1, step: 1 },
      { start: 5, end: 5, step: 1 },
      { start: 6, end: 6, step: 1 },
    ];
    const calendar = generateCalendar({ dayOfWeek });
    const expected = 'Monday, Friday, Saturday at 12:00am UTC';
    expect(structuredCalendarToFrequency(calendar)).toBe(expected);
  });
  it(`range of days of week frequency`, () => {
    const dayOfWeek: ScheduleRange = [{ start: 1, end: 5, step: 1 }];
    const calendar = generateCalendar({ dayOfWeek });
    const expected = 'Monday - Friday at 12:00am UTC';
    expect(structuredCalendarToFrequency(calendar)).toBe(expected);
  });

  it(`single day of every month`, () => {
    const dayOfMonth: ScheduleRange = [{ start: 1, end: 1, step: 1 }];
    const calendar = generateCalendar({ dayOfMonth });
    const expected = 'Every 1 of the month at 12:00am UTC';
    expect(structuredCalendarToFrequency(calendar)).toBe(expected);
  });
  it(`single day of one month`, () => {
    const dayOfMonth: ScheduleRange = [{ start: 1, end: 1, step: 1 }];
    const month: ScheduleRange = [{ start: 1, end: 1, step: 1 }];
    const calendar = generateCalendar({ dayOfMonth, month });
    const expected = 'Every 1 of January at 12:00am UTC';
    expect(structuredCalendarToFrequency(calendar)).toBe(expected);
  });
  it(`single day of multiple months`, () => {
    const dayOfMonth: ScheduleRange = [{ start: 25, end: 25, step: 1 }];
    const month: ScheduleRange = [
      { start: 3, end: 3, step: 1 },
      { start: 7, end: 7, step: 1 },
    ];
    const calendar = generateCalendar({ dayOfMonth, month });
    const expected = 'Every 25 of March, July at 12:00am UTC';
    expect(structuredCalendarToFrequency(calendar)).toBe(expected);
  });
  it(`multiple days of multiple months`, () => {
    const dayOfMonth: ScheduleRange = [
      { start: 1, end: 1, step: 1 },
      { start: 15, end: 15, step: 1 },
      { start: 30, end: 30, step: 1 },
    ];
    const month: ScheduleRange = [
      { start: 3, end: 3, step: 1 },
      { start: 7, end: 7, step: 1 },
      { start: 10, end: 10, step: 1 },
      { start: 12, end: 12, step: 1 },
    ];
    const calendar = generateCalendar({ dayOfMonth, month });
    const expected =
      'Every 1, 15, 30 of March, July, October, December at 12:00am UTC';
    expect(structuredCalendarToFrequency(calendar)).toBe(expected);
  });
  it(`multiple days of range of months`, () => {
    const dayOfMonth: ScheduleRange = [
      { start: 1, end: 1, step: 1 },
      { start: 15, end: 15, step: 1 },
      { start: 30, end: 30, step: 1 },
    ];
    const month: ScheduleRange = [{ start: 1, end: 4, step: 1 }];
    const calendar = generateCalendar({ dayOfMonth, month });
    const expected = 'Every 1, 15, 30 of January - April at 12:00am UTC';
    expect(structuredCalendarToFrequency(calendar)).toBe(expected);
  });
});
