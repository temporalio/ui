import { Writable, writable } from 'svelte/store';
import { page } from '$app/stores';

import { fetchAllSchedules } from '$lib/services/schedule-service';

import type { CombinedWorkflowExecutionsResponse } from '$lib/services/workflow-service';
import type { StartStopNotifier } from 'svelte/store';

type ScheduleStoreParameters = {
  namespace: string;
  query: string;
};

type EventualWorkflows = Eventual<CombinedWorkflowExecutionsResponse>;

const updateWorkflows: StartStopNotifier<EventualWorkflows> = (set) => {
  const previous: ScheduleStoreParameters = {
    namespace: null,
    query: null,
  };

  return page.subscribe(($page) => {
    const namespace = $page.params.namespace;
    const query = $page.url.searchParams.get('query');

    if (namespace !== previous.namespace || query !== previous.query) {
      fetchAllSchedules(namespace, { query }).then(set);
      previous.namespace = namespace;
      previous.query = query;
    }
  });
};

export const getSchedules = ({
  namespace,
  query,
}: ScheduleStoreParameters): Writable<EventualWorkflows> =>
  writable<EventualWorkflows>(
    fetchAllSchedules(namespace, { query }),
    updateWorkflows,
  );
