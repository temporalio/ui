import { writable } from 'svelte/store';

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

const toResponse = (data: WorkflowExecution) => ({
  loading: false,
  updating: false,
  data,
});

const request = ({ executionId, runId, namespace }: WorkflowRequest) =>
  fetchWorkflow({ executionId, runId, namespace })
    .then(toWorkflowExecution)
    .then(toResponse);

export const getWorkflow = ({
  executionId,
  runId,
  namespace,
}: WorkflowRequest) => {
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

  const refresh = () =>
    request({ executionId, runId, namespace })
      .then(store.set)
      .catch(handleError);

  return {
    subscribe: store.subscribe,
    refresh,
  };
};
