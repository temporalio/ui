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
import { compactToRanges, expandRanges } from './range';
import { type FormSpecSchema } from '../schema/form';

import type { ScheduleSpec } from '$types';

// Summarize a proto `ScheduleSpec` (or any subset, e.g. an exclusion calendar)
// for read-only views by normalizing it into frozen form specs and reusing the
// form-side summary so both paths render through one code path.
export function summarizeScheduleSpec(
  spec: ScheduleSpec | null | undefined,
): string[] {
  return getFormSpecFromSpec(spec)
    .map((item) => getScheduleSpecSummary(item))
    .filter(Boolean);
}

export function getScheduleSpecSummary(spec: FormSpecSchema) {
  switch (spec.kind) {
    case 'none': {
      return '';
    }

    case 'cron': {
      return summarizeCronSpec(spec);
    }

    case 'week':
    case 'month': {
      return summarizeCalendar(spec.calendar);
    }

    case 'interval': {
      return summarizeIntervalSpec(spec);
    }

    // A frozen spec is loaded verbatim from a `DescribeFullSchedule` and
    // carries either an interval or a structured calendar; mirror the split
    // used when re-emitting the request.
    case 'frozen': {
      return spec.interval?.interval
        ? summarizeIntervalSpec(spec)
        : summarizeCalendar(spec.calendar);
    }
  }
}

const pad0ForTime = (num = 0): string => num.toString().padStart(2, '0');

// The step at which `values` repeat across the whole [min, max] domain (e.g.
// minute 0,15,30,45 over 0-59 repeats every 15), or null when they don't form
// a single arithmetic progression or leave a gap wider than the step at either
// end of the domain.
function getRepeatingStep(
  values: number[],
  min: number,
  max: number,
): number | null {
  const [range, ...rest] = compactToRanges(values);

  if (!range || rest.length) {
    return null;
  }

  const step = range.step ?? 1;
  const end = range.end ?? range.start;

  return range.start - min < step && max - end < step ? step : null;
}

const formatHourWindow = (start: number, end: number, minute = 0): string =>
  `${pad0ForTime(start)}:${pad0ForTime(minute)}-${pad0ForTime(
    end,
  )}:${pad0ForTime(minute)}`;

// A single contiguous hour range that doesn't span the whole day, rendered as
// a "09:00-17:00" window.
function getHourWindow(hours: number[]): string | null {
  const [range, ...rest] = compactToRanges(hours);

  if (!range || rest.length || (range.step ?? 1) !== 1) {
    return null;
  }

  const end = range.end ?? range.start;

  if (end <= range.start) {
    return null;
  }

  return formatHourWindow(range.start, end);
}

function getRepeatingTimePhrase(
  calendar: FormSpecSchema['calendar'],
): string | null {
  const seconds = expandRanges(calendar.second);
  const minutes = expandRanges(calendar.minute);
  const hours = expandRanges(calendar.hour);

  const secondStep = getRepeatingStep(seconds, 0, 59);
  const minuteStep = getRepeatingStep(minutes, 0, 59);
  const hourStep = getRepeatingStep(hours, 0, 23);

  if (secondStep !== null && minuteStep === 1 && hourStep === 1) {
    return translate('schedules.spec-summary-every-seconds', {
      count: secondStep,
    });
  }

  if (minuteStep !== null && seconds.length <= 1) {
    const everyMinutes = translate('schedules.spec-summary-every-minutes', {
      count: minuteStep,
    });

    if (hourStep === 1) {
      return everyMinutes;
    }

    const window = getHourWindow(hours);
    if (window) {
      return `${everyMinutes} ${window}`;
    }
  }

  if (minutes.length <= 1 && seconds.length <= 1) {
    if (hourStep !== null) {
      return translate('schedules.spec-summary-every-hours', {
        count: hourStep,
      });
    }

    // Hours bounded to part of the day, e.g. {start: 9, end: 17, step: 2} →
    // "every 2 hours 09:00-17:00" and {start: 9, end: 17} → "every hour
    // 09:00-17:00". Any two times form a trivial "progression", so require
    // three before phrasing it as repeating.
    const [range, ...rest] = compactToRanges(hours);
    if (range && !rest.length && hours.length >= 3) {
      return `${translate('schedules.spec-summary-every-hours', {
        count: range.step ?? 1,
      })} ${formatHourWindow(
        range.start,
        range.end ?? range.start,
        minutes[0] ?? 0,
      )}`;
    }
  }

  return null;
}

function getCalendarTime(calendar: FormSpecSchema['calendar']): string {
  const hours = expandRanges(calendar.hour);
  const minutes = expandRanges(calendar.minute);
  const minute = minutes.length === 1 ? minutes[0] : 0;

  const time = !hours.length
    ? `${pad0ForTime(0)}:${pad0ForTime(minute)}`
    : formatList(hours.map((h) => `${pad0ForTime(h)}:${pad0ForTime(minute)}`));

  return translate('schedules.spec-summary-at-time', { time });
}

function summarizeCronString(cronString: string): string {
  try {
    return cronstrue.toString(cronString, {
      verbose: true,
      use24HourTimeFormat: true,
    });
  } catch {
    return '';
  }
}

function summarizeCronSpec(spec: FormSpecSchema): string {
  return summarizeCronString(spec.cronString);
}

// A contiguous run renders as a bounded window ("Monday-Thursday", "1-15");
// anything else falls back to a list.
function formatValues(
  values: number[],
  label: (value: number) => string,
): string {
  const [range, ...rest] = compactToRanges(values);

  if (range && !rest.length && (range.step ?? 1) === 1) {
    const end = range.end ?? range.start;

    if (end > range.start) {
      return `${label(range.start)}-${label(end)}`;
    }
  }

  return formatList(sortNumbers(values).map((value) => label(value)));
}

function getDaysOfWeekFragment(
  calendar: FormSpecSchema['calendar'],
): string | null {
  const days = expandRanges(calendar.dayOfWeek);
  const selected = new Set(days);

  if (!days.length || DAYS_OF_WEEK.every((d) => selected.has(d))) {
    return null;
  }

  if (
    selected.size === WEEKDAYS.length &&
    WEEKDAYS.every((d) => selected.has(d))
  ) {
    return translate('schedules.spec-summary-on-weekdays');
  }

  if (
    selected.size === WEEKEND.length &&
    WEEKEND.every((d) => selected.has(d))
  ) {
    return translate('schedules.spec-summary-on-weekends');
  }

  return translate('schedules.spec-summary-on-days-of-week', {
    days: formatValues(days, getWeekdayLabel),
  });
}

function getDaysOfMonthFragment(
  calendar: FormSpecSchema['calendar'],
): string | null {
  const days = expandRanges(calendar.dayOfMonth);
  const selected = new Set(days);

  if (!days.length || DAYS_OF_MONTH.every((d) => selected.has(d))) {
    return null;
  }

  return translate('schedules.spec-summary-on-days-of-month', {
    count: days.length,
    days: formatValues(days, String),
  });
}

function getMonthsFragment(
  calendar: FormSpecSchema['calendar'],
  hasDaysOfMonth: boolean,
): string | null {
  const months = expandRanges(calendar.month);
  const selected = new Set(months);

  if (!months.length || MONTHS.every((m) => selected.has(m))) {
    return null;
  }

  const labels = formatValues(months, (m) => getMonthLabel(m - 1));

  // "on days 1-15 of January" but "At 09:00 in January"
  return hasDaysOfMonth
    ? translate('schedules.spec-summary-of-months', { months: labels })
    : translate('schedules.spec-summary-in-months', { months: labels });
}

function getYearsFragment(calendar: FormSpecSchema['calendar']): string | null {
  const years = expandRanges(calendar.year);

  if (!years.length) {
    return null;
  }

  return translate('schedules.spec-summary-year', {
    years: formatValues(years, String),
  });
}

function summarizeCalendar(calendar: FormSpecSchema['calendar']): string {
  const time = getRepeatingTimePhrase(calendar) ?? getCalendarTime(calendar);

  const daysOfMonth = getDaysOfMonthFragment(calendar);
  const days = [
    getDaysOfWeekFragment(calendar),
    daysOfMonth,
    getMonthsFragment(calendar, Boolean(daysOfMonth)),
  ].filter(Boolean);

  if (!days.length) {
    days.push(translate('schedules.spec-summary-every-day'));
  }

  return [time, ...days, getYearsFragment(calendar)].filter(Boolean).join(' ');
}

function summarizeIntervalSpec(spec: FormSpecSchema): string {
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
