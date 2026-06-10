import { describe, expect, test } from 'vitest';

import {
  evaluateDatePickerInput,
  formatDatePickerInput,
  parseDatePickerInput,
} from './date-picker-input';

describe('formatDatePickerInput', () => {
  test('formats a date as zero-padded MM/DD/YYYY', () => {
    expect(formatDatePickerInput(new Date(2026, 5, 5))).toBe('06/05/2026');
  });

  test('keeps two-digit months and days without padding changes', () => {
    expect(formatDatePickerInput(new Date(2026, 10, 25))).toBe('11/25/2026');
  });

  test('round-trips with parseDatePickerInput', () => {
    const date = new Date(2027, 0, 1);
    const parsed = parseDatePickerInput(formatDatePickerInput(date));
    expect(parsed?.getFullYear()).toBe(2027);
    expect(parsed?.getMonth()).toBe(0);
    expect(parsed?.getDate()).toBe(1);
  });
});

describe('parseDatePickerInput', () => {
  test('parses a complete, valid MM/DD/YYYY date', () => {
    const date = parseDatePickerInput('06/05/2026');
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(5);
    expect(date?.getDate()).toBe(5);
  });

  test('returns null for partial input (mid-typing)', () => {
    expect(parseDatePickerInput('06/05/20')).toBeNull();
    expect(parseDatePickerInput('06/05')).toBeNull();
    expect(parseDatePickerInput('06')).toBeNull();
  });

  test('returns null for a two-digit year', () => {
    expect(parseDatePickerInput('06/05/26')).toBeNull();
  });

  test('returns null for an out-of-range month', () => {
    expect(parseDatePickerInput('13/01/2026')).toBeNull();
    expect(parseDatePickerInput('00/01/2026')).toBeNull();
  });

  test('returns null for an invalid day that does not round-trip', () => {
    expect(parseDatePickerInput('02/30/2026')).toBeNull();
    expect(parseDatePickerInput('04/31/2026')).toBeNull();
  });

  test('returns null for non-date garbage', () => {
    expect(parseDatePickerInput('not a date')).toBeNull();
    expect(parseDatePickerInput('Fri Jun 05 2026')).toBeNull();
    expect(parseDatePickerInput('')).toBeNull();
  });
});

describe('evaluateDatePickerInput', () => {
  test('returns the date with no error for valid full-date entry', () => {
    const { date, error } = evaluateDatePickerInput('06/05/2026');
    expect(error).toBe(false);
    expect(date?.getFullYear()).toBe(2026);
  });

  test('returns no date and no error for empty input', () => {
    expect(evaluateDatePickerInput('')).toEqual({ date: null, error: false });
    expect(evaluateDatePickerInput('   ')).toEqual({
      date: null,
      error: false,
    });
  });

  test('returns no date and no error for partial entry (no dispatch)', () => {
    expect(evaluateDatePickerInput('06/05/20')).toEqual({
      date: null,
      error: true,
    });
  });

  test('flags an invalid date like 02/30/2026 as an error', () => {
    expect(evaluateDatePickerInput('02/30/2026')).toEqual({
      date: null,
      error: true,
    });
  });

  test('rejects an out-of-range date per isAllowed', () => {
    const noPastDates = (d: Date) => d >= new Date(2026, 0, 1);
    const { date, error } = evaluateDatePickerInput('06/05/2020', noPastDates);
    expect(date).toBeNull();
    expect(error).toBe(true);
  });

  test('accepts an in-range date per isAllowed', () => {
    const noPastDates = (d: Date) => d >= new Date(2026, 0, 1);
    const { date, error } = evaluateDatePickerInput('06/05/2027', noPastDates);
    expect(date?.getFullYear()).toBe(2027);
    expect(error).toBe(false);
  });

  test('supports inline editing of the year', () => {
    const prefilled = formatDatePickerInput(new Date(2026, 5, 5));
    expect(prefilled).toBe('06/05/2026');

    const edited = prefilled.replace('2026', '2027');
    const { date, error } = evaluateDatePickerInput(edited);
    expect(error).toBe(false);
    expect(date?.getFullYear()).toBe(2027);
    expect(date?.getMonth()).toBe(5);
    expect(date?.getDate()).toBe(5);
  });
});
