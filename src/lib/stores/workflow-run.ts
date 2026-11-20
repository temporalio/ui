import { writable } from 'svelte/store';

import { Action as ActivityAction } from '$lib/models/activity-actions';
import { Action as WorkflowAction } from '$lib/models/workflow-actions';
import { persistStore } from '$lib/stores/persist-store';
import type { TaskQueueResponse } from '$lib/types';
import type {
  WorkflowExecution,
  WorkflowMetadata,
  WorkflowStatus,
} from '$lib/types/workflows';

export type RefreshAction = {
  timestamp: number;
  action: WorkflowAction | ActivityAction | null;
};

export const refresh = writable<RefreshAction>({ timestamp: 0, action: null });

export const triggerRefresh = (
  action: WorkflowAction | ActivityAction | null = null,
): void => {
  refresh.set({ timestamp: Date.now(), action });
};

export type CurrentRun = {
  runId: string;
  firstRunId: string | undefined;
  status: WorkflowStatus;
};

export type WorkflowRunWithWorkers = {
  workflow: WorkflowExecution | null;
  workers: TaskQueueResponse;
  workersLoaded: boolean;
  workerCount: number | undefined;
  metadata: WorkflowMetadata | null;
  currentRun: CurrentRun | null;
  userMetadata: {
    summary: string;
    details: string;
  };
};

export const initialWorkflowRun: WorkflowRunWithWorkers = {
  workflow: null,
  workers: { pollers: [], taskQueueStatus: null },
  workersLoaded: false,
  workerCount: undefined,
  metadata: null,
  currentRun: null,
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
