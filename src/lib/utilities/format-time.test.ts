import { describe, expect, it } from 'vitest';

import {
  formatDistance,
  formatDistanceAbbreviated,
  formatDurationAbbreviated,
  formatSecondsAbbreviated,
  fromSecondsToDaysOrHours,
  fromSecondsToMinutesAndSeconds,
  getDuration,
  getEpochMilliseconds,
  getTimestampDifference,
  maxDate,
  validTimeToDate,
} from './format-time';

describe('getDuration', () => {
  it('should get no duration of a start and end date within same second', () => {
    const start = '2022-04-13T16:29:35.630571Z';
    const end = '2022-04-13T16:29:35.630609Z';
    const duration = getDuration({ start, end });
    const distance = formatDistance({ start, end });
    const abbvDistancer = formatDistanceAbbreviated({ start, end });
    expect(duration).toStrictEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      months: 0,
      seconds: 0,
      years: 0,
    });
    expect(distance).toBe('');
    expect(abbvDistancer).toBe('');
  });
  it('should get seconds duration of a start and end date', () => {
    const start = '2022-04-13T16:29:35.630571Z';
    const end = '2022-04-13T16:29:41.630609Z';
    const duration = getDuration({ start, end });
    const distance = formatDistance({ start, end });
    const abbvDistancer = formatDistanceAbbreviated({ start, end });
    expect(duration).toStrictEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      months: 0,
      seconds: 6,
      years: 0,
    });
    expect(distance).toBe('6 seconds');
    expect(abbvDistancer).toBe('6s');
  });
  it('should get minutes/seconds duration of a start and end date', () => {
    const start = '2022-04-13T16:29:35.630571Z';
    const end = '2022-04-13T16:35:21.300609Z';
    const duration = getDuration({ start, end });
    const distance = formatDistance({ start, end });
    const abbvDistancer = formatDistanceAbbreviated({ start, end });
    expect(duration).toStrictEqual({
      days: 0,
      hours: 0,
      minutes: 5,
      months: 0,
      seconds: 45,
      years: 0,
    });
    expect(distance).toBe('5 minutes, 45 seconds');
    expect(abbvDistancer).toBe('5m 45s');
  });
  it('should get hours/minutes/seconds duration of a start and end date', () => {
    const start = '2022-04-13T16:29:35.630571Z';
    const end = '2022-04-13T21:35:21.300609Z';
    const duration = getDuration({ start, end });
    const distance = formatDistance({ start, end });
    const abbvDistancer = formatDistanceAbbreviated({ start, end });
    expect(duration).toStrictEqual({
      days: 0,
      hours: 5,
      minutes: 5,
      months: 0,
      seconds: 45,
      years: 0,
    });
    expect(distance).toBe('5 hours, 5 minutes, 45 seconds');
    expect(abbvDistancer).toBe('5h 5m 45s');
  });
  it('should get days/hours/minutes/seconds duration of a start and end date', () => {
    const start = '2022-04-02T16:29:35.630571Z';
    const end = '2022-04-13T21:35:21.300609Z';
    const duration = getDuration({ start, end });
    const distance = formatDistance({ start, end });
    const abbvDistancer = formatDistanceAbbreviated({ start, end });
    expect(duration).toStrictEqual({
      days: 11,
      hours: 5,
      minutes: 5,
      months: 0,
      seconds: 45,
      years: 0,
    });
    expect(distance).toBe('11 days, 5 hours, 5 minutes, 45 seconds');
    expect(abbvDistancer).toBe('11d 5h 5m 45s');
  });
  it('should get months/days/hours/minutes/seconds duration of a start and end date with and without flexibleUnits enabled', () => {
    const start = '2022-04-02T16:29:35.630571Z';
    const end = '2022-11-13T21:35:21.300609Z';
    let duration = getDuration({ start, end, flexibleUnits: true });
    let distance = formatDistance({ start, end, flexibleUnits: true });
    let abbvDistancer = formatDistanceAbbreviated({
      start,
      end,
      flexibleUnits: true,
    });
    expect(duration).toStrictEqual({
      days: 11,
      hours: 5,
      minutes: 5,
      months: 7,
      seconds: 45,
      years: 0,
    });
    expect(distance).toBe('7 months, 11 days, 5 hours, 5 minutes, 45 seconds');
    expect(abbvDistancer).toBe('7months 11d 5h 5m 45s');

    duration = getDuration({ start, end });
    distance = formatDistance({ start, end });
    abbvDistancer = formatDistanceAbbreviated({ start, end });
    expect(duration).toStrictEqual({
      days: 225,
      hours: 5,
      minutes: 5,
      months: 0,
      seconds: 45,
      years: 0,
    });
    expect(distance).toBe('225 days, 5 hours, 5 minutes, 45 seconds');
    expect(abbvDistancer).toBe('225d 5h 5m 45s');
  });

  it('should get months/days/hours/minutes/seconds duration of a start and end date with and without flexibleUnits enabled', () => {
    const start = '2020-02-02T16:51:02.630571Z';
    const end = '2022-11-13T21:35:21.300609Z';
    let duration = getDuration({ start, end, flexibleUnits: true });
    let distance = formatDistance({ start, end, flexibleUnits: true });
    let abbvDistancer = formatDistanceAbbreviated({
      start,
      end,
      flexibleUnits: true,
    });
    expect(duration).toStrictEqual({
      days: 11,
      hours: 4,
      minutes: 44,
      months: 9,
      seconds: 18,
      years: 2,
    });
    expect(distance).toBe(
      '2 years, 9 months, 11 days, 4 hours, 44 minutes, 18 seconds',
    );
    expect(abbvDistancer).toBe('2years 9months 11d 4h 44m 18s');

    duration = getDuration({ start, end });
    distance = formatDistance({ start, end });
    abbvDistancer = formatDistanceAbbreviated({ start, end });
    expect(duration).toStrictEqual({
      days: 1015,
      hours: 4,
      minutes: 44,
      months: 0,
      seconds: 18,
      years: 0,
    });
    expect(distance).toBe('1015 days, 4 hours, 44 minutes, 18 seconds');
    expect(abbvDistancer).toBe('1015d 4h 44m 18s');
  });
  it('should get minutes/seconds duration with milliseconds of a start and end date', () => {
    const start = '2022-04-13T16:29:35.630571Z';
    const end = '2022-04-13T16:35:21.300609Z';
    const duration = getDuration({ start, end });
    const distance = formatDistance({ start, end, includeMilliseconds: true });
    const abbvDistancer = formatDistanceAbbreviated({
      start,
      end,
      includeMilliseconds: true,
    });
    expect(duration).toStrictEqual({
      days: 0,
      hours: 0,
      minutes: 5,
      months: 0,
      seconds: 45,
      years: 0,
    });
    expect(distance).toBe('5 minutes, 45 seconds 670ms');
    expect(abbvDistancer).toBe('5m 45s 670ms');
  });
  it('should get only milliseconds of a start and end date less than a second apart', () => {
    const start = '2022-04-13T16:29:35.630571Z';
    const end = '2022-04-13T16:29:35.893821Z';
    const duration = getDuration({ start, end });
    const distance = formatDistance({ start, end, includeMilliseconds: true });
    const abbvDistancer = formatDistanceAbbreviated({
      start,
      end,
      includeMilliseconds: true,
    });
    expect(duration).toStrictEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      months: 0,
      seconds: 0,
      years: 0,
    });
    expect(distance).toBe('263ms');
    expect(abbvDistancer).toBe('263ms');
  });
  it('should get only milliseconds of a start and end date less than a second apart with includeMillisecondsForUnderSecond', () => {
    const start = '2022-04-13T16:29:35.630571Z';
    const end = '2022-04-13T16:29:35.893821Z';
    const duration = getDuration({ start, end });
    const distance = formatDistance({
      start,
      end,
      includeMillisecondsForUnderSecond: true,
    });
    const abbvDistancer = formatDistanceAbbreviated({
      start,
      end,
      includeMillisecondsForUnderSecond: true,
    });
    expect(duration).toStrictEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      months: 0,
      seconds: 0,
      years: 0,
    });
    expect(distance).toBe('263ms');
    expect(abbvDistancer).toBe('263ms');
  });
  it('should not get milliseconds of a start and end date more than a second apart with includeMillisecondsForUnderSecond', () => {
    const start = '2022-04-13T16:29:33.630571Z';
    const end = '2022-04-13T16:29:35.893821Z';
    const duration = getDuration({ start, end });
    const distance = formatDistance({
      start,
      end,
      includeMillisecondsForUnderSecond: true,
    });
    const abbvDistancer = formatDistanceAbbreviated({
      start,
      end,
      includeMillisecondsForUnderSecond: true,
    });
    expect(duration).toStrictEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      months: 0,
      seconds: 2,
      years: 0,
    });
    expect(distance).toBe('2 seconds');
    expect(abbvDistancer).toBe('2s');
  });
});

describe('fromSecondsToMinutesAndSeconds', () => {
  it('should return "1 minute" for 60 seconds', () => {
    const seconds = 60;
    expect(fromSecondsToMinutesAndSeconds(seconds)).toBe('1 minute');
  });
  it('should return "1 minute" for -60 seconds', () => {
    const seconds = -60;
    expect(fromSecondsToMinutesAndSeconds(seconds)).toBe('1 minute');
  });
  it('should return "1 second" for 1 second', () => {
    const seconds = 1;
    expect(fromSecondsToMinutesAndSeconds(seconds)).toBe('1 second');
  });
  it('should return "30 seconds" for 30 seconds', () => {
    const seconds = 30;
    expect(fromSecondsToMinutesAndSeconds(seconds)).toBe('30 seconds');
  });
  it('should return "10 minutes" for 600 seconds', () => {
    const seconds = 600;
    expect(fromSecondsToMinutesAndSeconds(seconds)).toBe('10 minutes');
  });
  it('should return "1 minute and 30 seconds" for 90 seconds', () => {
    const seconds = 90;
    expect(fromSecondsToMinutesAndSeconds(seconds)).toBe('1 minute 30 seconds');
  });
});

describe('fromSecondsToDaysOrHours', () => {
  it('should return "1 day" for 86400 seconds', () => {
    const seconds = '86400s';
    expect(fromSecondsToDaysOrHours(seconds)).toBe('1 day');
  });
  it('should return "1 day" for 86400 seconds without s', () => {
    const seconds = '86400';
    expect(fromSecondsToDaysOrHours(seconds)).toBe('1 day');
  });
  it('should return "5 days" for 432000 seconds', () => {
    const seconds = '432000s';
    expect(fromSecondsToDaysOrHours(seconds)).toBe('5 days');
  });
  it('should return "3 hours" for less than 1 day of seconds', () => {
    const seconds = '10800s';
    expect(fromSecondsToDaysOrHours(seconds)).toBe('3 hours');
  });
  it('should return "1 hour" for one hour of seconds', () => {
    const seconds = '3600s';
    expect(fromSecondsToDaysOrHours(seconds)).toBe('1 hour');
  });
  it('should return "33 days" for 2851200s', () => {
    const seconds = '2851200s';
    expect(fromSecondsToDaysOrHours(seconds)).toBe('33 days');
  });
});

describe('getEpochMilliseconds', () => {
  it('should return epoch milliseconds, not the sub-second component', () => {
    expect(getEpochMilliseconds('2026-06-30T08:03:25.812286937Z')).toBe(
      Date.parse('2026-06-30T08:03:25.812Z'),
    );
  });

  it('should sort timestamps chronologically regardless of sub-second fraction', () => {
    const times = [
      '2026-06-30T11:05:30.793784947Z',
      '2026-06-30T08:03:25.812286937Z',
      '2026-06-30T13:01:01.591393007Z',
    ];
    const sorted = [...times].sort(
      (a, b) => getEpochMilliseconds(a) - getEpochMilliseconds(b),
    );
    expect(sorted).toEqual([
      '2026-06-30T08:03:25.812286937Z',
      '2026-06-30T11:05:30.793784947Z',
      '2026-06-30T13:01:01.591393007Z',
    ]);
  });

  it('should return 0 for nullish input', () => {
    expect(getEpochMilliseconds(undefined)).toBe(0);
    expect(getEpochMilliseconds(null)).toBe(0);
  });
});

describe('getTimestampDifference', () => {
  it('should return ms difference for two dates seconds apart', () => {
    const start = '2022-04-13T11:29:32.633009Z';
    const end = '2022-04-13T16:29:35.633009Z';

    expect(getTimestampDifference(start, end)).toBe(18003000);
  });
  it('should return ms difference for two dates minutes apart', () => {
    const start = '2022-04-13T11:53:12.120571Z';
    const end = '2022-04-13T16:29:35.633009Z';
    expect(getTimestampDifference(start, end)).toBe(16583513);
  });
  it('should return ms difference for two dates hours apart', () => {
    const start = '2022-04-13T02:30:59.120571Z';
    const end = '2022-04-13T16:29:35.633009Z';
    expect(getTimestampDifference(start, end)).toBe(50316513);
  });

  describe('formatDurationAbbreviated', () => {
    it('should return duration abbreviated with full milliseconds if under one second', () => {
      expect(formatDurationAbbreviated('0.86920383s')).toBe('869.20383ms');
    });
    it('should return duration abbreviated with rounded milliseconds if under one minute', () => {
      expect(formatDurationAbbreviated('13.439023207s')).toBe('13s, 439ms');
    });
    it('should return duration abbreviated with no milliseconds if over one minute', () => {
      expect(formatDurationAbbreviated('64.2134111s')).toBe('1m, 4s');
    });
    it('should return duration abbreviated', () => {
      expect(formatDurationAbbreviated('2652361s')).toBe('30d, 16h, 46m, 1s');
    });
    it('should return duration abbreviated', () => {
      expect(formatDurationAbbreviated('2694361s')).toBe('1month, 4h, 26m, 1s');
    });
    it('should return duration abbreviated', () => {
      expect(formatDurationAbbreviated('32694361s')).toBe(
        '1year, 13d, 9h, 46m, 1s',
      );
    });
  });
});

describe('formatSecondsAbbreviated', () => {
  it('should return "13m 20s" for 800 seconds', () => {
    expect(formatSecondsAbbreviated(800)).toBe('13m 20s');
    expect(formatSecondsAbbreviated('800')).toBe('13m 20s');
  });
  it('should return "1ms" for 0.001 seconds', () => {
    expect(formatSecondsAbbreviated(0.001)).toBe('1ms');
    expect(formatSecondsAbbreviated('0.001')).toBe('1ms');
  });
});

describe('maxDate', () => {
  it('should return the latest date from a list of ISO strings', () => {
    const result = maxDate(
      '2022-04-13T16:29:35.630Z',
      '2022-04-13T16:29:33.630Z',
      '2022-04-13T16:29:41.630Z',
    );
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2022-04-13T16:29:41.630Z');
  });

  it('should return the latest date from a list of Timestamp objects', () => {
    const result = maxDate(
      { seconds: '1649866175', nanos: 0 },
      { seconds: '1649866170', nanos: 0 },
      { seconds: '1649866180', nanos: 0 },
    );
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2022-04-13T16:09:40.000Z');
  });

  it('should return the latest date when mixing Timestamps, strings, and Date instances', () => {
    const result = maxDate(
      '2022-04-13T16:29:35.630Z',
      { seconds: '1649866175', nanos: 630000000 },
      new Date('2022-04-13T16:29:41.000Z'),
    );
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2022-04-13T16:29:41.000Z');
  });

  it('should return the only date when given a single argument', () => {
    const result = maxDate('2022-04-13T16:29:35.630Z');
    expect(result.toISOString()).toBe('2022-04-13T16:29:35.630Z');
  });

  it('should differentiate between Timestamps with different nanos in the same second', () => {
    const result = maxDate(
      { seconds: '1649866175', nanos: 500000000 },
      { seconds: '1649866175', nanos: 100000000 },
      { seconds: '1649866175', nanos: 900000000 },
    );
    expect(result.toISOString()).toBe('2022-04-13T16:09:35.900Z');
  });

  it('should throw RangeError when given no arguments', () => {
    expect(() => maxDate()).toThrow(RangeError);
  });
});

describe('validTimeToDate', () => {
  it('should convert a Timestamp object with seconds and nanos to a Date', () => {
    const timestamp = { seconds: '1649866175', nanos: 630571000 };
    const result = validTimeToDate(timestamp);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2022-04-13T16:09:35.630Z');
  });

  it('should convert a Timestamp object with numeric seconds to a Date', () => {
    const timestamp = { seconds: 1649866175, nanos: 630571000 };
    const result = validTimeToDate(timestamp);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2022-04-13T16:09:35.630Z');
  });

  it('should convert a Timestamp object with zero nanos to a Date', () => {
    const timestamp = { seconds: '1649866175', nanos: 0 };
    const result = validTimeToDate(timestamp);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2022-04-13T16:09:35.000Z');
  });

  it('should convert a Timestamp object with null nanos to a Date', () => {
    const timestamp = { seconds: '1649866175', nanos: null };
    const result = validTimeToDate(timestamp);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2022-04-13T16:09:35.000Z');
  });

  it('should convert an ISO date string to a Date', () => {
    const isoString = '2022-04-13T16:29:35.630Z';
    const result = validTimeToDate(isoString);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2022-04-13T16:29:35.630Z');
  });

  it('should convert an ISO date string with nanosecond precision to a Date', () => {
    const isoString = '2022-04-13T16:29:35.630571Z';
    const result = validTimeToDate(isoString);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2022-04-13T16:29:35.630Z');
  });

  it('should return a Date when passed a Date instance', () => {
    const date = new Date('2022-04-13T16:29:35.630Z');
    const result = validTimeToDate(date);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2022-04-13T16:29:35.630Z');
  });

  it('should throw a TypeError if given unparsable string', () => {
    expect(() => validTimeToDate('not-a-date')).toThrow(TypeError);
  });

  it('should throw on an empty string', () => {
    expect(() => validTimeToDate('')).toThrow(TypeError);
  });
});
