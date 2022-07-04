import { readable, writable } from 'svelte/store';
import { page } from '$app/stores';

import { isRouteForSchedules } from '$lib/utilities/route-for';

import { fetchAllSchedules } from '$lib/services/schedule-service';
import { withLoading } from '$lib/utilities/stores/with-loading';

import type { StartStopNotifier } from 'svelte/store';

const updateSchedules: StartStopNotifier<WorkflowExecution[]> = (set) => {
  return page.subscribe(({ params, url }) => {
    if (isRouteForSchedules(url.pathname, { namespace: params.namespace })) {
      withLoading(loading, updating, async () => {
        const { schedules, error } = await fetchAllSchedules(params.namespace);
        set(schedules);
        if (error) {
          scheduleError.set(error);
        } else {
          scheduleError.set('');
        }
      });
    }
  });
};

export const updating = writable(true);
export const loading = writable(true);
export const schedules = readable<unknown[]>([], updateSchedules);
export const scheduleError = writable('');

export type FormField = {
  key: string;
  label: string;
  required: boolean;
  validations?: typeof validators[];
  hint?: string;
  placeholder?: string;
};

export const formValues: Record<string, FormField> = {
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
    hint: '5m',
    required: false,
  },
  phase: {
    key: 'schedule.spec.interval.phase',
    label: 'Phase',
    hint: 'Blank for 1 day',
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

export const scheduleBody = {
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
