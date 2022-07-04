import { readable, writable } from 'svelte/store';
import { page } from '$app/stores';
import { goto } from '$app/navigation';

import type {
  Form
} from 'svelte-use-form';

import { isRouteForSchedules, routeForSchedules } from '$lib/utilities/route-for';

import { fetchAllSchedules, createSchedule } from '$lib/services/schedule-service';
import { withLoading } from '$lib/utilities/stores/with-loading';
import type { FormField } from '$holocene/forms';
import { setBodyProperty } from '$holocene/forms';

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
    hint: 'IntervalSpec matches times that can be expressed as: epoch + n * interval + phase where n is an integer. Phase defaults to zero if missing. interval is required. Both interval and phase must be non-negative and are truncated to the nearest second before any calculations. For example, an interval of 1 hour with phase of zero would match every hour, on the hour. The same interval but a phase of 19 minutes would match every xx:19:00. An interval of 28 days with phase zero would match 2022-02-17T00:00:00Z (among other times). The same interval with a phase of 3 days, 5 hours, and 23 minutes would match 2022-02-20T05:23:00Z instead.',
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


export const submitScheduleForm = async (form: Form, namespace: string, loading: boolean) => {
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
  };;

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
