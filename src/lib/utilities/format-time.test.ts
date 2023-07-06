import { describe, expect, it } from 'vitest';

import {
  formatDistance,
  formatDistanceAbbreviated,
  fromSecondsToDaysOrHours,
  fromSecondsToMinutesAndSeconds,
  getDuration,
  getTimestampDifference,
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
  it('should get months/days/hours/minutes/seconds duration of a start and end date', () => {
    const start = '2022-04-02T16:29:35.630571Z';
    const end = '2022-11-13T21:35:21.300609Z';
    const duration = getDuration({ start, end });
    const distance = formatDistance({ start, end });
    const abbvDistancer = formatDistanceAbbreviated({ start, end });
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
  });

  it('should get months/days/hours/minutes/seconds duration of a start and end date', () => {
    const start = '2020-02-02T16:51:02.630571Z';
    const end = '2022-11-13T21:35:21.300609Z';
    const duration = getDuration({ start, end });
    const distance = formatDistance({ start, end });
    const abbvDistancer = formatDistanceAbbreviated({ start, end });
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
});
