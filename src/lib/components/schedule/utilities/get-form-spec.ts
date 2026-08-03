import type { z } from 'zod/v3';

import type { DescribeFullSchedule } from '$lib/types/schedule';

import { durationString } from '../schema/common';
import { formSpecObject, type FormSpecSchema } from '../schema/form';

import type { RangeSpec, ScheduleSpec } from '$types';

type FormSpecInput = z.input<typeof formSpecObject>;
type FormRange = { start: number; end?: number; step?: number };

// Parse a partial input spec through the bare object schema (no cross-field
// refinements) so zod injects the field defaults, yielding a complete
// FormSpecSchema.
const parseFormSpec = (spec: FormSpecInput): FormSpecSchema =>
  formSpecObject.parse(spec);

function normalizeRanges(
  ranges: RangeSpec[] | null | undefined,
  defaultStart: number,
): FormRange[] {
  return (ranges ?? []).map((range) => ({
    start: range.start ?? defaultStart,
    ...(range.end != null ? { end: range.end } : {}),
    ...(range.step != null ? { step: range.step } : {}),
  }));
}

export function getFormSpecFromSpec(
  spec: ScheduleSpec | null | undefined,
): FormSpecSchema[] {
  const specs: FormSpecSchema[] = [];

  for (const calendar of spec?.structuredCalendar ?? []) {
    specs.push(
      parseFormSpec({
        kind: 'frozen',
        calendar: {
          dayOfMonth: calendar.dayOfMonth
            ? normalizeRanges(calendar.dayOfMonth, 1)
            : [{ start: 1, end: 31, step: 1 }],
          dayOfWeek: normalizeRanges(
            calendar.dayOfWeek ?? [{ start: 0, end: 6, step: 1 }],
            0,
          ),
          // An absent second/minute/hour must default to 0, not an empty range.
          // An empty range tells the server to exclude everything, so no future
          // runs would occur.
          hour: normalizeRanges(
            calendar.hour ?? [{ start: 0, end: 0, step: 1 }],
            0,
          ),
          minute: normalizeRanges(
            calendar.minute ?? [{ start: 0, end: 0, step: 1 }],
            0,
          ),
          second: normalizeRanges(
            calendar.second ?? [{ start: 0, end: 0, step: 1 }],
            0,
          ),
          month: calendar.month
            ? normalizeRanges(calendar.month, 1)
            : [{ start: 1, end: 12, step: 1 }],
          year: calendar.year ? normalizeRanges(calendar.year, 0) : undefined,
          comment: calendar.comment ?? '',
        },
      }),
    );
  }

  for (const interval of spec?.interval ?? []) {
    specs.push(
      parseFormSpec({
        kind: 'frozen',
        interval: {
          interval: durationString().safeParse(interval.interval)?.data ?? '0s',
          phase: durationString().safeParse(interval.phase)?.data ?? '0s',
        },
      }),
    );
  }

  return specs;
}

export function getFormSpecsFromDescribeFullSchedule(
  describeFullSchedule: DescribeFullSchedule,
): FormSpecSchema[] {
  return getFormSpecFromSpec(describeFullSchedule?.schedule?.spec);
}
