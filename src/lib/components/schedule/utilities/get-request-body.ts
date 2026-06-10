import { setSearchAttributes } from '$lib/services/workflow-service';
import type { Payload } from '$lib/types';
import { encodePayloads } from '$lib/utilities/encode-payload';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

import { isValidCronString } from './cron';
import {
  calendarDateStrToEndOfDayTimestamp,
  calendarDateStrToTimestamp,
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
  NonNullable<DescribeFullSchedule['schedule']['action']>['startWorkflow']
>['header'];

async function encodeHeaderFields(
  header: StartWorkflowHeader,
): Promise<StartWorkflowHeader> {
  const fields = header?.fields;
  if (!fields || Object.keys(fields).length === 0) {
    return header;
  }

  const encodedFields: typeof fields = {};
  for (const [key, value] of Object.entries(fields)) {
    const encodedValue = await encodePayloads({
      input: stringifyWithBigInt(value),
      encoding: 'json/plain',
    });
    encodedFields[key] = encodedValue[0];
  }

  return { ...header, fields: encodedFields };
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

async function getScheduleActionRequest(
  scheduleForm: FormScheduleSchema,
  describeFullSchedule: DescribeFullSchedule | null = null,
): Promise<ScheduleActionRequest> {
  let payloads: null | Payload[] = null;

  if (scheduleForm.editInput && scheduleForm.input) {
    payloads = await encodePayloads({
      input: scheduleForm.input,
      encoding: scheduleForm.encoding,
      messageType: scheduleForm.messageType,
    });
  }

  const startWorkflow =
    describeFullSchedule?.schedule.action?.startWorkflow ?? {};
  const header = await encodeHeaderFields(startWorkflow.header);

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
      ...(scheduleForm.taskTimeout && {
        workflowTaskTimeout: scheduleForm.taskTimeout,
      }),
      ...(scheduleForm.runTimeout && {
        workflowRunTimeout: scheduleForm.runTimeout,
      }),
      ...(scheduleForm.executionTimeout && {
        workflowExecutionTimeout: scheduleForm.executionTimeout,
      }),
      ...(header && { header }),
    },
  } satisfies ScheduleActionRequest;
}

type SpecFormItem = FormScheduleSchema['specs'][number];

function toStructuredCalendar(
  calendar: SpecFormItem['calendar'],
): StructuredCalendar {
  const { comment, ...ranges } = calendar;
  return { ...ranges, ...(comment ? { comment } : {}) };
}

function toInterval(interval: SpecFormItem['interval']): ScheduleInterval {
  return {
    interval: interval.interval,
    phase: interval.phase || '0s',
  } as ScheduleInterval;
}

function getScheduleSpecRequest(
  scheduleForm: FormScheduleSchema,
): ScheduleSpecRequest {
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
          cronString.push(`${trimmed}#${trimmed}`);
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
    interval,
    cronString,
    structuredCalendar,
    timezoneName: timeZone,
    startTime: calendarDateStrToTimestamp(scheduleForm.startTime, timeZone),
    ...(scheduleForm.endKind === 'on' &&
      scheduleForm.endTime && {
        endTime: calendarDateStrToEndOfDayTimestamp(
          scheduleForm.endTime,
          timeZone,
        ),
      }),
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
      spec: getScheduleSpecRequest(scheduleForm),
      action: await getScheduleActionRequest(
        scheduleForm,
        describeFullSchedule,
      ),
      policies: getSchedulePoliciesRequest(scheduleForm),
      state: getScheduleStateRequest(scheduleForm, describeFullSchedule),
    },
  } satisfies ScheduleRequestBody;
}
