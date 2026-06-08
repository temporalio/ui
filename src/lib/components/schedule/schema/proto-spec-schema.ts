import { z } from 'zod/v3';

import type { RangeSpec } from '$lib/types';
import { sortNumStrings } from '$lib/utilities/array';

import { DAYS_OF_MONTH_SET, DAYS_OF_WEEK_SET, MONTHS_SET } from '../constants';
import type { DayOfMonth, DayOfWeek, Month } from '../types';
import { type ScheduleSpecItem } from './spec-item-form-schema';
import { expandRanges } from '../utilities/range';

type ProtoCalendarField = RangeSpec[] | string | number | null | undefined;

type ProtoSpec = {
  structuredCalendar?: unknown[] | null;
  calendar?: unknown[] | null;
  interval?: { interval?: unknown; phase?: unknown }[] | null;
  cronString?: string[] | null;
};

// Calendar fields arrive as `IRange[]` from `structuredCalendar` (the modern
// describe response) or comma-separated strings from the deprecated `calendar`.
// Normalize either shape into a sorted list of numbers.
function parseCalendarField(field: ProtoCalendarField): number[] {
  if (field == null) return [];

  if (Array.isArray(field)) {
    if (field.length > 0 && typeof field[0] === 'object') {
      return expandRanges(field as RangeSpec[]);
    }

    return (field as (string | number)[])
      .flatMap((v) => String(v).split(','))
      .map((v) => Number(v.trim()))
      .filter((n) => Number.isFinite(n));
  }

  return String(field)
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v && v !== '*')
    .map(Number)
    .filter((n) => Number.isFinite(n));
}

function cronStringToSpec(
  cronStr: string,
): (ScheduleSpecItem & { type: 'cron' }) | undefined {
  if (!cronStr) return;

  const cleanCron = cronStr.replace(/#.*$/gm, '').trim();

  return { type: 'cron', cronString: cleanCron };
}

const calendarField = z.preprocess(
  (value) => parseCalendarField(value as ProtoCalendarField),
  z.array(z.number()),
);

// Coerce a single proto calendar entry (structured or deprecated) into the
// canonical form `ScheduleSpecItem`. The return is type-checked, but it is not
// piped back through `scheduleSpecItemFormSchema` because that schema enforces
// form-input rules (e.g. at least one month) that a parsed schedule may not
// satisfy (e.g. "every month" carries no explicit months).
const protoCalendarToSpec = z
  .object({
    comment: z.string().nullish(),
    dayOfWeek: calendarField,
    dayOfMonth: calendarField,
    month: calendarField,
    hour: calendarField,
    minute: calendarField,
  })
  .transform((calendar): ScheduleSpecItem => {
    if (calendar.comment) {
      const cron = cronStringToSpec(calendar.comment);
      if (cron) return cron;
    }

    const time = {
      hour: calendar.hour[0] ?? 0,
      minute: calendar.minute[0] ?? 0,
    };

    if (calendar.dayOfWeek.length && !calendar.dayOfMonth.length) {
      return {
        type: 'week',
        time,
        daysOfWeek: sortNumStrings(
          calendar.dayOfWeek
            .map((d) => String(d))
            .filter((d): d is DayOfWeek => DAYS_OF_WEEK_SET.has(d)),
        ),
      };
    }

    return {
      type: 'month',
      time,
      daysOfMonth: sortNumStrings(
        calendar.dayOfMonth
          .map((d) => String(d))
          .filter((d): d is DayOfMonth => DAYS_OF_MONTH_SET.has(d)),
      ),
      months: sortNumStrings(
        calendar.month
          .map((m) => String(m))
          .filter((m): m is Month => MONTHS_SET.has(m)),
      ),
    };
  });

// Normalize a proto `ScheduleSpec` (cron strings, calendars, intervals) into the
// canonical list of form spec items. This is the single source of truth for the
// proto -> form direction; the form -> request direction lives in
// `form-data-to-request-data.ts`.
export function protoSpecToFormSpecs(
  spec: ProtoSpec | null,
): ScheduleSpecItem[] {
  const specs: ScheduleSpecItem[] = [];

  for (const cron of spec?.cronString ?? []) {
    const cronSpec = cronStringToSpec(cron);
    if (cronSpec) specs.push(cronSpec);
  }

  const calendars = spec?.structuredCalendar ?? spec?.calendar ?? [];
  for (const calendar of calendars) {
    specs.push(protoCalendarToSpec.parse(calendar));
  }

  for (const interval of spec?.interval ?? []) {
    specs.push({
      type: 'interval',
      interval: interval?.interval?.toString() ?? '0s',
      phase: interval?.phase?.toString() ?? '0s',
    });
  }

  return specs;
}
