import { describe, expect, it } from 'vitest';

import type { DescribeFullSchedule } from '$lib/types/schedule';

import {
  getFormSpecFromSpec,
  getFormSpecsFromDescribeFullSchedule,
} from './get-form-spec';

import type { ScheduleSpec } from '$types';

describe('getFormSpecFromSpec', () => {
  it('returns an empty array for missing input', () => {
    expect(getFormSpecFromSpec(null)).toEqual([]);
    expect(getFormSpecFromSpec(undefined)).toEqual([]);
    expect(getFormSpecFromSpec({} as ScheduleSpec)).toEqual([]);
  });

  it('fills in defaults for a bare structured calendar', () => {
    const [spec] = getFormSpecFromSpec({
      structuredCalendar: [{}],
    } as ScheduleSpec);

    expect(spec.kind).toBe('frozen');
    expect(spec.calendar).toEqual({
      dayOfMonth: [{ start: 1, end: 31, step: 1 }],
      dayOfWeek: [{ start: 0, end: 6, step: 1 }],
      hour: [{ start: 0, end: 0, step: 1 }],
      minute: [{ start: 0, end: 0, step: 1 }],
      second: [{ start: 0, end: 0, step: 1 }],
      month: [{ start: 1, end: 12, step: 1 }],
      year: undefined,
      comment: '',
    });
  });

  it('preserves the calendar comment', () => {
    const [spec] = getFormSpecFromSpec({
      structuredCalendar: [{ comment: '0 12 * * *' }],
    } as ScheduleSpec);

    expect(spec.calendar?.comment).toBe('0 12 * * *');
  });

  it('defaults missing range starts to zero for provided fields', () => {
    const [spec] = getFormSpecFromSpec({
      structuredCalendar: [
        {
          dayOfWeek: [{ end: 5 }],
          hour: [{ start: 9 }],
        },
      ],
    } as ScheduleSpec);

    expect(spec.calendar?.dayOfWeek).toEqual([{ start: 0, end: 5 }]);
    expect(spec.calendar?.hour).toEqual([{ start: 9 }]);
  });

  it('maps intervals to frozen interval specs', () => {
    const [spec] = getFormSpecFromSpec({
      interval: [{ interval: '3600s', phase: '60s' }],
    } as ScheduleSpec);

    expect(spec.kind).toBe('frozen');
    expect(spec.interval).toEqual({ interval: '3600s', phase: '60s' });
  });

  it('defaults a missing interval phase to zero seconds', () => {
    const [spec] = getFormSpecFromSpec({
      interval: [{ interval: '3600s' }],
    } as ScheduleSpec);

    expect(spec.interval).toEqual({ interval: '3600s', phase: '0s' });
  });

  it('returns a spec for each calendar and interval', () => {
    const specs = getFormSpecFromSpec({
      structuredCalendar: [{}],
      interval: [{ interval: '60s' }],
    } as ScheduleSpec);

    expect(specs).toHaveLength(2);
    expect(specs[0].kind).toBe('frozen');
    expect(specs[1].kind).toBe('frozen');
  });
});

describe('getFormSpecsFromDescribeFullSchedule', () => {
  it('reads the spec off the schedule', () => {
    const specs = getFormSpecsFromDescribeFullSchedule({
      schedule: { spec: { interval: [{ interval: '60s' }] } },
    } as unknown as DescribeFullSchedule);

    expect(specs).toHaveLength(1);
    expect(specs[0].interval).toEqual({ interval: '60s', phase: '0s' });
  });

  it('returns an empty array when there is no spec', () => {
    expect(
      getFormSpecsFromDescribeFullSchedule({} as DescribeFullSchedule),
    ).toEqual([]);
  });
});
