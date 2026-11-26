import { describe, expect, it } from 'vitest';

import { classifyDaysOfWeek } from './days-of-week';

describe('classifyDaysOfWeek', () => {
  it('classifies an empty selection as everyday', () => {
    expect(classifyDaysOfWeek([])).toBe('everyday');
  });

  it('classifies all days as everyday', () => {
    expect(classifyDaysOfWeek([0, 1, 2, 3, 4, 5, 6])).toBe('everyday');
  });

  it('classifies exactly Monday through Friday as weekdays', () => {
    expect(classifyDaysOfWeek([1, 2, 3, 4, 5])).toBe('weekdays');
  });

  it('classifies exactly Saturday and Sunday as weekends', () => {
    expect(classifyDaysOfWeek([0, 6])).toBe('weekends');
  });

  it('classifies supersets and other selections as custom', () => {
    expect(classifyDaysOfWeek([1, 2, 3, 4, 5, 6])).toBe('custom');
    expect(classifyDaysOfWeek([0, 3, 6])).toBe('custom');
    expect(classifyDaysOfWeek([1])).toBe('custom');
  });
});
