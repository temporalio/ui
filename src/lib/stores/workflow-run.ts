import { writable } from 'svelte/store';

import { persistStore } from '$lib/stores/persist-store';
import type { TaskQueueResponse } from '$lib/types';
import type { WorkflowExecution, WorkflowMetadata } from '$lib/types/workflows';

export const refresh = writable(0);

export type WorkflowRunWithWorkers = {
  workflow: WorkflowExecution | null;
  workers: TaskQueueResponse;
  workersLoaded: boolean;
  metadata: WorkflowMetadata | null;
  userMetadata: {
    summary: string;
    details: string;
  };
};

export const initialWorkflowRun: WorkflowRunWithWorkers = {
  workflow: null,
  workers: { pollers: [], taskQueueStatus: null },
  workersLoaded: false,
  metadata: null,
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
