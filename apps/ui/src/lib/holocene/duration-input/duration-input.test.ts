import { describe, expect, it } from 'vitest';

import {
  getFirstWholeNumberUnit,
  HOURS,
  MILLISECONDS,
  MINUTES,
  SECONDS,
  unitValueToDuration,
} from './duration-input.svelte';

// largest-first, matching how the activity/standalone forms configure units
const hms = [HOURS, MINUTES, SECONDS];
const hmsMs = [HOURS, MINUTES, SECONDS, MILLISECONDS];

describe('getFirstWholeNumberUnit', () => {
  it('returns the largest unit that divides evenly', () => {
    expect(getFirstWholeNumberUnit('3600s', hms, 'second(s)')).toBe('hour(s)');
    expect(getFirstWholeNumberUnit('7200s', hms, 'second(s)')).toBe('hour(s)');
    expect(getFirstWholeNumberUnit('120s', hms, 'second(s)')).toBe('minute(s)');
    expect(getFirstWholeNumberUnit('90s', hms, 'second(s)')).toBe('second(s)');
  });

  it('prefers larger units over smaller ones when both divide evenly', () => {
    // 3600s divides evenly by hours, minutes, and seconds -> hours wins
    expect(getFirstWholeNumberUnit('3600s', hms, 'second(s)')).toBe('hour(s)');
    // 60s divides evenly by minutes and seconds -> minutes wins
    expect(getFirstWholeNumberUnit('60s', hms, 'second(s)')).toBe('minute(s)');
  });

  it('resolves sub-second values to milliseconds when available', () => {
    expect(getFirstWholeNumberUnit('0.5s', hmsMs, 'second(s)')).toBe(
      'millisecond(s)',
    );
    expect(getFirstWholeNumberUnit('0.25s', hmsMs, 'second(s)')).toBe(
      'millisecond(s)',
    );
  });

  it('is not fooled by binary floating-point division error', () => {
    // 0.1 / 0.001 === 100.00000000000001, which would fail a naive isInteger
    expect(getFirstWholeNumberUnit('0.1s', hmsMs, 'second(s)')).toBe(
      'millisecond(s)',
    );
    expect(getFirstWholeNumberUnit('0.007s', hmsMs, 'second(s)')).toBe(
      'millisecond(s)',
    );
  });

  it('returns the default unit for zero or empty values', () => {
    expect(getFirstWholeNumberUnit('0s', hmsMs, 'second(s)')).toBe('second(s)');
    expect(getFirstWholeNumberUnit('', hmsMs, 'second(s)')).toBe('second(s)');
  });

  it('returns the default unit when no unit divides evenly', () => {
    expect(getFirstWholeNumberUnit('1.5s', hms, 'second(s)')).toBe('second(s)');
    // a genuinely fractional millisecond value matches no whole unit
    expect(getFirstWholeNumberUnit('0.0001s', hmsMs, 'millisecond(s)')).toBe(
      'millisecond(s)',
    );
  });

  it('ignores the default when a value resolves to a unit', () => {
    expect(getFirstWholeNumberUnit('3600s', hms, 'second(s)')).toBe('hour(s)');
    expect(getFirstWholeNumberUnit('120s', hms, 'second(s)')).toBe('minute(s)');
  });
});

describe('unitValueToDuration', () => {
  // Regression: the bound `<input type="number">` value arrives as a number
  // after typing, so changing the unit afterwards must still convert it. The
  // previous implementation bailed on non-string input and left the value in
  // the old unit (e.g. entering 60 minutes was saved as "60s").
  it('converts a numeric value in the selected unit', () => {
    expect(unitValueToDuration(60, 'minute(s)', hmsMs)).toBe('3600s');
    expect(unitValueToDuration(60, 'hour(s)', hmsMs)).toBe('216000s');
    expect(unitValueToDuration(500, 'millisecond(s)', hmsMs)).toBe('0.5s');
  });

  it('converts a string value the same way', () => {
    expect(unitValueToDuration('60', 'minute(s)', hmsMs)).toBe('3600s');
    expect(unitValueToDuration('30', 'second(s)', hmsMs)).toBe('30s');
  });

  it('returns an empty string for empty or non-numeric input', () => {
    expect(unitValueToDuration('', 'minute(s)', hmsMs)).toBe('');
    expect(unitValueToDuration('   ', 'minute(s)', hmsMs)).toBe('');
    expect(unitValueToDuration('abc', 'minute(s)', hmsMs)).toBe('');
  });

  it('returns undefined for an unknown unit so callers keep the current value', () => {
    expect(unitValueToDuration(60, 'fortnight(s)', hmsMs)).toBeUndefined();
  });
});
