import { describe, expect, it, vi } from 'vitest';

import { formatDate, formatUTCOffset, isValidDate } from './format-date';

describe('formatDate', () => {
  const date = '2022-04-13T16:29:35.630571Z';

  it('should return an empty string if no date is provided', () => {
    expect(formatDate(undefined)).toEqual('');
    expect(formatDate(null)).toEqual('');
  });

  it('should error if there is an invalid date', () => {
    const spy = vi.spyOn(console, 'error');
    formatDate('2022-04-13T16');
    expect(spy).toHaveBeenCalled();
  });

  it('should error if there is an invalid timezone', () => {
    const spy = vi.spyOn(console, 'error');
    formatDate(date, 'bogus');
    expect(spy).toHaveBeenCalled();
  });

  it('should default to UTC', () => {
    expect(formatDate(date)).toEqual('2022-04-13 UTC 16:29:35.63');
  });

  it('should format other timezones', () => {
    expect(formatDate(date, 'Greenwich Mean Time')).toEqual(
      '2022-04-13 GMT 16:29:35.63',
    );
    expect(formatDate(date, 'Central Standard Time')).toEqual(
      '2022-04-13 CDT 11:29:35.63',
    );
    expect(formatDate(date, 'Pacific Daylight Time')).toEqual(
      '2022-04-13 PDT 09:29:35.63',
    );
  });

  it('should format local time', () => {
    expect(formatDate(date, 'local')).toEqual('2022-04-13 UTC 16:29:35.63');
  });

  it('should format relative local time', () => {
    expect(formatDate(date, 'local', { relative: true })).toContain('ago');
  });

  it('should not format other timezones as relative', () => {
    expect(formatDate(date, 'UTC', { relative: true })).toEqual(
      '2022-04-13 UTC 16:29:35.63',
    );
  });

  it('should format relative local time with a custom label', () => {
    expect(
      formatDate(date, 'local', { relative: true, relativeLabel: 'custom' }),
    ).toContain('custom');
  });

  it('should shorten format for local and other timezones', () => {
    expect(formatDate(date, 'local', { abbrFormat: true })).toEqual(
      '2022-04-13 16:29:35 PM',
    );
    expect(formatDate(date, 'utc', { abbrFormat: true })).toEqual(
      '2022-04-13 16:29:35 PM',
    );
  });

  it('should shorten format without seconds if there are none for local and other timezones', () => {
    const dateWithoutSeconds = '2022-04-13T16:29:00.630571Z';
    expect(
      formatDate(dateWithoutSeconds, 'local', { abbrFormat: true }),
    ).toEqual('2022-04-13 16:29 PM');
    expect(formatDate(dateWithoutSeconds, 'utc', { abbrFormat: true })).toEqual(
      '2022-04-13 16:29 PM',
    );
  });
});

describe('isValidDate', () => {
  it('should return true if the value is a valid Date', () => {
    expect(isValidDate('2022-04-13T11:29:32.633009Z')).toBe(true);
  });

  it('should return false if the value is not a valid Date', () => {
    expect(isValidDate('bogus')).toBe(false);
    expect(isValidDate('')).toBe(false);
  });
});

describe('formatUTCOffset', () => {
  it('should return an empty string if the offset is undefined', () => {
    expect(formatUTCOffset(undefined, 'UTC')).toBe('');
  });

  it('should return the correct string if the offset is 0', () => {
    expect(formatUTCOffset(0, 'UTC')).toBe('UTC±00:00');
  });

  it('should return an empty string if the offset is positive', () => {
    expect(formatUTCOffset(3, 'UTC')).toBe('UTC+03:00');
  });

  it('should return an empty string if the offset is positive and double digits', () => {
    expect(formatUTCOffset(10, 'UTC')).toBe('UTC+10:00');
  });

  it('should return an empty string if the offset is negative', () => {
    expect(formatUTCOffset(-3, 'UTC')).toBe('UTC-03:00');
  });

  it('should return an empty string if the offset is negative and double digits', () => {
    expect(formatUTCOffset(-10, 'UTC')).toBe('UTC-10:00');
  });
});
