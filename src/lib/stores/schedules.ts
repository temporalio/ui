import { writable } from 'svelte/store';

import { goto } from '$app/navigation';

import type { ScheduleFormData } from '$lib/components/schedule/schedule-form/schema';
import { translate } from '$lib/i18n/translate';
import { createSchedule, editSchedule } from '$lib/services/schedule-service';
import { setSearchAttributes } from '$lib/services/workflow-service';
import type { Schedule } from '$lib/types';
import type {
  DescribeFullSchedule,
  ScheduleInterval,
} from '$lib/types/schedule';
import { encodePayloads } from '$lib/utilities/encode-payload';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { routeForSchedule, routeForSchedules } from '$lib/utilities/route-for';
import {
  convertDaysAndMonths,
  timeToInterval,
} from '$lib/utilities/schedule-data-formatting';

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

const setBodySpec = (
  body: DescribeFullSchedule,
  formData: ScheduleFormData,
) => {
  const {
    preset,
    hour,
    minute,
    second,
    phase,
    cronString,
    months,
    days,
    daysOfMonth,
    daysOfWeek,
  } = formData;

  if (preset === 'string') {
    const cronStringWithComment = `${cronString}#${cronString}`;
    body.schedule.spec.cronString = [cronStringWithComment];
    body.schedule.spec.calendar = [];
    body.schedule.spec.interval = [];
  } else if (preset === 'interval') {
    const interval = timeToInterval(days, hour, minute, second);
    body.schedule.spec.interval = [
      { interval, phase: phase || '0s' },
    ] as ScheduleInterval[];
    body.schedule.spec.cronString = [];
    body.schedule.spec.calendar = [];
  } else {
    const { month, dayOfMonth, dayOfWeek } = convertDaysAndMonths({
      months,
      daysOfMonth,
      daysOfWeek,
    });
    body.schedule.spec.calendar = [
      {
        year: '*',
        month: preset === 'month' ? month : '',
        dayOfMonth: preset === 'month' ? dayOfMonth : '',
        dayOfWeek: preset === 'week' ? dayOfWeek : '',
        hour,
        minute,
        second,
      },
    ];
    body.schedule.spec.interval = [];
    body.schedule.spec.cronString = [];
  }
};

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

  const body: DescribeFullSchedule = {
    schedule_id: formData.name.trim(),
    searchAttributes: getSearchAttributes(formData.searchAttributes),
    schedule: {
      spec: {
        calendar: [],
        interval: [],
        cronString: [],
      },
      action: {
        startWorkflow: {
          workflowId: formData.workflowId,
          workflowType: { name: formData.workflowType },
          taskQueue: { name: formData.taskQueue },
          input: payloads ? { payloads } : null,
          searchAttributes: getSearchAttributes(
            formData.workflowSearchAttributes,
          ),
        },
      },
    },
  };

  setBodySpec(body, formData);

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

  const body: DescribeFullSchedule = {
    schedule_id: scheduleId,
    searchAttributes: getSearchAttributes(formData.searchAttributes),
    schedule: {
      ...schedule,
      action: {
        startWorkflow: {
          ...schedule.action.startWorkflow,
          workflowId: formData.workflowId,
          workflowType: { name: formData.workflowType },
          taskQueue: { name: formData.taskQueue },
          ...(formData.editInput && {
            input: payloads ? { payloads } : null,
          }),
          searchAttributes: getSearchAttributes(
            formData.workflowSearchAttributes,
          ),
        },
      },
    },
  };

  const fields = body.schedule.action.startWorkflow?.header?.fields;
  if (fields && Object.keys(fields).length > 0) {
    try {
      const entries = Object.entries(fields);
      for (const [key, value] of entries) {
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

  if (formData.preset === 'existing') {
    body.schedule.spec = schedule.spec;
  } else {
    setBodySpec(body, formData);
    body.schedule.spec.structuredCalendar = [];
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

export const loading = writable(false);
export const error = writable('');
export const schedulesCount = writable('0');
