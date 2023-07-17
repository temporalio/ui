import { describe, expect, it } from 'vitest';

import {
  calendarToComment,
  intervalToComment,
} from './schedule-comment-formatting';
import { timeToInterval } from './schedule-data-formatting';

describe('calendarToComment', () => {
  describe('format days of week calendar', () => {
    it(`should return correct comment for weekends`, () => {
      const options = {
        preset: 'week',
        month: '',
        dayOfMonth: '',
        dayOfWeek: '6,7',
        hour: '12',
        minute: '30',
      };

      expect(calendarToComment(options)).toBe('Weekends at 12:30pm');
    });

    it(`should return correct comment for weekdays`, () => {
      const options = {
        preset: 'week',
        month: '',
        dayOfMonth: '',
        dayOfWeek: '1,2,3,4,5',
        hour: '17',
        minute: '46',
      };

      expect(calendarToComment(options)).toBe('Weekdays at 05:46pm');
    });

    it(`should return correct comment for a range of days`, () => {
      const options = {
        preset: 'week',
        month: '',
        dayOfMonth: '',
        dayOfWeek: '1,2,5',
        hour: '4',
        minute: '15',
      };

      expect(calendarToComment(options)).toBe(
        'Monday, Tuesday, Friday at 04:15am',
      );
    });

    it(`should return correct comment for a range of days`, () => {
      const options = {
        preset: 'week',
        month: '10',
        dayOfMonth: '4',
        dayOfWeek: '5,6,7',
        hour: '12',
        minute: '0',
      };

      expect(calendarToComment(options)).toBe(
        'Friday, Saturday, Sunday at 12:00pm',
      );
    });
  });

  describe('format days of month calendar', () => {
    it(`should return correct comment for all months and single day`, () => {
      const options = {
        preset: 'month',
        month: '*',
        dayOfMonth: '1',
        dayOfWeek: '',
        hour: '23',
        minute: '5',
      };

      expect(calendarToComment(options)).toBe(
        'Every 1 of the month at 11:05pm',
      );
    });

    it(`should return correct comment for all months and multiple day`, () => {
      const options = {
        preset: 'month',
        month: '*',
        dayOfMonth: '3,13,19,28',
        dayOfWeek: '',
        hour: '00',
        minute: '05',
      };

      expect(calendarToComment(options)).toBe(
        'Every 3,13,19,28 of the month at 12:05am',
      );
    });

    it(`should return correct comment for single months and single day`, () => {
      const options = {
        preset: 'month',
        month: '2',
        dayOfMonth: '3',
        dayOfWeek: '',
        hour: '04',
        minute: '05',
      };

      expect(calendarToComment(options)).toBe('Every 3 of February at 04:05am');
    });

    it(`should return correct comment for single months and multiple days`, () => {
      const options = {
        preset: 'month',
        month: '2',
        dayOfMonth: '3,4,5,11',
        dayOfWeek: '',
        hour: '16',
        minute: '05',
      };

      expect(calendarToComment(options)).toBe(
        'Every 3,4,5,11 of February at 04:05pm',
      );
    });

    it(`should return correct comment for multiple months and single day`, () => {
      const options = {
        preset: 'month',
        month: '6,7,8',
        dayOfMonth: '4',
        dayOfWeek: '',
        hour: '19',
        minute: '45',
      };

      expect(calendarToComment(options)).toBe(
        'Every 4 of June, July, August at 07:45pm',
      );
    });

    it(`should return correct comment for multiple months and multiple days`, () => {
      const options = {
        preset: 'month',
        month: '1,10,11,12',
        dayOfMonth: '1,15,30',
        dayOfWeek: '',
        hour: '6',
        minute: '16',
      };

      expect(calendarToComment(options)).toBe(
        'Every 1,15,30 of January, October, November, December at 06:16am',
      );
    });
  });
});

describe('intervalToComment', () => {
  it(`should return correct comment for only days interval`, () => {
    const interval = timeToInterval('15', '', '', '');
    expect(intervalToComment(interval)).toBe('Every 15days:00hrs:00min:00sec');
  });

  it(`should return correct comment for days and hours interval`, () => {
    const interval = timeToInterval('3', '6', '', '');
    expect(intervalToComment(interval)).toBe('Every 3days:06hrs:00min:00sec');
  });

  it(`should return correct comment for days and hours offset`, () => {
    const offset = timeToInterval('3', '6', '', '');
    expect(intervalToComment(offset, true)).toBe(
      'Offset 3days:06hrs:00min:00sec',
    );
  });

  it(`should return correct comment for days and hours and minutes interval`, () => {
    const interval = timeToInterval('3', '6', '3', '');
    expect(intervalToComment(interval)).toBe('Every 3days:06hrs:03min:00sec');
  });

  it(`should return correct comment for days and hours and minutes and seconds interval`, () => {
    const interval = timeToInterval('2', '19', '59', '17');
    expect(intervalToComment(interval)).toBe('Every 2days:19hrs:59min:17sec');
  });

  it(`should return correct comment for only hours interval`, () => {
    const interval = timeToInterval('', '8', '', '');
    expect(intervalToComment(interval)).toBe('Every 08hrs:00min:00sec');
  });

  it(`should return correct comment for hours and minutes interval`, () => {
    const interval = timeToInterval('', '12', '35', '');
    expect(intervalToComment(interval)).toBe('Every 12hrs:35min:00sec');
  });

  it(`should return correct comment for hours and minutes and seconds interval`, () => {
    const interval = timeToInterval('', '2', '15', '30');
    expect(intervalToComment(interval)).toBe('Every 02hrs:15min:30sec');
  });

  it(`should return correct comment for hours and minutes and seconds offset`, () => {
    const offset = timeToInterval('', '2', '15', '30');
    expect(intervalToComment(offset, true)).toBe('Offset 02hrs:15min:30sec');
  });

  it(`should return correct comment for only minutes interval`, () => {
    const interval = timeToInterval('', '', '45', '');
    expect(intervalToComment(interval)).toBe('Every 45min:00sec');
  });

  it(`should return correct comment for minutes and seconds interval`, () => {
    const interval = timeToInterval('', '', '10', '30');
    expect(intervalToComment(interval)).toBe('Every 10min:30sec');
  });

  it(`should return correct comment for only minutes interval`, () => {
    const interval = timeToInterval('', '', '', '50');
    expect(intervalToComment(interval)).toBe('Every 50sec');
  });
});
