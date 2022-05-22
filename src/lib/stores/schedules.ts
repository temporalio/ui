import { Writable, writable } from 'svelte/store';
import { page } from '$app/stores';

import { fetchAllSchedules } from '$lib/services/schedule-service';

import type { CombinedWorkflowExecutionsResponse } from '$lib/services/workflow-service';
import type { StartStopNotifier } from 'svelte/store';

type ScheduleStoreParameters = {
  namespace: string;
};

type EventualWorkflows = Eventual<CombinedWorkflowExecutionsResponse>;

const updateWorkflows: StartStopNotifier<EventualWorkflows> = (set) => {
  const previous: ScheduleStoreParameters = {
    namespace: null,
  };

  return page.subscribe(($page) => {
    const namespace = $page.params.namespace;

    if (namespace !== previous.namespace) {
      fetchAllSchedules(namespace).then(set);
      previous.namespace = namespace;
    }
  });
};

export const getSchedules = ({
  namespace,
}: ScheduleStoreParameters): Writable<EventualWorkflows> =>
  writable<EventualWorkflows>(fetchAllSchedules(namespace), updateWorkflows);
