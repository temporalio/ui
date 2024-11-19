import { writable } from 'svelte/store';

import type { GetPollersResponse } from '$lib/services/pollers-service';
import { persistStore } from '$lib/stores/persist-store';
import type { WorkflowExecution, WorkflowMetadata } from '$lib/types/workflows';

export const refresh = writable(0);

export type WorkflowRunWithWorkers = {
  workflow: WorkflowExecution | null;
  workers: GetPollersResponse;
  metadata: WorkflowMetadata;
  userMetadata: {
    summary: string;
    details: string;
  };
};

export const initialWorkflowRun: WorkflowRunWithWorkers = {
  workflow: null,
  workers: { pollers: [], taskQueueStatus: null },
  metadata: {
    definition: {
      queryDefinitions: [],
    },
  },
  userMetadata: {
    summary: '',
    details: '',
  },
};

export const workflowRun = writable<WorkflowRunWithWorkers>(initialWorkflowRun);
export const workflowSummaryViewOpen = persistStore<boolean>(
  'workflowSummaryView',
  true,
  true,
);
export const workflowTimelineViewOpen = persistStore<boolean>(
  'workflowTimelineView',
  true,
  true,
);
