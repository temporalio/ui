import { writable } from 'svelte/store';

import type { GetPollersResponse } from '$lib/services/pollers-service';

export const refresh = writable(0);

type WorkflowRunStore = {
  workflow: WorkflowExecution | null;
  workers: GetPollersResponse;
};
const initialWorkflowRun: WorkflowRunStore = {
  workflow: null,
  workers: { pollers: [], taskQueueStatus: '' },
};

export const updating = writable(true);
export const workflowRun = writable<WorkflowRunStore>(initialWorkflowRun);
