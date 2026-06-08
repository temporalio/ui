import { parseDuration } from '$lib/holocene/duration-input/duration-input.svelte';
import { setSearchAttributes } from '$lib/services/workflow-service';
import type { CalendarSpec, Payload, Schedule } from '$lib/types';
import type {
  ScheduleInterval,
  ScheduleRequestBody,
  ScheduleSpecRequest,
  StructuredCalendar,
} from '$lib/types/schedule';
import { encodePayloads } from '$lib/utilities/encode-payload';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { sortAndStringifyNumStrings } from '$lib/utilities/schedule-data-formatting';

import type { ScheduleFormData } from '../schema/form-schema';
import type { ScheduleSpecItem } from '../schema/spec-item-form-schema';

function getSearchAttributes(attrs: (typeof setSearchAttributes.arguments)[0]) {
  return attrs.length === 0
    ? null
    : { indexedFields: { ...setSearchAttributes(attrs) } };
}

type ScheduleSpecAccumulator = {
  calendar: CalendarSpec[];
  interval: ScheduleInterval[];
  cronString: string[];
  structuredCalendar: StructuredCalendar[];
  startTime?: string;
  endTime?: string;
  jitter?: string;
  timezoneName?: string;
};

function buildSpecFromFormData(
  formData: ScheduleFormData,
): ScheduleSpecRequest {
  const spec: ScheduleSpecAccumulator = {
    calendar: [],
    interval: [],
    cronString: [],
    structuredCalendar: [],
    timezoneName: formData.timezoneName || 'UTC',
  };

  if (formData.startDate) {
    spec.startTime = formData.startDate;
  }

  if (formData.endDateType === 'on' && formData.endDate) {
    spec.endTime = formData.endDate;
  }

  if (formData.jitter && Number(parseDuration(formData.jitter)) > 0) {
    spec.jitter = formData.jitter.endsWith('s')
      ? formData.jitter
      : `${formData.jitter}s`;
  }

  for (const specItem of formData.specs) {
    consolidateIntoSingleSpec(spec, specItem);
  }

  return spec;
}

function consolidateIntoSingleSpec(
  spec: ScheduleSpecAccumulator,
  item: ScheduleSpecItem,
) {
  switch (item.type) {
    case 'cron': {
      if (item.cronString) {
        const cronStringWithComment = `${item.cronString}#${item.cronString}`;
        spec.cronString.push(cronStringWithComment);
      }

      return;
    }

    case 'interval': {
      spec.interval.push({
        interval: item.interval,
        phase: item.phase || '0s',
      } as ScheduleInterval);

      return;
    }

    case 'week': {
      spec.calendar.push({
        year: '*',
        month: '',
        dayOfMonth: '',
        dayOfWeek: sortAndStringifyNumStrings(item.daysOfWeek ?? []),
        hour: String(item?.time?.hour || ''),
        minute: String(item?.time?.minute || ''),
        second: '',
      });

      return;
    }

    case 'month': {
      spec.calendar.push({
        year: '*',
        month: sortAndStringifyNumStrings(item.months ?? []),
        dayOfMonth: sortAndStringifyNumStrings(item.daysOfMonth ?? []),
        dayOfWeek: '',
        hour: String(item.time?.hour || ''),
        minute: String(item.time?.minute || ''),
        second: '',
      });
      return;
    }
  }
}

function buildPolicies(formData: ScheduleFormData) {
  return {
    overlapPolicy: formData.overlapPolicy,
    catchupWindow: formData.catchupWindow || undefined,
    pauseOnFailure: formData.pauseOnFailure,
    keepOriginalWorkflowId: formData.keepOriginalWorkflowId,
  };
}

function buildWorkflowTimeouts(formData: ScheduleFormData) {
  return {
    ...(formData.taskTimeout && { workflowTaskTimeout: formData.taskTimeout }),
    ...(formData.runTimeout && { workflowRunTimeout: formData.runTimeout }),
    ...(formData.executionTimeout && {
      workflowExecutionTimeout: formData.executionTimeout,
    }),
  };
}

export async function formDataToCreateScheduleRequest(
  formData: ScheduleFormData,
): Promise<ScheduleRequestBody> {
  let payloads: null | Payload[] = null;

  if (formData.input) {
    payloads = await encodePayloads({
      input: formData.input,
      encoding: formData.encoding,
      messageType: formData.messageType,
    });
  }

  return {
    schedule_id: formData.name.trim(),
    searchAttributes: getSearchAttributes(formData.searchAttributes),
    schedule: {
      spec: buildSpecFromFormData(formData),
      action: {
        startWorkflow: {
          workflowId: formData.workflowId,
          workflowType: { name: formData.workflowType },
          taskQueue: { name: formData.taskQueue },
          input: payloads ? { payloads } : null,
          searchAttributes: getSearchAttributes(
            formData.workflowSearchAttributes,
          ),
          ...buildWorkflowTimeouts(formData),
        },
      },
      policies: buildPolicies(formData),
      state: {
        ...(formData.endDateType === 'after' && formData.endAfterOccurrences
          ? {
              limitedActions: true,
              remainingActions: formData.endAfterOccurrences,
            }
          : {}),
        ...(formData.pauseSchedule && { paused: true }),
      },
    },
  } satisfies ScheduleRequestBody;
}

export async function formDataToEditScheduleRequest(
  formData: ScheduleFormData,
  schedule: Schedule,
  scheduleId: string,
): Promise<ScheduleRequestBody> {
  let payloads: null | Payload[] = null;

  if (formData.editInput && formData.input) {
    payloads = await encodePayloads({
      input: formData.input,
      encoding: formData.encoding,
      messageType: formData.messageType,
    });
  }

  const startWorkflow = schedule.action?.startWorkflow ?? {};
  const header = await encodeHeaderFields(startWorkflow.header);

  return {
    schedule_id: scheduleId,
    searchAttributes: getSearchAttributes(formData.searchAttributes),
    schedule: {
      spec: buildSpecFromFormData(formData),
      action: {
        startWorkflow: {
          ...startWorkflow,
          workflowId: formData.workflowId,
          workflowType: { name: formData.workflowType },
          taskQueue: { name: formData.taskQueue },
          ...(formData.editInput && {
            input: payloads ? { payloads } : null,
          }),
          searchAttributes: getSearchAttributes(
            formData.workflowSearchAttributes,
          ),
          ...buildWorkflowTimeouts(formData),
          ...(header && { header }),
        },
      },
      policies: buildPolicies(formData),
      state: {
        ...(schedule.state ?? {}),
        ...(formData.endDateType === 'after' && formData.endAfterOccurrences
          ? {
              limitedActions: true,
              remainingActions: formData.endAfterOccurrences,
            }
          : { limitedActions: false, remainingActions: undefined }),
        paused: formData.pauseSchedule,
      },
    },
  } satisfies ScheduleRequestBody;
}

type StartWorkflowHeader = NonNullable<
  NonNullable<Schedule['action']>['startWorkflow']
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
