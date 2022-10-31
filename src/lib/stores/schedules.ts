import { goto } from '$app/navigation';
import { writable } from 'svelte/store';

import type { Form } from 'svelte-use-form';

import { routeForSchedules } from '$lib/utilities/route-for';

import { createSchedule } from '$lib/services/schedule-service';
import type { FormField } from '$holocene/forms';
import { setBodyProperty } from '$holocene/forms';

export const fields: Record<string, FormField> = {
  name: { key: 'schedule_id', label: 'Schedule Name', required: true },
  workflowType: {
    key: 'schedule.action.startWorkflow.workflowType.name',
    label: 'Workflow Type',
    required: true,
  },
  workflowId: {
    key: 'schedule.action.startWorkflow.workflowId',
    label: 'Workflow Id',
    required: true,
  },
  workflowTaskQueue: {
    key: 'schedule.action.startWorkflow.taskQueue.name',
    label: 'Task Queue Name',
    required: true,
  },
  phase: {
    key: 'schedule.spec.interval.phase',
    label: 'Phase',
    placeholder: '0s',
    required: false,
  },
  year: {
    key: 'schedule.spec.calendar.year',
    label: 'Year',
    required: false,
  },
  month: {
    key: 'schedule.spec.calendar.month',
    label: 'Month',
    required: false,
  },
  dayOfMonth: {
    key: 'schedule.spec.calendar.dayOfMonth',
    label: 'Day of Month',
    required: false,
  },
  dayOfWeek: {
    key: 'schedule.spec.calendar.dayOfWeek',
    label: 'Day of Week',
    required: false,
  },
  hour: {
    key: 'schedule.spec.calendar.hour',
    label: 'Hour',
    placeholder: '00',
    required: false,
  },
  minute: {
    key: 'schedule.spec.calendar.minute',
    label: 'Minute',
    placeholder: '00',
    required: false,
  },
  second: {
    key: 'schedule.spec.calendar.second',
    label: 'Second',
    placeholder: '00',
    required: false,
  },
  cronString: {
    key: 'schedule.spec.cronString',
    label: '',
    placeholder: '',
    required: false,
  },
  // TODO: Post Alpha, add support of additional fields.
  // "startTime": "2022-07-04T03:18:59.668Z",
  // "endTime": "2022-07-04T03:18:59.668Z",
  // "jitter": "string",
  // "timezoneName": "string",
  // "timezoneData": "string"
};

export const submitScheduleForm = async (
  form: Form,
  namespace: string,
  {
    preset,
    dayOfWeek,
    dayOfMonth,
    month,
  }: {
    preset: SchedulePreset;
    dayOfWeek: string;
    dayOfMonth: string;
    month: string;
  },
): Promise<void> => {
  const values = form.values;
  const body = {
    schedule_id: '',
    schedule: {
      spec: {
        calendar: [],
        interval: [],
      },
      action: {
        startWorkflow: {
          workflowId: '',
          workflowType: { name: '' },
          taskQueue: { name: '' },
        },
      },
    },
  };

  Object.keys(values).forEach((key) => {
    setBodyProperty(key, body, values[key]);
  });

  // const interval = values['schedule.spec.interval.interval'];
  const phase = values['schedule.spec.interval.phase'];
  const year = values['schedule.spec.calendar.year'];
  // const month = values['schedule.spec.calendar.month'];
  // const dayOfMonth = values['schedule.spec.calendar.dayOfMonth'];
  // const dayOfWeek = values['schedule.spec.calendar.dayOfWeek'];
  const hour = values['schedule.spec.calendar.hour'];
  const minute = values['schedule.spec.calendar.minute'];
  const second = values['schedule.spec.calendar.second'];

  if (preset === 'interval') {
    const parseTime = (time: string) => (time ? parseInt(time) : 0);
    const interval = `${
      parseTime(hour) * 60 * 60 + parseTime(minute) * 60 + parseTime(second)
    }s`;
    debugger;
    body.schedule.spec.interval = [{ interval, phase: phase || '0s' }];
    body.schedule.spec.calendar = [];
  } else {
    body.schedule.spec.interval = [];
    body.schedule.spec.calendar = [
      { year, month, dayOfMonth, dayOfWeek, hour, minute, second },
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
