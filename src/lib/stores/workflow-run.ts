import { writable } from 'svelte/store';

import { Action } from '$lib/models/workflow-actions';
import { persistStore } from '$lib/stores/persist-store';
import type { TaskQueueResponse } from '$lib/types';
import type { WorkflowExecution, WorkflowMetadata } from '$lib/types/workflows';

export type RefreshAction = {
  timestamp: number;
  action: Action | null;
};

export const refresh = writable<RefreshAction>({ timestamp: 0, action: null });

export const triggerRefresh = (action: Action | null = null): void => {
  refresh.set({ timestamp: Date.now(), action });
};

export type WorkflowRunWithWorkers = {
  workflow: WorkflowExecution | null;
  workers: TaskQueueResponse;
  metadata: WorkflowMetadata;
  userMetadata: {
    summary: string;
    details: string;
  };
};

export const initialWorkflowRun: WorkflowRunWithWorkers = {
  workflow: null,
  workers: { pollers: [], taskQueueStatus: null },
  metadata: undefined,
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
