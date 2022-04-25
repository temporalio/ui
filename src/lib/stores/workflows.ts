import { Writable, writable } from 'svelte/store';
import { page } from '$app/stores';

import { fetchAllWorkflows } from '$lib/services/workflow-service';

import type { CombinedWorkflowExecutionsResponse } from '$lib/services/workflow-service';
import type { StartStopNotifier } from 'svelte/store';

type WorkflowStoreParameters = {
  namespace: string;
  query: string;
};

type EventualWorkflows = Eventual<CombinedWorkflowExecutionsResponse>;

const updateWorkflows: StartStopNotifier<EventualWorkflows> = (set) => {
  const previous: WorkflowStoreParameters = {
    namespace: null,
    query: null,
  };

  return page.subscribe(($page) => {
    const namespace = $page.params.namespace;
    const query = $page.url.searchParams.get('query');

    if (namespace !== previous.namespace || query !== previous.query) {
      fetchAllWorkflows(namespace, { query }).then(set);
      previous.namespace = namespace;
      previous.query = query;
    }
  });
};

export const getWorkflows = ({
  namespace,
  query,
}: WorkflowStoreParameters): Writable<EventualWorkflows> =>
  writable<EventualWorkflows>(
    fetchAllWorkflows(namespace, { query }),
    updateWorkflows,
  );
