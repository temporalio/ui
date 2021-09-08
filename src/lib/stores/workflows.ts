import { writable } from 'svelte/store';

import { WorkflowExecutionAPI } from '$lib/services/workflow-execution-service';
import {
  toWorkflowExecutions,
  WorkflowExecution,
} from '$lib/models/workflow-execution';

type WorkflowStore = {
  namespace: string;
};

export const createWorkflowStore = ({ namespace }: WorkflowStore) => {
  const store = writable({});

  WorkflowExecutionAPI.getAll({ namespace }, fetch)
    .then(toWorkflowExecutions)
    .then((props) => ({ props }));
};
