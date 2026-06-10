import cronstrue from 'cronstrue';

import { getMonthLabel, getWeekdayLabel } from '$lib/i18n/format-date-names';
import { formatList } from '$lib/i18n/format-list';
import { translate } from '$lib/i18n/translate';
import { sortNumbers } from '$lib/utilities/array';

import {
  DAYS_OF_MONTH,
  DAYS_OF_WEEK,
  durationUnits,
  intervalUnits,
  MONTHS,
  WEEKDAYS,
  WEEKEND,
} from '../constants';
import { getLargestWholeUnit } from './duration';
import { getFormSpecFromSpec } from './get-form-spec';
import { expandRanges } from './range';
import {
  type FormScheduleTimingSchema,
  type FormSpecSchema,
} from '../schema/form';

import type { ScheduleSpec } from '$types';

// Summarize a proto `ScheduleSpec` (or any subset, e.g. an exclusion calendar)
// for read-only views by normalizing it into frozen form specs and reusing the
// form-side summary so both paths render through one code path.
export function summarizeScheduleSpec(
  spec: ScheduleSpec | null | undefined,
): string {
  const timing = { timezoneName: spec?.timezoneName ?? 'UTC' };

  return getFormSpecFromSpec(spec)
    .map((item) => getScheduleSpecSummary(item, timing))
    .filter(Boolean)
    .join('; ');
}

export function getScheduleSpecSummary(
  spec: FormSpecSchema,
  timing: FormScheduleTimingSchema,
) {
  switch (spec.kind) {
    case 'none': {
      return '';
    }

    case 'cron': {
      return summarizeCronSpec(spec, timing);
    }

    case 'week': {
      return summarizeWeekSpec(spec, timing);
    }

    case 'month': {
      return summarizeMonthSpec(spec, timing);
    }

    case 'interval': {
      return summarizeIntervalSpec(spec, timing);
    }

    case 'frozen': {
      return summarizeFrozenSpec(spec, timing);
    }
  }
}

const pad0ForTime = (num = 0): string => num.toString().padStart(2, '0');

function getCalendarTime(
  calendar: FormSpecSchema['calendar'],
  timezone: string,
): string {
  const hour = calendar.hour?.[0]?.start ?? 0;
  const minute = calendar.minute?.[0]?.start ?? 0;
  return `${pad0ForTime(hour)}:${pad0ForTime(minute)} ${timezone}`;
}

function summarizeCronSpec(
  spec: FormSpecSchema,
  _timing: FormScheduleTimingSchema,
): string {
  try {
    return cronstrue.toString(spec.cronString, {
      verbose: true,
      use24HourTimeFormat: true,
    });
  } catch {
    return '';
  }
}

function summarizeWeekSpec(
  spec: FormSpecSchema,
  timing: FormScheduleTimingSchema,
): string {
  const { calendar } = spec;
  const timezone = timing.timezoneName;

  const selectedSet = new Set(expandRanges(calendar.dayOfWeek));
  const time = getCalendarTime(calendar, timezone);

  console.log({ week: selectedSet, time });

  if (DAYS_OF_WEEK.every((d) => selectedSet.has(d))) {
    return translate('schedules.spec-summary-everyday', { time });
  }

  if (WEEKDAYS.every((d) => selectedSet.has(d))) {
    return translate('schedules.spec-summary-weekdays', { time });
  }

  if (WEEKEND.every((d) => selectedSet.has(d))) {
    return translate('schedules.spec-summary-weekends', { time });
  }

  const sortedLabels = sortNumbers(Array.from(selectedSet)).map((d) =>
    getWeekdayLabel(Number(d)),
  );

  return translate('schedules.spec-summary-week', {
    days: formatList(sortedLabels),
    time,
  });
}

function summarizeMonthSpec(
  spec: FormSpecSchema,
  timing: FormScheduleTimingSchema,
): string {
  const { calendar } = spec;
  const timezone = timing.timezoneName;

  const selectedMonths = new Set(expandRanges(calendar.month));
  const selectedDays = new Set(expandRanges(calendar.dayOfMonth));

  const time = getCalendarTime(calendar, timezone);

  const sortedDays = sortNumbers(Array.from(selectedDays));
  const formattedDays = formatList(sortedDays.map(String));

  const isEveryDay = DAYS_OF_MONTH.every((d) => selectedDays.has(d));
  const daysStr = isEveryDay
    ? translate('schedules.spec-summary-every-day')
    : translate('schedules.spec-summary-days', {
        count: sortedDays.length,
        days: formattedDays,
      });

  const isEveryMonth =
    selectedMonths.size === 0 || MONTHS.every((m) => selectedMonths.has(m));

  if (isEveryMonth) {
    return translate('schedules.spec-summary-month-every', {
      days: daysStr,
      time,
    });
  }

  const sortedMonthLabels = sortNumbers(Array.from(selectedMonths)).map((m) =>
    getMonthLabel(Number(m) - 1),
  );

  return translate('schedules.spec-summary-month', {
    days: daysStr,
    months: formatList(sortedMonthLabels),
    time,
  });
}

function summarizeIntervalSpec(
  spec: FormSpecSchema,
  _timing: FormScheduleTimingSchema,
): string {
  const { interval, phase } = spec.interval;

  if (!interval) {
    return '';
  }

  const largest = getLargestWholeUnit(interval, intervalUnits);
  const offset = getLargestWholeUnit(phase ?? '0s', durationUnits);

  return translate('schedules.spec-summary-interval', {
    interval: largest.value,
    intervalUnit: largest.unit.label,
    offset: offset.value,
    offsetUnit: offset.unit.label,
  });
}

// A frozen spec is loaded verbatim from a `DescribeFullSchedule` and carries
// either an interval or a structured calendar of arbitrary field combinations.
// Mirror the interval-vs-calendar split used when re-emitting the request, then
// pick the week- or month-style summary based on which day field is restricted.
function summarizeFrozenSpec(
  spec: FormSpecSchema,
  timing: FormScheduleTimingSchema,
): string {
  if (spec.interval?.interval) {
    return summarizeIntervalSpec(spec, timing);
  }

  const { calendar } = spec;
  const daysOfWeek = new Set(expandRanges(calendar.dayOfWeek));
  const daysOfMonth = new Set(expandRanges(calendar.dayOfMonth));

  const isEveryDayOfWeek = DAYS_OF_WEEK.every((d) => daysOfWeek.has(d));
  const isEveryDayOfMonth = DAYS_OF_MONTH.every((d) => daysOfMonth.has(d));

  const isWeek = !isEveryDayOfWeek && isEveryDayOfMonth;

  const summary = isWeek
    ? summarizeWeekSpec(spec, timing)
    : summarizeMonthSpec(spec, timing);

  // The CLI can pin a structured calendar to specific years; the week/month
  // summaries omit it, so append the year(s) here when present.
  const years = sortNumbers(expandRanges(calendar.year));
  if (years.length) {
    return `${summary} ${translate('schedules.spec-summary-year', {
      years: formatList(years.map(String)),
    })}`;
  }

  return summary;
}
