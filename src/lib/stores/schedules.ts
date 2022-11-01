import { goto } from '$app/navigation';
import { writable } from 'svelte/store';

import { routeForSchedules } from '$lib/utilities/route-for';

import { createSchedule } from '$lib/services/schedule-service';

// TODO: Post Alpha, add support of additional fields.
// "startTime": "2022-07-04T03:18:59.668Z",
// "endTime": "2022-07-04T03:18:59.668Z",
// "jitter": "string",
// "timezoneName": "string",
// "timezoneData": "string"

export const submitScheduleForm = async ({
  namespace,
  preset,
  name,
  workflowType,
  workflowId,
  taskQueue,
  dayOfWeek,
  dayOfMonth,
  month,
  hour,
  minute,
  second,
  phase,
  cronString,
}: {
  namespace: string;
  preset: SchedulePreset;
  name: string;
  workflowType: string;
  workflowId: string;
  taskQueue: string;
  dayOfWeek: string;
  dayOfMonth: string;
  month: string;
  hour: string;
  minute: string;
  second: string;
  phase: string;
  cronString: string;
}): Promise<void> => {
  const body = {
    schedule_id: name,
    schedule: {
      spec: {
        calendar: [],
        interval: [],
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

  if (preset === 'interval') {
    const parseTime = (time: string) => (time ? parseInt(time) : 0);
    const interval = `${
      parseTime(hour) * 60 * 60 + parseTime(minute) * 60 + parseTime(second)
    }s`;
    body.schedule.spec.interval = [{ interval, phase: phase || '0s' }];
    body.schedule.spec.calendar = [];
  } else {
    body.schedule.spec.interval = [];
    body.schedule.spec.calendar = [
      { year: '*', month, dayOfMonth, dayOfWeek, hour, minute, second },
    ];
  }
  // // Wait 2 seconds for create to get it on fetchAllSchedules
  loading.set(true);
  const { error: err } = await createSchedule({
    namespace,
    body,
  });
  if (err) {
    error.set(err);
    loading.set(false);
  } else {
    error.set('');
    setTimeout(() => {
      goto(routeForSchedules({ namespace }));
      loading.set(false);
    }, 2000);
  }
};

export const loading = writable(false);
export const error = writable('');
