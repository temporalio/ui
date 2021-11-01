import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

import { set } from '$lib/utilities/set-object-key';

import { toWorkflowExecution } from '$lib/models/workflow-execution';
import { fetchWorkflow } from '$lib/services/workflow-execution-service';
import { handleError } from '$lib/utilities/handle-error';

import type { WorkflowExecution } from '$lib/models/workflow-execution';

type WorkflowRequest = Parameters<typeof fetchWorkflow>[0];
type WorkflowData = {
  loading: boolean;
  updating: boolean;
  data?: WorkflowExecution;
};

export type WorkflowStore = Writable<WorkflowData> & {
  refresh: () => void;
};

const toResponse = (data: WorkflowExecution) => ({
  loading: false,
  updating: false,
  data,
});

const request = ({ executionId, runId, namespace }: WorkflowRequest) =>
  fetchWorkflow({ executionId, runId, namespace })
    .then(toWorkflowExecution)
    .then(toResponse);

const stores: { [key: string]: WorkflowStore } = {};

export const createStore = ({
  executionId,
  runId,
  namespace,
}: WorkflowRequest): WorkflowStore => {
  const store = writable<WorkflowData>(
    {
      loading: true,
      updating: false,
      data: undefined,
    },
    (set) => {
      request({ executionId, runId, namespace }).then(set).catch(handleError);
    },
  );

  const refresh = () => {
    request({ executionId, runId, namespace })
      .then(store.set)
      .catch(handleError);
  };

  return {
    ...store,
    refresh,
  };
};

export const getWorkflow = ({
  namespace,
  executionId,
  runId,
}: WorkflowRequest): WorkflowStore => {
  let store = stores?.[namespace]?.[executionId]?.[runId];
  const path = `${namespace}.${executionId}.${runId}`;

  if (!store) {
    store = createStore({ namespace, executionId, runId });
    set(stores, path, store);
  }

  return store;
};
