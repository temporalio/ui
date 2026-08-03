import { parseDuration } from '$lib/holocene/duration-input/duration-input.svelte';
import { setSearchAttributes } from '$lib/services/workflow-service';
import type { Payload } from '$lib/types';
import { encodePayloads } from '$lib/utilities/encode-payload';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

import { isValidCronString } from './cron';
import {
  calendarDateStrToEndOfDayTimestamp,
  calendarDateStrToTimestamp,
  isoStringToCalendarDateStr,
} from './date';
import type { FormScheduleSchema } from '../schema/form';

import type {
  DescribeFullSchedule,
  ScheduleActionRequest,
  ScheduleInterval,
  SchedulePoliciesRequest,
  ScheduleRequestBody,
  ScheduleSpecRequest,
  ScheduleStateRequest,
  StructuredCalendar,
} from '$types/schedule';

function getSearchAttributes(attrs: Parameters<typeof setSearchAttributes>[0]) {
  if (!attrs.length) {
    return null;
  }

  return {
    indexedFields: { ...setSearchAttributes(attrs) },
  };
}

type StartWorkflowHeader = NonNullable<
  NonNullable<
    NonNullable<DescribeFullSchedule['schedule']>['action']
  >['startWorkflow']
>['header'];

async function encodeHeaderFields(
  header: StartWorkflowHeader,
): Promise<StartWorkflowHeader> {
  const fields = header?.fields;
  if (!fields || Object.keys(fields).length === 0) {
    return header;
  }

  const encodedEntries = await Promise.all(
    Object.entries(fields).map(async ([key, value]) => {
      const encodedValue = await encodePayloads({
        input: stringifyWithBigInt(value),
        encoding: 'json/plain',
      });
      return [key, (encodedValue ?? [])[0]] as const;
    }),
  );

  return { ...header, fields: Object.fromEntries(encodedEntries) };
}

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
    keepOriginalWorkflowId: scheduleForm.keepOriginalWorkflowId,
  } satisfies SchedulePoliciesRequest;
}

// Omit zero/empty workflow timeouts so the server applies its defaults
// (execution/run: unlimited, task: 10s) rather than sending an explicit 0.
function toWorkflowTimeout(value: string | undefined): string | undefined {
  if (!value || Number(parseDuration(value)) <= 0) {
    return undefined;
  }

  return value;
}

async function getScheduleActionRequest(
  scheduleForm: FormScheduleSchema,
  describeFullSchedule: DescribeFullSchedule | null = null,
): Promise<ScheduleActionRequest> {
  const startWorkflow =
    describeFullSchedule?.schedule?.action?.startWorkflow ?? {};

  const [payloads, header] = await Promise.all([
    scheduleForm.editInput && scheduleForm.input
      ? encodePayloads({
          input: scheduleForm.input,
          encoding: scheduleForm.encoding,
          messageType: scheduleForm.messageType,
        })
      : (null as null | Payload[]),
    encodeHeaderFields(startWorkflow.header),
  ]);

  return {
    startWorkflow: {
      ...startWorkflow,
      workflowId: scheduleForm.workflowId,
      workflowType: {
        name: scheduleForm.workflowType,
      },
      taskQueue: {
        name: scheduleForm.taskQueue,
      },
      ...(scheduleForm.editInput && {
        input: payloads ? { payloads } : null,
      }),
      searchAttributes: getSearchAttributes(
        scheduleForm.workflowSearchAttributes,
      ),
      workflowTaskTimeout: toWorkflowTimeout(scheduleForm.taskTimeout),
      workflowRunTimeout: toWorkflowTimeout(scheduleForm.runTimeout),
      workflowExecutionTimeout: toWorkflowTimeout(
        scheduleForm.executionTimeout,
      ),
      ...(header && { header }),
    },
  } satisfies ScheduleActionRequest;
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
  scheduleForm: FormScheduleSchema,
  describeFullSchedule: DescribeFullSchedule | null = null,
): Promise<ScheduleRequestBody> {
  return {
    schedule_id: describeFullSchedule?.schedule_id ?? scheduleForm.name,
    searchAttributes: getSearchAttributes(scheduleForm.searchAttributes),
    schedule: {
      spec: getScheduleSpecRequest(scheduleForm, describeFullSchedule),
      action: await getScheduleActionRequest(
        scheduleForm,
        describeFullSchedule,
      ),
      policies: getSchedulePoliciesRequest(scheduleForm),
      state: getScheduleStateRequest(scheduleForm, describeFullSchedule),
    },
  } satisfies ScheduleRequestBody;
}
