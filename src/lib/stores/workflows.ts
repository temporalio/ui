import { derived, writable } from 'svelte/store';

import type { WorkflowExecution } from '$lib/models/workflow-execution';
import { toWorkflowExecutions } from '$lib/models/workflow-execution';

import { fetchAllWorkflows } from '$lib/services/workflow-execution-service';
import { createQueryStore } from '$lib/utilities/create-query-store';

import type { ListWorkflowExecutionsResponse } from '$types';

const stores: { [key: string]: ReturnType<typeof createStore> } = {};

export const createStore = (namespace: string) => {
  const range = writable<Duration>({ hours: 24 });
  const startTime = derived(range, (startTime) => ({ startTime }));

  const store = createQueryStore<
    WorkflowExecution,
    ListWorkflowExecutionsResponse,
    typeof fetchAllWorkflows
  >(
    fetchAllWorkflows,
    toWorkflowExecutions,
    {
      namespace,
      startTime: { hours: 24 },
    },
    [startTime],
  );

  const workflows = derived(store, ($store) => Object.values($store.data));
  const loading = derived(store, ($store) => $store.loading);
  const updating = derived(store, ($store) => $store.updating);

  return {
    workflows,
    updating,
    loading,
    range,
  };
};

export const createWorkflowStore = (
  namespace: string,
): ReturnType<typeof createStore> => {
  if (!stores[namespace]) stores[namespace] = createStore(namespace);
  return stores[namespace];
};
