import { writable } from 'svelte/store';

import { goto } from '$app/navigation';

import { translate } from '$lib/i18n/translate';
import { createSchedule, editSchedule } from '$lib/services/schedule-service';
import { setSearchAttributes } from '$lib/services/workflow-service';
import type { Schedule } from '$lib/types';
import type {
  DescribeFullSchedule,
  ScheduleActionParameters,
  ScheduleInterval,
  SchedulePresetsParameters,
  ScheduleSpecParameters,
} from '$lib/types/schedule';
import { encodePayloads } from '$lib/utilities/encode-payload';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { routeForSchedule, routeForSchedules } from '$lib/utilities/route-for';
import {
  convertDaysAndMonths,
  timeToInterval,
} from '$lib/utilities/schedule-data-formatting';

type ScheduleParameterArgs = {
  action: ScheduleActionParameters;
  spec: Partial<ScheduleSpecParameters>;
  presets: SchedulePresetsParameters;
};

// TODO: Post Beta, add support of additional fields.
// "startTime": "2022-07-04T03:18:59.668Z",
// "endTime": "2022-07-04T03:18:59.668Z",
// "jitter": "string",
// "timezoneName": "string",
// "timezoneData": "string"

const getSearchAttributes = (
  attrs: (typeof setSearchAttributes.arguments)[0],
) => {
  return attrs.length === 0
    ? null
    : { indexedFields: { ...setSearchAttributes(attrs) } };
};

const setBodySpec = (
  body: DescribeFullSchedule,
  spec: Partial<ScheduleSpecParameters>,
  presets: SchedulePresetsParameters,
) => {
  const { hour, minute, second, phase, cronString } = spec;
  const { preset, months, days, daysOfMonth, daysOfWeek } = presets;
  if (preset === 'string') {
    // Add the cronString as a comment to the cronString to view it for frequency
    const cronStringWithComment = `${cronString}#${cronString}`;
    body.schedule.spec.cronString = [cronStringWithComment];
    body.schedule.spec.calendar = [];
    body.schedule.spec.interval = [];
  } else if (preset === 'interval') {
    const interval = timeToInterval(days, hour, minute, second);
    // The Schedule IntervalSpec implements IIntervalSpec which encodes/decodes string to Interval
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

export const submitCreateSchedule = async ({
  action,
  spec,
  presets,
}: ScheduleParameterArgs): Promise<void> => {
  const {
    namespace,
    name,
    workflowId,
    workflowType,
    taskQueue,
    input,
    encoding,
    messageType,
    searchAttributes,
    workflowSearchAttributes,
  } = action;

  let payloads;

  if (input) {
    try {
      payloads = await encodePayloads({ input, encoding, messageType });
    } catch (e) {
      error.set(`${translate('data-encoder.encode-error')}: ${e?.message}`);
      return;
    }
  }

  const body: DescribeFullSchedule = {
    schedule_id: name.trim(),
    searchAttributes: getSearchAttributes(searchAttributes),

    schedule: {
      spec: {
        calendar: [],
        interval: [],
        cronString: [],
      },
      action: {
        startWorkflow: {
          workflowId: workflowId,
          workflowType: { name: workflowType },
          taskQueue: { name: taskQueue },
          input: payloads ? { payloads } : null,
          searchAttributes: getSearchAttributes(workflowSearchAttributes),
        },
      },
    },
  };

  setBodySpec(body, spec, presets);

  // Wait 2 seconds for create to get it on fetchAllSchedules
  loading.set(true);
  const { error: err } = await createSchedule({
    scheduleId: name,
    namespace,
    body,
  });

  if (err) {
    error.set(err);
    loading.set(false);
  } else {
    setTimeout(() => {
      error.set('');
      loading.set(false);
      goto(routeForSchedules({ namespace }));
    }, 2000);
  }
};

export const submitEditSchedule = async (
  { action, spec, presets }: ScheduleParameterArgs,
  schedule: Schedule,
  scheduleId: string,
): Promise<void> => {
  const {
    namespace,
    name,
    workflowId,
    workflowType,
    taskQueue,
    input,
    encoding,
    messageType,
    searchAttributes,
    workflowSearchAttributes,
  } = action;

  let payloads;

  if (input) {
    try {
      payloads = await encodePayloads({ input, encoding, messageType });
    } catch (e) {
      error.set(`${translate('data-encoder.encode-error')}: ${e?.message}`);
      return;
    }
  }

  const { preset } = presets;
  const body: DescribeFullSchedule = {
    schedule_id: scheduleId,
    searchAttributes:
      searchAttributes.length === 0
        ? null
        : {
            indexedFields: {
              ...setSearchAttributes(searchAttributes),
            },
          },
    schedule: {
      ...schedule,
      action: {
        startWorkflow: {
          ...schedule.action.startWorkflow,
          workflowId,
          workflowType: { name: workflowType },
          taskQueue: { name: taskQueue },
          ...(input !== undefined && { input: payloads ? { payloads } : null }),
          searchAttributes:
            workflowSearchAttributes.length === 0
              ? null
              : {
                  indexedFields: {
                    ...setSearchAttributes(workflowSearchAttributes),
                  },
                },
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

  if (preset === 'existing') {
    body.schedule.spec = schedule.spec;
  } else {
    setBodySpec(body, spec, presets);
    body.schedule.spec.structuredCalendar = [];
  }

  // Wait 2 seconds for edit to get it on fetchSchedule
  loading.set(true);
  const { error: err } = await editSchedule({
    namespace,
    scheduleId,
    body,
  });

  if (err) {
    error.set(err);
    loading.set(false);
  } else {
    setTimeout(() => {
      goto(routeForSchedule({ namespace, scheduleId: name }));
      error.set('');
      loading.set(false);
    }, 2000);
  }
};

export const loading = writable(false);
export const error = writable('');
export const schedulesCount = writable('0');
