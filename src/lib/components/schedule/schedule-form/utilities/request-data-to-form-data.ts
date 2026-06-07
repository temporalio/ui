import type { RangeSpec } from '$lib/types';
import type { FullSchedule } from '$lib/types/schedule';
import type { SearchAttributes } from '$lib/types/workflows';
import { sortNumStrings } from '$lib/utilities/array';
import { parsePayloadAttributes } from '$lib/utilities/decode-payload';

import { DAYS_OF_MONTH_SET, DAYS_OF_WEEK_SET, MONTHS_SET } from '../constants';
import {
  DEFAULT_CATCHUP_WINDOW,
  DEFAULT_EXECUTION_TIMEOUT,
  DEFAULT_RUN_TIMEOUT,
  DEFAULT_TASK_TIMEOUT,
} from '../policies-schema';
import type { ScheduleFormData, ScheduleSpecItem } from '../schema';
import type { DayOfMonth, DayOfWeek, Month } from '../types';
import { expandRanges } from './range';
import { getInitialSpecData } from './spec';

import type { SearchAttribute } from '$types';

const stringOrDefault = (
  value: string | number | object | null | undefined,
  fallback: string,
): string => (value ? String(value) : fallback);

const decodeSearchAttributeRows = (
  searchAttributes: SearchAttribute,
  customSearchAttributes: SearchAttributes,
): ScheduleFormData['searchAttributes'] => {
  const decoded = parsePayloadAttributes({ searchAttributes });
  const indexedFields =
    decoded?.searchAttributes.indexedFields ?? ({} as Record<string, string>);

  return Object.entries(indexedFields).map(([label, value]) => ({
    label,
    value,
    type: customSearchAttributes[label],
  }));
};

const parseEndCondition = (
  schedule: FullSchedule | null,
  nowIsoString: string,
): Pick<
  ScheduleFormData,
  'endDateType' | 'endDate' | 'endAfterOccurrences'
> => {
  const remainingActions =
    schedule?.state?.limitedActions && schedule?.state?.remainingActions
      ? Number(schedule.state.remainingActions)
      : undefined;

  const endDate = stringOrDefault(schedule?.spec?.endTime, nowIsoString);

  if (remainingActions) {
    return {
      endDateType: 'after',
      endDate,
      endAfterOccurrences: remainingActions,
    };
  }

  if (schedule?.spec?.endTime) {
    return { endDateType: 'on', endDate, endAfterOccurrences: undefined };
  }

  return { endDateType: 'never', endDate, endAfterOccurrences: undefined };
};

const OVERLAP_POLICY_MAP: Record<string, ScheduleFormData['overlapPolicy']> = {
  SCHEDULE_OVERLAP_POLICY_SKIP: 'Skip',
  SCHEDULE_OVERLAP_POLICY_BUFFER_ONE: 'BufferOne',
  SCHEDULE_OVERLAP_POLICY_BUFFER_ALL: 'BufferAll',
  SCHEDULE_OVERLAP_POLICY_CANCEL_OTHER: 'CancelOther',
  SCHEDULE_OVERLAP_POLICY_TERMINATE_OTHER: 'TerminateOther',
  SCHEDULE_OVERLAP_POLICY_ALLOW_ALL: 'AllowAll',
  Skip: 'Skip',
  BufferOne: 'BufferOne',
  BufferAll: 'BufferAll',
  CancelOther: 'CancelOther',
  TerminateOther: 'TerminateOther',
  AllowAll: 'AllowAll',
};

export function parseOverlapPolicy(
  value?: string | number | null,
): ScheduleFormData['overlapPolicy'] {
  if (!value) return 'Skip';

  return OVERLAP_POLICY_MAP[String(value)] ?? 'Skip';
}

function cronStringToSpec(
  cronStr: string,
): (ScheduleSpecItem & { type: 'cron' }) | undefined {
  if (!cronStr) {
    return;
  }

  const cleanCron = cronStr
    // strip off any comment
    .replace(/#.*$/gm, '')
    .trim();

  return {
    type: 'cron',
    cronString: cleanCron,
  };
}

function parseCronSpecs(
  schedule: FullSchedule,
): (ScheduleSpecItem & { type: 'cron' })[] {
  const specs: (ScheduleSpecItem & { type: 'cron' })[] = [];

  for (const cron of schedule?.spec?.cronString ?? []) {
    const spec = cronStringToSpec(cron);

    if (spec) {
      specs.push(spec);
    }
  }

  return specs;
}

// Calendar fields arrive as `IRange[]` from `structuredCalendar` (the modern
// describe response) or comma-separated strings from the deprecated `calendar`.
// Normalize either shape into a sorted list of numbers.
function parseCalendarField(
  field: RangeSpec[] | string | number | null | undefined,
): number[] {
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

function parseCalendarSpecs(schedule: FullSchedule): ScheduleSpecItem[] {
  const specs: ScheduleSpecItem[] = [];

  const calendars =
    schedule?.spec?.structuredCalendar ?? schedule?.spec?.calendar ?? [];

  for (const calendar of calendars) {
    // a calendar can actualy have come from a cron string
    if (calendar.comment) {
      const spec = cronStringToSpec(calendar.comment);
      if (spec) {
        specs.push(spec);
        continue;
      }
    }

    const daysOfWeek = parseCalendarField(calendar?.dayOfWeek);
    const daysOfMonth = parseCalendarField(calendar?.dayOfMonth);
    const months = parseCalendarField(calendar?.month);
    const hoursField = parseCalendarField(calendar?.hour);
    const minutesField = parseCalendarField(calendar?.minute);

    const time = {
      hour: hoursField.length > 0 ? hoursField[0] : 0,
      minute: minutesField.length > 0 ? minutesField[0] : 0,
    };

    if (daysOfWeek.length && !daysOfMonth.length) {
      specs.push({
        type: 'week',
        time,
        daysOfWeek: sortNumStrings(
          daysOfWeek
            .map((d) => String(d))
            .filter((d): d is DayOfWeek => DAYS_OF_WEEK_SET.has(d)),
        ),
      });
      continue;
    }

    specs.push({
      type: 'month',
      time,
      daysOfMonth: sortNumStrings(
        daysOfMonth
          .map((d) => String(d))
          .filter((d): d is DayOfMonth => DAYS_OF_MONTH_SET.has(d)),
      ),
      months: sortNumStrings(
        months
          .map((m) => String(m))
          .filter((m): m is Month => MONTHS_SET.has(m)),
      ),
    });
  }

  return specs;
}

function parseIntervalSpecs(
  schedule: FullSchedule,
): (ScheduleSpecItem & { type: 'interval' })[] {
  const specs: (ScheduleSpecItem & { type: 'interval' })[] = [];

  for (const interval of schedule?.spec?.interval ?? []) {
    const intervalDurationStr = interval?.interval?.toString() ?? '0s';
    const phaseDurationStr = interval?.phase?.toString() ?? '0s';

    specs.push({
      type: 'interval',
      interval: intervalDurationStr,
      phase: phaseDurationStr,
    });
  }

  return specs;
}

function parseScheduleSpecs(schedule: FullSchedule): ScheduleSpecItem[] {
  const specs: ScheduleSpecItem[] = [
    ...parseCronSpecs(schedule),
    ...parseCalendarSpecs(schedule),
    ...parseIntervalSpecs(schedule),
  ];

  if (specs.length) {
    return specs;
  }

  return [getInitialSpecData('cron')];
}

type ScheduleToFormDataParams = {
  schedule: FullSchedule | null;
  searchAttributes?: SearchAttribute;
  customSearchAttributes?: SearchAttributes;
  scheduleId: string;
};

export function scheduleToFormData({
  schedule,
  searchAttributes = {},
  customSearchAttributes = {},
  scheduleId,
}: ScheduleToFormDataParams): ScheduleFormData {
  const startWorkflow = schedule?.action?.startWorkflow;
  const spec = schedule?.spec;
  const policies = schedule?.policies;
  const nowIsoString = new Date().toISOString();

  return {
    name: scheduleId ?? '',
    workflowType: startWorkflow?.workflowType?.name ?? '',
    workflowId: startWorkflow?.workflowId ?? '',
    taskQueue: startWorkflow?.taskQueue?.name ?? '',

    input: '',
    editInput: !schedule,
    encoding: 'json/plain',
    messageType: '',

    specs: schedule
      ? parseScheduleSpecs(schedule)
      : [getInitialSpecData('cron')],
    timezoneName: spec?.timezoneName ?? 'UTC',
    startDate: stringOrDefault(spec?.startTime, nowIsoString),
    jitter: stringOrDefault(spec?.jitter, '0'),
    ...parseEndCondition(schedule, nowIsoString),

    overlapPolicy: parseOverlapPolicy(policies?.overlapPolicy),
    catchupWindow: stringOrDefault(
      policies?.catchupWindow,
      DEFAULT_CATCHUP_WINDOW,
    ),
    pauseOnFailure: policies?.pauseOnFailure ?? false,
    pauseSchedule: schedule?.state?.paused ?? false,
    keepOriginalWorkflowId: policies?.keepOriginalWorkflowId ?? false,

    taskTimeout: stringOrDefault(
      startWorkflow?.workflowTaskTimeout,
      DEFAULT_TASK_TIMEOUT,
    ),
    runTimeout: stringOrDefault(
      startWorkflow?.workflowRunTimeout,
      DEFAULT_RUN_TIMEOUT,
    ),
    executionTimeout: stringOrDefault(
      startWorkflow?.workflowExecutionTimeout,
      DEFAULT_EXECUTION_TIMEOUT,
    ),

    searchAttributes: decodeSearchAttributeRows(
      searchAttributes,
      customSearchAttributes,
    ),
    workflowSearchAttributes: decodeSearchAttributeRows(
      startWorkflow?.searchAttributes ?? {},
      customSearchAttributes,
    ),
  };
}
