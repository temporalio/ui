import type { DescribeFullSchedule } from '$lib/types/schedule';

import { durationString } from '../schema/common';
import { type FormSpecSchema } from '../schema/form';

import type { ScheduleSpec } from '$types';

function defaultMissingRangeStart(
  ranges: { start?: number; end?: number; step?: number }[] = [],
  defaultValue: number,
) {
  return ranges.map((r) => ({ ...r, start: r.start ?? defaultValue }));
}

export function getFormSpecFromSpec(
  spec: ScheduleSpec | null | undefined,
): FormSpecSchema[] {
  const specs: FormSpecSchema[] = [];

  for (const calendar of spec?.structuredCalendar ?? []) {
    specs.push({
      kind: 'frozen',
      calendar: {
        dayOfMonth: calendar.dayOfMonth ?? [{ start: 1, end: 31, step: 1 }],
        dayOfWeek: defaultMissingRangeStart(
          calendar?.dayOfWeek ?? [{ start: 0, end: 6, step: 1 }],
          0,
        ),
        // An absent second/minute/hour must default to 0, not an empty range.
        // if we use an empty range, that tells the server to exclude everything
        // and no future runs will occur.
        hour: defaultMissingRangeStart(
          calendar.hour ?? [{ start: 0, end: 0, step: 1 }],
          0,
        ),
        minute: defaultMissingRangeStart(
          calendar.minute ?? [{ start: 0, end: 0, step: 1 }],
          0,
        ),
        second: defaultMissingRangeStart(
          calendar.second ?? [{ start: 0, end: 0, step: 1 }],
          0,
        ),
        month: calendar.month ?? [{ start: 1, end: 12, step: 1 }],
        year: calendar.year,
        comment: calendar.comment ?? '',
      },
    } satisfies FormSpecSchema);
  }

  for (const interval of spec?.interval ?? []) {
    specs.push({
      kind: 'frozen',
      interval: {
        interval: durationString().safeParse(interval.interval)?.data ?? '0s',
        phase: durationString().safeParse(interval.phase)?.data ?? '0s',
      },
    } satisfies FormSpecSchema);
  }

  return specs;
}

export function getFormSpecsFromDescribeFullSchedule(
  describeFullSchedule: DescribeFullSchedule,
): FormSpecSchema[] {
  return getFormSpecFromSpec(describeFullSchedule?.schedule?.spec);
}
