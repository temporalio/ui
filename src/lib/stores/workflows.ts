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

const fetchWorkflows = (
  options:
    | Parameters<typeof fetchOpenWorkflows>[0]
    | Parameters<typeof fetchClosedWorkflows>[0],
) => {
  fetchOpenWorkflows(options);
  fetchClosedWorkflows(options);
};

export const createStore = (namespace: string) => {
  const store = writable<WorkflowStore>({
    loading: true,
    updating: false,
    ids: {},
    workflows: {},
  });

  fetchWorkflows({ namespace, onUpdate: updateWorkflows(store) });

  return {
    subscribe: derived(store, ($store) => Object.keys($store.ids)),
    get: (id: string) => derived(store, ($store) => $store.workflows[id]),
    all: () => derived(store, ($store) => Object.values($store.workflows)),
  };
};

export const createWorkflowStore = (namespace: string) => {
  if (!stores[namespace]) stores[namespace] = createStore(namespace);
  return stores[namespace];
};
