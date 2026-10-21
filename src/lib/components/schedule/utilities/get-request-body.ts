import type { ScheduleFormData } from '../types';
import { isValidCronString } from './cron';
import {
  calendarDateStrToEndOfDayTimestamp,
  calendarDateStrToTimestamp,
  isoStringToCalendarDateStr,
} from './date';
import { getSearchAttributes } from './get-search-attributes';
import { toScheduledActionRequest } from '../scheduled-action-types/request-mappings';
import { resolveScheduledAction } from '../scheduled-action-types/resolve-scheduled-action';
import type { FormScheduleSchema } from '../schema/form';

import type {
  DescribeFullSchedule,
  ScheduleInterval,
  SchedulePoliciesRequest,
  ScheduleRequestBody,
  ScheduleSpecRequest,
  ScheduleStateRequest,
  StructuredCalendar,
} from '$types/schedule';

function getScheduleStateRequest(
  scheduleForm: FormScheduleSchema,
  describeFullSchedule: DescribeFullSchedule | null = null,
): ScheduleStateRequest {
  const existingState = describeFullSchedule?.schedule?.state ?? {};

  return {
    ...existingState,
    ...(scheduleForm.endKind === 'after' && scheduleForm.endAfterOccurrences
      ? {
          limitedActions: true,
          remainingActions: scheduleForm.endAfterOccurrences,
        }
      : { limitedActions: false, remainingActions: undefined }),
    paused: scheduleForm.pauseSchedule,
  } satisfies ScheduleStateRequest;
}

function getSchedulePoliciesRequest(
  scheduleForm: FormScheduleSchema,
): SchedulePoliciesRequest {
  return {
    overlapPolicy: scheduleForm.overlapPolicy,
    catchupWindow: scheduleForm.catchupWindow || undefined,
    pauseOnFailure: scheduleForm.pauseOnFailure,
  } satisfies SchedulePoliciesRequest;
}

type SpecFormItem = FormScheduleSchema['specs'][number];

const defaultTimeRange = () => [{ start: 0, end: 0, step: 1 }];

// An empty second/minute/hour range tells the server to exclude everything, so
// the schedule gets no future runs. Default emptied fields to 0 so a cleared
// calendar (or a spec loaded without these fields) still fires.
function toStructuredCalendar(
  calendar: SpecFormItem['calendar'],
): StructuredCalendar {
  const { comment, ...ranges } = calendar;
  return {
    ...ranges,
    second: ranges.second?.length ? ranges.second : defaultTimeRange(),
    minute: ranges.minute?.length ? ranges.minute : defaultTimeRange(),
    hour: ranges.hour?.length ? ranges.hour : defaultTimeRange(),
    ...(comment ? { comment } : {}),
  };
}

function toInterval(interval: SpecFormItem['interval']): ScheduleInterval {
  return {
    interval: interval.interval,
    phase: interval.phase || '0s',
  } as ScheduleInterval;
}

// Keep the exact existing timestamp when the form's calendar date still
// matches it, so editing unrelated fields doesn't shift sub-day times the
// form can't represent.
function getSpecStartTime(
  scheduleForm: FormScheduleSchema,
  existingSpec: NonNullable<DescribeFullSchedule['schedule']>['spec'],
  timeZone: string,
): Pick<ScheduleSpecRequest, 'startTime'> {
  const existing = existingSpec?.startTime
    ? String(existingSpec.startTime)
    : undefined;

  if (
    existing &&
    isoStringToCalendarDateStr(existing, timeZone) === scheduleForm.startTime
  ) {
    return { startTime: existing };
  }

  // An existing schedule may have no startTime at all; don't invent one
  // unless the user moved the date off the untouched default (today).
  if (
    existingSpec &&
    !existing &&
    scheduleForm.startTime ===
      isoStringToCalendarDateStr(new Date().toISOString(), timeZone)
  ) {
    return {};
  }

  return {
    startTime: calendarDateStrToTimestamp(scheduleForm.startTime, timeZone),
  };
}

function getSpecEndTime(
  scheduleForm: FormScheduleSchema,
  existingSpec: NonNullable<DescribeFullSchedule['schedule']>['spec'],
  timeZone: string,
): Pick<ScheduleSpecRequest, 'endTime'> {
  if (scheduleForm.endKind !== 'on' || !scheduleForm.endTime) {
    return {};
  }

  const existing = existingSpec?.endTime
    ? String(existingSpec.endTime)
    : undefined;

  if (
    existing &&
    isoStringToCalendarDateStr(existing, timeZone) === scheduleForm.endTime
  ) {
    return { endTime: existing };
  }

  return {
    endTime: calendarDateStrToEndOfDayTimestamp(scheduleForm.endTime, timeZone),
  };
}

function getScheduleSpecRequest(
  scheduleForm: FormScheduleSchema,
  describeFullSchedule: DescribeFullSchedule | null = null,
): ScheduleSpecRequest {
  const existingSpec = describeFullSchedule?.schedule?.spec;
  const timeZone = scheduleForm.timezoneName || 'UTC';
  const interval: ScheduleInterval[] = [];
  const cronString: string[] = [];
  const structuredCalendar: StructuredCalendar[] = [];

  for (const item of scheduleForm.specs) {
    switch (item.kind) {
      case 'none': {
        break;
      }

      case 'cron': {
        const trimmed = item.cronString?.trim();
        if (trimmed && isValidCronString(trimmed)) {
          cronString.push(trimmed);
        }
        break;
      }

      case 'interval': {
        interval.push(toInterval(item.interval));
        break;
      }

      case 'week':
      case 'month': {
        structuredCalendar.push(toStructuredCalendar(item.calendar));
        break;
      }

      // Specs loaded from a DescribeFullSchedule lose their original kind —
      // the server consolidates everything into a structured calendar or an
      // interval. They can be deleted but not edited, so re-emit them verbatim
      // from whichever representation the item carries.
      case 'frozen': {
        if (item.interval?.interval) {
          interval.push(toInterval(item.interval));
        } else {
          structuredCalendar.push(toStructuredCalendar(item.calendar));
        }
        break;
      }
    }
  }

  return {
    // Preserve spec fields the form doesn't model, e.g. exclusion calendars
    // set via the CLI or an SDK, so editing doesn't silently clear them
    ...(existingSpec?.excludeStructuredCalendar?.length && {
      excludeStructuredCalendar: existingSpec.excludeStructuredCalendar,
    }),
    ...(existingSpec?.timezoneData && {
      timezoneData: existingSpec.timezoneData,
    }),
    interval,
    cronString,
    structuredCalendar,
    timezoneName: timeZone,
    ...getSpecStartTime(scheduleForm, existingSpec, timeZone),
    ...getSpecEndTime(scheduleForm, existingSpec, timeZone),
    ...(scheduleForm.jitter &&
      scheduleForm.jitter > 0 && {
        jitter: `${scheduleForm.jitter}s`,
      }),
  } satisfies ScheduleSpecRequest;
}

export async function getRequestBody(
  formData: ScheduleFormData,
  describeFullSchedule: DescribeFullSchedule | null = null,
): Promise<ScheduleRequestBody> {
  const { schedule: scheduleForm, action: actionForm } = formData;

  const resolvedAction = resolveScheduledAction(
    describeFullSchedule,
    actionForm.type,
  );
  if (
    resolvedAction.type === 'unknown' ||
    resolvedAction.type !== actionForm.type
  ) {
    throw new Error(
      'Cannot save a schedule with a missing, unsupported, or mismatched action type',
    );
  }

  const { action: actionRequest, policies: actionPoliciesRequest } =
    await toScheduledActionRequest(actionForm, resolvedAction);

  return {
    schedule_id: describeFullSchedule?.schedule_id ?? scheduleForm.name,
    searchAttributes: getSearchAttributes(scheduleForm.searchAttributes),
    schedule: {
      spec: getScheduleSpecRequest(scheduleForm, describeFullSchedule),
      action: actionRequest,
      policies: {
        ...getSchedulePoliciesRequest(scheduleForm),
        ...actionPoliciesRequest,
      },
      state: getScheduleStateRequest(scheduleForm, describeFullSchedule),
    },
  } satisfies ScheduleRequestBody;
}
