import { writable } from 'svelte/store';

import { goto } from '$app/navigation';

import type {
  ScheduleFormData,
  ScheduleSpecItem,
} from '$lib/components/schedule/schedule-form/schema';
import { translate } from '$lib/i18n/translate';
import { createSchedule, editSchedule } from '$lib/services/schedule-service';
import { setSearchAttributes } from '$lib/services/workflow-service';
import type { Schedule } from '$lib/types';
import type {
  ScheduleInterval,
  ScheduleRequestBody,
  ScheduleSpecRequest,
} from '$lib/types/schedule';
import { encodePayloads } from '$lib/utilities/encode-payload';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { routeForSchedule, routeForSchedules } from '$lib/utilities/route-for';
import { sortAndStringifyNumStrings } from '$lib/utilities/schedule-data-formatting';

type ScheduleContext = {
  namespace: string;
  identity?: string;
};

type EditScheduleContext = ScheduleContext & {
  scheduleId: string;
};

const getSearchAttributes = (
  attrs: (typeof setSearchAttributes.arguments)[0],
) => {
  return attrs.length === 0
    ? null
    : { indexedFields: { ...setSearchAttributes(attrs) } };
};

const buildSpecFromFormData = (
  formData: ScheduleFormData,
): ScheduleSpecRequest => {
  const spec: {
    calendar: object[];
    interval: ScheduleInterval[];
    cronString: string[];
    structuredCalendar: object[];
    startTime?: string;
    endTime?: string;
    jitter?: string;
    timezoneName?: string;
  } = {
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

  if (formData.jitter && Number(formData.jitter) > 0) {
    spec.jitter = formData.jitter;
  }

  for (const specItem of formData.specs) {
    buildSingleSpec(spec, specItem);
  }

  return spec;
};

const buildSingleSpec = (
  spec: {
    calendar: object[];
    interval: ScheduleInterval[];
    cronString: string[];
  },
  item: ScheduleSpecItem,
) => {
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
        hour: item?.time?.hour || '',
        minute: item?.time?.minute || '',
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
        hour: item.time?.hour || '',
        minute: item.time?.minute || '',
        second: '',
      });
      return;
    }
  }
};

const buildPolicies = (formData: ScheduleFormData) => {
  return {
    overlapPolicy: formData.overlapPolicy,
    catchupWindow: formData.catchupWindow || undefined,
    pauseOnFailure: formData.pauseOnFailure,
    keepOriginalWorkflowId: formData.keepOriginalWorkflowId,
  };
};

const buildWorkflowTimeouts = (formData: ScheduleFormData) => ({
  ...(formData.taskTimeout && { workflowTaskTimeout: formData.taskTimeout }),
  ...(formData.runTimeout && { workflowRunTimeout: formData.runTimeout }),
  ...(formData.executionTimeout && {
    workflowExecutionTimeout: formData.executionTimeout,
  }),
});

let createTimeout: ReturnType<typeof setTimeout>;
let editTimeout: ReturnType<typeof setTimeout>;

export const submitCreateSchedule = async (
  formData: ScheduleFormData,
  context: ScheduleContext,
): Promise<void> => {
  const { namespace, identity } = context;

  let payloads;

  if (formData.input) {
    try {
      payloads = await encodePayloads({
        input: formData.input,
        encoding: formData.encoding,
        messageType: formData.messageType,
      });
    } catch (e) {
      error.set(`${translate('data-encoder.encode-error')}: ${e?.message}`);
      return;
    }
  }

  const body = {
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

  loading.set(true);
  const { error: err } = await createSchedule({
    identity,
    scheduleId: formData.name,
    namespace,
    body,
  });

  if (err) {
    error.set(err);
    loading.set(false);
  } else {
    clearTimeout(createTimeout);
    createTimeout = setTimeout(() => {
      error.set('');
      loading.set(false);
      goto(routeForSchedules({ namespace }));
    }, 2000);
  }
};

export const submitEditSchedule = async (
  formData: ScheduleFormData,
  schedule: Schedule,
  context: EditScheduleContext,
): Promise<void> => {
  const { namespace, identity, scheduleId } = context;

  let payloads;

  if (formData.editInput && formData.input) {
    try {
      payloads = await encodePayloads({
        input: formData.input,
        encoding: formData.encoding,
        messageType: formData.messageType,
      });
    } catch (e) {
      error.set(`${translate('data-encoder.encode-error')}: ${e?.message}`);
      return;
    }
  }

  const body = {
    schedule_id: scheduleId,
    searchAttributes: getSearchAttributes(formData.searchAttributes),
    schedule: {
      ...schedule,
      spec: buildSpecFromFormData(formData),
      action: {
        startWorkflow: {
          ...(schedule.action?.startWorkflow ?? {}),
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
          : {}),
        paused: formData.pauseSchedule,
      },
    },
  } satisfies ScheduleRequestBody;

  const fields = body.schedule?.action?.startWorkflow?.header?.fields;
  if (fields && Object.keys(fields).length > 0) {
    try {
      for (const [key, value] of Object.entries(fields)) {
        const encodedValue = await encodePayloads({
          input: stringifyWithBigInt(value),
          encoding: 'json/plain',
        });
        fields[key] = encodedValue[0];
      }
    } catch (e) {
      error.set(`${translate('data-encoder.encode-error')}: ${e?.message}`);
      return;
    }
  }

  loading.set(true);
  const { error: err } = await editSchedule({
    identity,
    namespace,
    scheduleId,
    body,
  });

  if (err) {
    error.set(err);
    loading.set(false);
  } else {
    clearTimeout(editTimeout);
    editTimeout = setTimeout(() => {
      goto(routeForSchedule({ namespace, scheduleId: formData.name }));
      error.set('');
      loading.set(false);
    }, 2000);
  }
};

export const schedulesRefresh = writable(0);

export const loading = writable(false);
export const error = writable('');
export const schedulesCount = writable({
  count: 0,
  newCount: 0,
});
