import { goto } from '$app/navigation';

import type { Form } from 'svelte-use-form';

import { routeForSchedules } from '$lib/utilities/route-for';

import { createSchedule } from '$lib/services/schedule-service';
import type { FormField } from '$holocene/forms';
import { setBodyProperty } from '$holocene/forms';

export const fields: Record<string, FormField> = {
  // Action
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
  // Spec
  interval: {
    key: 'schedule.spec.interval.interval',
    label: 'Interval',
    required: false,
  },
  phase: {
    key: 'schedule.spec.interval.phase',
    label: 'Phase',
    required: false,
  },
  year: {
    key: 'schedule.spec.calendar.year',
    label: 'Year',
    placeholder: '*',
    required: false,
  },
  month: {
    key: 'schedule.spec.calendar.month',
    label: 'Month',
    placeholder: '*',
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
    placeholder: '*',
    required: false,
  },
  minute: {
    key: 'schedule.spec.calendar.minute',
    label: 'Minute',
    required: false,
  },
  second: {
    key: 'schedule.spec.calendar.second',
    label: 'Second',
    required: false,
  },

  // "startTime": "2022-07-04T03:18:59.668Z",
  // "endTime": "2022-07-04T03:18:59.668Z",
  // "jitter": "string",
  // "timezoneName": "string",
  // "timezoneData": "string"
};

export const submitScheduleForm = async (
  form: Form,
  namespace: string,
  loading: boolean,
) => {
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

  const interval = values['schedule.spec.interval.interval'];
  const phase = values['schedule.spec.interval.phase'];
  const year = values['schedule.spec.calendar.year'];
  const month = values['schedule.spec.calendar.month'];
  const dayOfMonth = values['schedule.spec.calendar.dayOfMonth'];
  const dayOfWeek = values['schedule.spec.calendar.dayOfWeek'];
  const hour = values['schedule.spec.calendar.hour'];
  const minute = values['schedule.spec.calendar.minute'];
  const second = values['schedule.spec.calendar.second'];

  if (interval) {
    body.schedule.spec.interval = [{ interval, phase }];
    body.schedule.spec.calendar = [];
  } else {
    body.schedule.spec.interval = [];
    body.schedule.spec.calendar = [
      { year, month, dayOfMonth, dayOfWeek, hour, minute, second },
    ];
  }

  // // Wait 1 second for create to get it on fetchAllSchedules
  try {
    loading = true;
    await createSchedule({
      namespace,
      body,
    });
    setTimeout(() => {
      goto(routeForSchedules({ namespace }));
      loading = false;
    }, 1000);
  } catch (e) {
    loading = false;
  }
};
