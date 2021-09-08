import { derived, writable, Writable } from 'svelte/store';
import type { ListWorkflowExecutionsResponse } from '$types';

import {
  toWorkflowExecutions,
  WorkflowExecution,
} from '$lib/models/workflow-execution';

import {
  fetchClosedWorkflows,
  fetchOpenWorkflows,
} from '$lib/services/workflow-execution-service';

type WorkflowStore = {
  loading: boolean;
  updating: boolean;
  ids: { [key: string]: boolean };
  workflows: { [key: string]: WorkflowExecution };
};

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

export const createWorkflowStore = (namespace: string) => {
  const store = writable<WorkflowStore>({
    loading: true,
    updating: false,
    ids: {},
    workflows: {},
  });

  const onUpdate = updateWorkflows(store);

  fetchOpenWorkflows({ namespace, onUpdate });
  fetchClosedWorkflows({ namespace, onUpdate });

  return {
    subscribe: derived(store, ($store) => Object.keys($store.ids)),
    get: (id: string) => derived(store, ($store) => $store.workflows[id]),
    all: () => derived(store, ($store) => Object.values($store.workflows)),
  };
};
