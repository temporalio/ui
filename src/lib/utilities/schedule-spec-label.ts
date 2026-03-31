import type {
  IntervalSpec,
  RangeSpec,
  StructuredCalendarSpec,
} from '$lib/types';

import { formatDuration } from './format-time';

function toSecondsString(d: unknown): string {
  if (d == null) return '';
  if (typeof d === 'string') return d.endsWith('s') ? d : '';
  if (typeof d === 'object' && 'seconds' in d) {
    const obj = d as { seconds: string | number };
    return `${obj.seconds}s`;
  }
  return '';
}

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const MONTH_NAMES = [
  '',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function expandRange(range: RangeSpec): number[] {
  const start = range.start ?? 0;
  const end = range.end ?? start;
  const step = range.step && range.step > 0 ? range.step : 1;

  if (end <= start) return [start];

  const values: number[] = [];
  for (let i = start; i <= end; i += step) {
    values.push(i);
  }
  return values;
}

function expandRanges(ranges: RangeSpec[] | undefined | null): number[] {
  if (!ranges || ranges.length === 0) return [];
  const values = new Set<number>();
  for (const range of ranges) {
    for (const v of expandRange(range)) {
      values.add(v);
    }
  }
  return [...values].sort((a, b) => a - b);
}

function isFullRange(values: number[], min: number, max: number): boolean {
  if (values.length === 0) return true;
  if (values.length !== max - min + 1) return false;
  return values.every((v, i) => v === min + i);
}

function isWeekdays(dayOfWeek: RangeSpec[] | undefined | null): boolean {
  const values = expandRanges(dayOfWeek);
  return (
    values.length === 5 &&
    values[0] === 1 &&
    values[1] === 2 &&
    values[2] === 3 &&
    values[3] === 4 &&
    values[4] === 5
  );
}

function isWeekends(dayOfWeek: RangeSpec[] | undefined | null): boolean {
  const values = expandRanges(dayOfWeek);
  return (
    (values.length === 2 && values[0] === 0 && values[1] === 6) ||
    (values.length === 2 && values[0] === 6 && values[1] === 0)
  );
}

function isAllDays(dayOfWeek: RangeSpec[] | undefined | null): boolean {
  if (!dayOfWeek || dayOfWeek.length === 0) return true;
  const values = expandRanges(dayOfWeek);
  return isFullRange(values, 0, 6);
}

function isAllMonths(month: RangeSpec[] | undefined | null): boolean {
  if (!month || month.length === 0) return true;
  const values = expandRanges(month);
  return isFullRange(values, 1, 12);
}

function isAllDaysOfMonth(dayOfMonth: RangeSpec[] | undefined | null): boolean {
  if (!dayOfMonth || dayOfMonth.length === 0) return true;
  const values = expandRanges(dayOfMonth);
  return isFullRange(values, 1, 31);
}

function formatHour12(hour: number): { hour: number; period: string } {
  if (hour === 0) return { hour: 12, period: 'AM' };
  if (hour < 12) return { hour, period: 'AM' };
  if (hour === 12) return { hour: 12, period: 'PM' };
  return { hour: hour - 12, period: 'PM' };
}

function formatSingleTime(hour: number, minute: number): string {
  const { hour: h, period } = formatHour12(hour);
  const min = minute.toString().padStart(2, '0');
  return `${h}:${min} ${period}`;
}

function formatTime(
  hour: RangeSpec[] | undefined | null,
  minute: RangeSpec[] | undefined | null,
): string {
  const hours = expandRanges(hour);
  const minutes = expandRanges(minute);
  const min = minutes.length === 1 ? minutes[0] : 0;

  if (hours.length === 0) return '';

  if (hours.length === 1) {
    return formatSingleTime(hours[0], min);
  }

  if (hours.length === 2) {
    return `${formatSingleTime(hours[0], min)} and ${formatSingleTime(hours[1], min)}`;
  }

  const times = hours.map((h) => formatSingleTime(h, min));
  return `${times.slice(0, -1).join(', ')}, and ${times[times.length - 1]}`;
}

function getDayNames(dayOfWeek: RangeSpec[] | undefined | null): string {
  const values = expandRanges(dayOfWeek);
  return values.map((v) => DAY_NAMES[v] ?? `Day ${v}`).join(', ');
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function getSingleCalendarLabel(
  spec: StructuredCalendarSpec,
  timezone: string,
): string {
  const time = formatTime(spec.hour, spec.minute);
  const timeWithTz = time ? `at ${time} ${timezone}` : '';
  const allDays = isAllDays(spec.dayOfWeek);
  const allMonths = isAllMonths(spec.month);
  const allDaysOfMonth = isAllDaysOfMonth(spec.dayOfMonth);

  if (isWeekdays(spec.dayOfWeek) && allMonths && allDaysOfMonth) {
    return `Every weekday ${timeWithTz}`.trim();
  }

  if (isWeekends(spec.dayOfWeek) && allMonths && allDaysOfMonth) {
    return `Every weekend ${timeWithTz}`.trim();
  }

  if (allDays && allMonths && allDaysOfMonth && time) {
    return `Every day ${timeWithTz}`.trim();
  }

  const dayOfMonthValues = expandRanges(spec.dayOfMonth);
  const monthValues = expandRanges(spec.month);

  if (
    !allMonths &&
    monthValues.length === 1 &&
    !allDaysOfMonth &&
    dayOfMonthValues.length === 1
  ) {
    const monthName = MONTH_NAMES[monthValues[0]] ?? `Month ${monthValues[0]}`;
    const day = ordinal(dayOfMonthValues[0]);
    return `Annually on ${monthName} ${day} ${timeWithTz}`.trim();
  }

  if (
    allMonths &&
    !allDaysOfMonth &&
    dayOfMonthValues.length === 1 &&
    allDays
  ) {
    const day = ordinal(dayOfMonthValues[0]);
    return `Monthly on the ${day} ${timeWithTz}`.trim();
  }

  if (!allDays && allMonths && allDaysOfMonth) {
    const dayNames = getDayNames(spec.dayOfWeek);
    return `Every ${dayNames} ${timeWithTz}`.trim();
  }

  if (allDays && allMonths && allDaysOfMonth && !time) {
    return 'Every second';
  }

  const parts: string[] = [];
  if (!allMonths) {
    parts.push(
      `In ${monthValues.map((m) => MONTH_NAMES[m] ?? `Month ${m}`).join(', ')}`,
    );
  }
  if (!allDaysOfMonth) {
    parts.push(`on the ${dayOfMonthValues.map((d) => ordinal(d)).join(', ')}`);
  }
  if (!allDays) {
    parts.push(`on ${getDayNames(spec.dayOfWeek)}`);
  }
  if (time) {
    parts.push(`at ${time} ${timezone}`);
  }

  return parts.join(' ').trim() || 'Custom schedule';
}

export function getIntervalLabel(spec: IntervalSpec): string {
  const intervalStr = toSecondsString(spec.interval);
  const label = formatDuration(intervalStr);
  if (!label) return '';

  const result = `Every ${label}`;

  const phaseStr = toSecondsString(spec.phase);
  const phaseLabel = formatDuration(phaseStr);
  if (phaseLabel) return `${result}, offset by ${phaseLabel}`;

  return result;
}

export function getCalendarSpecLabel(
  specs: StructuredCalendarSpec[],
  timezone = 'UTC',
): string {
  if (!specs || specs.length === 0) return '';

  if (specs[0].comment) {
    return specs[0].comment;
  }

  if (specs.length === 1) {
    return getSingleCalendarLabel(specs[0], timezone);
  }

  return specs.map((spec) => getSingleCalendarLabel(spec, timezone)).join('; ');
}

export function getScheduleSpecLabel(
  spec: {
    structuredCalendar?: StructuredCalendarSpec[];
    interval?: IntervalSpec[];
  },
  timezone = 'UTC',
): string {
  const parts: string[] = [];

  if (spec.structuredCalendar && spec.structuredCalendar.length > 0) {
    const label = getCalendarSpecLabel(spec.structuredCalendar, timezone);
    if (label) parts.push(label);
  }

  if (spec.interval && spec.interval.length > 0) {
    for (const interval of spec.interval) {
      const label = getIntervalLabel(interval);
      if (label) parts.push(label);
    }
  }

  return parts.join('; ');
}
