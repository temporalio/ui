import { goto } from '$app/navigation';
import { writable } from 'svelte/store';

import { routeForSchedule, routeForSchedules } from '$lib/utilities/route-for';

import { createSchedule, editSchedule } from '$lib/services/schedule-service';
import { calendarToComment } from '$lib/utilities/schedule-comment-formatting';
import {
  convertDaysAndMonths,
  timeToInterval,
} from '$lib/utilities/schedule-data-formatting';

// TODO: Post Alpha, add support of additional fields.
// "startTime": "2022-07-04T03:18:59.668Z",
// "endTime": "2022-07-04T03:18:59.668Z",
// "jitter": "string",
// "timezoneName": "string",
// "timezoneData": "string"

export const submitScheduleForm = async (
  {
    namespace,
    preset,
    name,
    workflowType,
    workflowId,
    taskQueue,
    daysOfWeek,
    daysOfMonth,
    months,
    days,
    hour,
    minute,
    second,
    phase,
    cronString,
  }: Partial<ScheduleParameters>,
  schedule?: DescribeSchedule,
  scheduleId?: string,
): Promise<void> => {
  const body: DescribeSchedule = {
    schedule_id: name,
    schedule: {
      spec: {
        calendar: [],
        interval: [],
        cronString: [],
      },
      action: {
        startWorkflow: {
          workflowId,
          workflowType: { name: workflowType },
          taskQueue: { name: taskQueue },
        },
      },
    },
  };

  if (preset === 'existing' && schedule) {
    body.schedule.spec = schedule.spec;
  } else if (preset === 'string') {
    // Add the cronString as a comment to the cronString to view it for frequency
    const cronStringWithComment = `${cronString}#${cronString}`;
    body.schedule.spec.cronString = [cronStringWithComment];
  } else if (preset === 'interval') {
    const interval = timeToInterval(days, hour, minute, second);
    body.schedule.spec.interval = [{ interval, phase: phase || '0s' }];
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
    body.schedule.spec.interval = [];
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
  }
  // // Wait 2 seconds for create to get it on fetchAllSchedules
  loading.set(true);

  if (schedule && scheduleId) {
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
        loading.set(false);
        error.set('');
      }, 2000);
    }
  } else {
    const { error: err } = await createSchedule({
      namespace,
      body,
    });
    if (err) {
      error.set(err);
      loading.set(false);
    } else {
      setTimeout(() => {
        goto(routeForSchedules({ namespace }));
        loading.set(false);
        error.set('');
      }, 2000);
    }
  }
};

export const loading = writable(false);
export const error = writable('');
