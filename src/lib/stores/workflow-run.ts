import { writable } from 'svelte/store';

import type { GetPollersResponse } from '$lib/services/pollers-service';

export const refresh = writable(0);

export type WorkflowRunWithWorkers = {
  workflow: WorkflowExecution | null;
  workers: GetPollersResponse;
};

export const initialWorkflowRun: WorkflowRunWithWorkers = {
  workflow: null,
  workers: { pollers: [], taskQueueStatus: null },
};

export const updating = writable(true);
export const workflowRun = writable<WorkflowRunWithWorkers>(initialWorkflowRun);
