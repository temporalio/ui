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
        dayOfMonth: calendar?.dayOfMonth ?? [{ start: 1, end: 31, step: 1 }],
        dayOfWeek: defaultMissingRangeStart(calendar?.dayOfWeek, 0),
        hour: defaultMissingRangeStart(calendar.hour, 0),
        minute: defaultMissingRangeStart(calendar.minute, 0),
        second: defaultMissingRangeStart(calendar.second, 0),
        year: calendar.year,
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
