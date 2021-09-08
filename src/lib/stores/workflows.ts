import { writable } from 'svelte/store';

import {
  fetchOpenWorkflows,
  fetchWorkflows,
  WorkflowExecutionAPI,
} from '$lib/services/workflow-execution-service';
import {
  toWorkflowExecutions,
  WorkflowExecution,
} from '$lib/models/workflow-execution';

type WorkflowStore = {
  namespace: string;
};

const types: ('open' | 'closed')[] = ['open', 'closed'];

export const createWorkflowStore = ({ namespace }: WorkflowStore) => {
  const store = writable({});

  for (const type of types) {
    let nextPageToken: string = null;
    const request = fetchWorkflows(type);
    request({ namespace });
  }
};
