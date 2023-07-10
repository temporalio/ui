import { describe, expect, it } from 'vitest';

import {
  convertDaysAndMonths,
  timeToInterval,
} from './schedule-data-formatting';

describe('convertDaysAndMonths', () => {
  it(`should return days and months if empty`, () => {
    const months = [];
    const daysOfMonth = [];
    const daysOfWeek = [];
    const { month, dayOfMonth, dayOfWeek } = convertDaysAndMonths({
      months,
      daysOfMonth,
      daysOfWeek,
    });
    expect(month).toBe('');
    expect(dayOfMonth).toBe('');
    expect(dayOfWeek).toBe('');
  });

  it(`should return all months`, () => {
    const months = ['*'];
    const { month } = convertDaysAndMonths({ months });
    expect(month).toBe('*');
  });

  it(`should return single month`, () => {
    const months = ['7'];
    const { month } = convertDaysAndMonths({ months });
    expect(month).toBe('7');
  });

  it(`should return sorted months`, () => {
    const months = ['4', '8', '1', '12'];
    const { month } = convertDaysAndMonths({ months });
    expect(month).toBe('1,4,8,12');
  });

  it(`should return single day of month`, () => {
    const daysOfMonth = [10];
    const { dayOfMonth } = convertDaysAndMonths({ daysOfMonth });
    expect(dayOfMonth).toBe('10');
  });

  it(`should return sorted days of month`, () => {
    const daysOfMonth = [19, 31, 1, 29, 8, 20, 4];
    const { dayOfMonth } = convertDaysAndMonths({ daysOfMonth });
    expect(dayOfMonth).toBe('1,4,8,19,20,29,31');
  });

  it(`should return all days of week`, () => {
    const daysOfWeek = ['*'];
    const { dayOfWeek } = convertDaysAndMonths({ daysOfWeek });
    expect(dayOfWeek).toBe('*');
  });

  it(`should return a single day of week`, () => {
    const daysOfWeek = ['5'];
    const { dayOfWeek } = convertDaysAndMonths({ daysOfWeek });
    expect(dayOfWeek).toBe('5');
  });

  it(`should return weekdays of week`, () => {
    const daysOfWeek = ['1,2,3,4,5'];
    const { dayOfWeek } = convertDaysAndMonths({ daysOfWeek });
    expect(dayOfWeek).toBe('1,2,3,4,5');
  });

  it(`should return weekends of week`, () => {
    const daysOfWeek = ['6,7'];
    const { dayOfWeek } = convertDaysAndMonths({ daysOfWeek });
    expect(dayOfWeek).toBe('6,7');
  });

  it(`should return sorted range of days of week`, () => {
    const daysOfWeek = ['6', '2', '5', '1'];
    const { dayOfWeek } = convertDaysAndMonths({ daysOfWeek });
    expect(dayOfWeek).toBe('1,2,5,6');
  });

  it(`should return sorted range of weekdays of week`, () => {
    const daysOfWeek = ['5', '4', '3', '2', '1'];
    const { dayOfWeek } = convertDaysAndMonths({ daysOfWeek });
    expect(dayOfWeek).toBe('1,2,3,4,5');
  });
});

describe('timeToInterval', () => {
  it(`should return correct interval for only day`, () => {
    const interval = timeToInterval('45', '', '', '');
    expect(interval).toBe('3888000s');
  });

  it(`should return correct interval for days and hours`, () => {
    const interval = timeToInterval('3', '6', '', '');
    expect(interval).toBe('280800s');
  });

  it(`should return correct interval for days and hours and minutes`, () => {
    const interval = timeToInterval('3', '6', '20', '');
    expect(interval).toBe('282000s');
  });

  it(`should return correct interval for days and hours and minutes and seconds`, () => {
    const interval = timeToInterval('3', '6', '20', '5');
    expect(interval).toBe('282005s');
  });

  it(`should return correct interval for only hours`, () => {
    const interval = timeToInterval('', '8', '', '');
    expect(interval).toBe('28800s');
  });

  it(`should return correct interval for hours and minutes`, () => {
    const interval = timeToInterval('', '4', '23', '');
    expect(interval).toBe('15780s');
  });

  it(`should return correct interval for hours and minutes and seconds`, () => {
    const interval = timeToInterval('', '4', '30', '17');
    expect(interval).toBe('16217s');
  });

  it(`should return correct interval for only minutes`, () => {
    const interval = timeToInterval('', '', '10', '');
    expect(interval).toBe('600s');
  });

  it(`should return correct interval for minutes and seconds`, () => {
    const interval = timeToInterval('', '', '30', '30');
    expect(interval).toBe('1830s');
  });

  it(`should return correct interval for only seconds`, () => {
    const interval = timeToInterval('', '', '', '30');
    expect(interval).toBe('30s');
  });
});
