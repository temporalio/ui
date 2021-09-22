import { derived, writable, Writable, get } from 'svelte/store';
import type { ListWorkflowExecutionsResponse } from '$types';
import { unique } from '$lib/utilities/unique';

import {
  toWorkflowExecutions,
  WorkflowExecution,
} from '$lib/models/workflow-execution';

import { fetchAllWorkflows } from '$lib/services/workflow-execution-service';
import { createStoreWithCallback } from '$lib/utilities/create-store-with-callback';

type WorkflowStore = {
  loading: boolean;
  updating: boolean;
  ids: { [key: string]: boolean };
  workflows: { [key: string]: WorkflowExecution };
};

const stores: { [key: string]: ReturnType<typeof createStore> } = {};

const updateWorkflows =
  (store: Writable<WorkflowStore>) =>
  (payload: ListWorkflowExecutionsResponse) => {
    const workflowExecutions = toWorkflowExecutions(payload.executions);
    const ids = {};
    const workflows = {};

    for (const execution of workflowExecutions) {
      const id = execution.id;
      ids[id] = true;
      workflows[id] = execution;
    }

    store.update(($store) => ({
      ...$store,
      ids: { ...$store.ids, ...ids },
      workflows: { ...$store.workflows, ...workflows },
    }));
  };

export const createStore = (namespace: string) => {
  const update = () => {
    const startTime = get(range);

    fetchAllWorkflows({
      namespace,
      onUpdate: updateWorkflows(store),
      startTime,
    });
  };

  const store = writable<WorkflowStore>(
    {
      loading: true,
      updating: false,
      ids: {},
      workflows: {},
    },
    () => {
      let idleCallback: number;

      update();

      const interval = setInterval(() => {
        idleCallback = requestIdleCallback(update);
      }, 30000);

      return () => {
        if (idleCallback) cancelIdleCallback(idleCallback);
        clearInterval(interval);
      };
    },
  );

  const all = derived(store, ($store) => Object.values($store.workflows));
  const ids = derived(store, ($store) => Object.keys($store.ids));
  const range = createStoreWithCallback<Duration>({ hours: 24 }, update);

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
