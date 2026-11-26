import { describe, expect, it } from 'vitest';

import { getFormSpecInitialData } from './get-form-spec-initial-data';

describe('getFormSpecInitialData', () => {
  it('returns a cron spec with defaults injected', () => {
    const spec = getFormSpecInitialData('cron');

    expect(spec.kind).toBe('cron');
    expect(spec.cronString).toBe('');
    expect(spec.interval).toEqual({});
    expect(spec.calendar).toBeDefined();
  });

  it('seeds a week spec with the current day of the week', () => {
    const spec = getFormSpecInitialData('week');

    expect(spec.kind).toBe('week');
    expect(spec.calendar?.dayOfWeek).toEqual([{ start: new Date().getDay() }]);
    expect(spec.calendar?.hour).toEqual([]);
    expect(spec.calendar?.minute).toEqual([]);
    expect(spec.calendar?.second).toEqual([]);
  });

  it('seeds a month spec with the current day and month', () => {
    const spec = getFormSpecInitialData('month');
    const now = new Date();

    expect(spec.kind).toBe('month');
    expect(spec.calendar?.dayOfMonth).toEqual([{ start: now.getDate() }]);
    expect(spec.calendar?.month).toEqual([{ start: now.getMonth() + 1 }]);
  });

  it('returns an interval spec with an empty interval', () => {
    const spec = getFormSpecInitialData('interval');

    expect(spec.kind).toBe('interval');
    expect(spec.interval).toEqual({});
    expect(spec.calendar).toBeDefined();
  });
});
