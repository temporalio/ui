import { goto } from '$app/navigation';
import { writable } from 'svelte/store';
import type { Schedule } from '$types';

import { routeForSchedule, routeForSchedules } from '$lib/utilities/route-for';

import { createSchedule, editSchedule } from '$lib/services/schedule-service';
import { calendarToComment } from '$lib/utilities/schedule-comment-formatting';
import {
  convertDaysAndMonths,
  timeToInterval,
} from '$lib/utilities/schedule-data-formatting';

// TODO: Post Beta, add support of additional fields.
// "startTime": "2022-07-04T03:18:59.668Z",
// "endTime": "2022-07-04T03:18:59.668Z",
// "jitter": "string",
// "timezoneName": "string",
// "timezoneData": "string"

const setBodySpec = (
  body: DescribeFullSchedule,
  spec: ScheduleSpecParameters,
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
    body.schedule.spec.interval = [{ interval, phase: phase || '0s' }];
    body.schedule.spec.cronString = [];
    body.schedule.spec.calendar = [];
  } else {
    const { month, dayOfMonth, dayOfWeek } = convertDaysAndMonths({
      months,
      daysOfMonth,
      daysOfWeek,
    });
    const comment = calendarToComment({
      preset,
      month,
      dayOfMonth,
      dayOfWeek,
      hour,
      minute,
      second,
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
        comment,
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
}: ScheduleParameters): Promise<void> => {
  const { namespace, name, workflowId, workflowType, taskQueue } = action;
  const body: DescribeFullSchedule = {
    schedule_id: name,
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
        },
      },
    },
  };

  setBodySpec(body, spec, presets);

  // Wait 2 seconds for create to get it on fetchAllSchedules
  loading.set(true);
  const { error: err } = await createSchedule({
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
  { action, spec, presets }: ScheduleParameters,
  schedule: Schedule,
  scheduleId: string,
): Promise<void> => {
  const { namespace, name, workflowId, workflowType, taskQueue } = action;
  const { preset } = presets;

  const body: DescribeFullSchedule = {
    schedule: {
      ...schedule,
      action: {
        startWorkflow: {
          ...schedule.action.startWorkflow,
          workflowId,
          workflowType: { name: workflowType },
          taskQueue: { name: taskQueue },
        },
      },
    },
  };

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
