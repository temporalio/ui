import type { DescribeFullSchedule } from '$lib/types/schedule';

import { type FormSpecSchema, formSpecSchema } from '../schema/form';

import type { ScheduleSpec } from '$types';

export function getFormSpecFromSpec(
  spec: ScheduleSpec | null | undefined,
): FormSpecSchema[] {
  const specs: FormSpecSchema[] = [];

  for (const calendar of spec?.structuredCalendar ?? []) {
    const parsed = formSpecSchema.safeParse({
      kind: 'frozen',
      calendar,
    });

    if (parsed.success) {
      specs.push(parsed.data);
    }
  }

  for (const interval of spec?.interval ?? []) {
    const parsed = formSpecSchema.safeParse({
      kind: 'frozen',
      interval,
    });

    if (parsed.success) {
      specs.push(parsed.data);
    }
  }

  return specs;
}

export function getFormSpecsFromDescribeFullSchedule(
  describeFullSchedule: DescribeFullSchedule,
): FormSpecSchema[] {
  return getFormSpecFromSpec(describeFullSchedule?.schedule?.spec);
}
