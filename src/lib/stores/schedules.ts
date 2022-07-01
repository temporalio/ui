import { derived, readable, writable } from 'svelte/store';
import { page } from '$app/stores';

import { fetchAllSchedules } from '$lib/services/schedule-service';
import { withLoading } from '$lib/utilities/stores/with-loading';

import type { StartStopNotifier } from 'svelte/store';

const namespace = derived([page], ([$page]) => $page.params.namespace);
const scheduleId = derived([page], ([$page]) => $page.params.schedule);
const success = derived([page], ([$page]) =>
  $page.url.searchParams.get('success'),
);

const parameters = derived(
  [namespace, scheduleId, success],
  ([$namespace, $scheduleId, $success]) => {
    return {
      namespace: $namespace,
      scheduleId: $scheduleId,
      success: $success,
    };
  },
);

const updateSchedules: StartStopNotifier<WorkflowExecution[]> = (set) => {
  return parameters.subscribe(({ namespace, scheduleId, success }) => {
    withLoading(loading, updating, async () => {
      const { schedules, error } = await fetchAllSchedules(namespace);
      set(schedules);
      if (error) {
        scheduleError.set(error);
      } else {
        scheduleError.set('');
      }
    });
  });
};

export const updating = writable(true);
export const loading = writable(true);
export const schedules = readable<unknown[]>([], updateSchedules);
export const scheduleError = writable('');

export const initialForm = {
  schedule_id: '',
  schedule: {
    spec: {
      calendar: {
        year: '',
        month: '',
        dayOfMonth: '',
        dayOfWeek: '',
        hour: '',
        minute: '',
        second: '',
      },
      interval: {
        interval: '',
        phase: '',
      },
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
export const scheduleForm = writable(initialForm);
