import { derived, writable, get as getFromStore } from 'svelte/store';

import { unique } from '$lib/utilities/unique';

import {
  toWorkflowExecutions,
  WorkflowExecution,
} from '$lib/models/workflow-execution';

import { fetchAllWorkflows } from '$lib/services/workflow-execution-service';
// import { createStoreWithCallback } from '$lib/utilities/create-store-with-callback';
import { createQueryStore } from '$lib/utilities/create-query-store';
import type { ListWorkflowExecutionsResponse } from '$types';

const stores: { [key: string]: ReturnType<typeof createStore> } = {};

export const createStore = (namespace: string) => {
  const store = createQueryStore<
    WorkflowExecution,
    ListWorkflowExecutionsResponse
  >(fetchAllWorkflows, toWorkflowExecutions, {
    namespace,
    startTime: { hours: 24 },
  });

  const all = derived(store, ($store) => Object.values($store.data));
  const ids = derived(store, ($store) => Object.keys($store.ids));

  const range = writable<Duration>({ hours: 24 });
  const status = writable<WorkflowStatus>(null);
  const workflowType = writable<WorkflowType>(null);
  const executionId = writable<string>(null);
  const runId = writable<string>(null);
  const workflowTypes = derived(all, ($all) =>
    $all.map((execution) => execution.name).filter(unique),
  );

  const filtered = derived(
    [all, status, workflowType, executionId, runId],
    ([$all, $status, $workflowType, $executionId, $runId]) => {
      return $all.filter((execution) => {
        // Right now, the type generated does not match the actual API response.
        // This is a temporary fix.
        const executionStatus = execution.status as unknown as WorkflowStatus;

        if ($status && executionStatus !== $status) return false;
        if ($workflowType && execution.name !== $workflowType) return false;
        if ($executionId && !execution.id.startsWith($executionId))
          return false;
        if ($runId && !execution.runId.startsWith($runId)) return false;
        return true;
      });
    },
  );

  return {
    ...store,
    ids,
    all,
    filtered,
    workflowTypes,
    range,
    filters: {
      status,
      workflowType,
      executionId,
      runId,
    },
  };
};

export const createWorkflowStore = (namespace: string) => {
  if (!stores[namespace]) stores[namespace] = createStore(namespace);
  return stores[namespace];
};
