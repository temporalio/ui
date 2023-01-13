import { writable } from 'svelte/store';
import { persistStore } from '$lib/stores/persist-store';

import type { GetPollersResponse } from '$lib/services/pollers-service';

export const refresh = writable(0);

type WorkflowRunStore = {
  workflow: WorkflowExecution | null;
  workers: GetPollersResponse;
};
const initialWorkflowRun: WorkflowRunStore = {
  workflow: null,
  workers: { pollers: [], taskQueueStatus: null },
};

export const updating = writable(true);
export const workflowRun = writable<WorkflowRunStore>(initialWorkflowRun);
export const workflowSummaryViewOpen = persistStore<boolean>(
  'workflowSummaryView',
  true,
  true,
);