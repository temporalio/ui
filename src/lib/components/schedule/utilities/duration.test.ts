import { describe, expect, it } from 'vitest';

import { durationUnits, intervalUnits } from '../constants';
import { getLargestWholeUnit } from './duration';

describe('getLargestWholeUnit', () => {
  it('throws when no units are provided', () => {
    expect(() => getLargestWholeUnit('60s', [])).toThrow(RangeError);
  });

  it('picks the largest unit the duration divides into evenly', () => {
    expect(getLargestWholeUnit('86400s', intervalUnits)).toEqual({
      value: 1,
      unit: expect.objectContaining({ label: 'day(s)' }),
    });
    expect(getLargestWholeUnit('3600s', intervalUnits)).toEqual({
      value: 1,
      unit: expect.objectContaining({ label: 'hour(s)' }),
    });
    expect(getLargestWholeUnit('60s', intervalUnits)).toEqual({
      value: 1,
      unit: expect.objectContaining({ label: 'minute(s)' }),
    });
  });

  it('returns a whole multiple when one exists', () => {
    expect(getLargestWholeUnit('7200s', intervalUnits)).toEqual({
      value: 2,
      unit: expect.objectContaining({ label: 'hour(s)' }),
    });
  });

  it('falls back to the smallest unit when nothing divides evenly', () => {
    expect(getLargestWholeUnit('90s', intervalUnits)).toEqual({
      value: 90,
      unit: expect.objectContaining({ label: 'second(s)' }),
    });
  });

  it('returns zero in the smallest unit for a zero duration', () => {
    expect(getLargestWholeUnit('0s', intervalUnits)).toEqual({
      value: 0,
      unit: expect.objectContaining({ label: 'second(s)' }),
    });
  });

  it('uses months as the largest unit when available', () => {
    const monthInSeconds = 31 * 24 * 60 * 60;
    expect(getLargestWholeUnit(`${monthInSeconds}s`, durationUnits)).toEqual({
      value: 1,
      unit: expect.objectContaining({ label: 'month(s)' }),
    });
  });
});
