import { derived, readable, writable } from 'svelte/store';
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
