import { writable } from 'svelte/store';

export type WorkflowComparison = {
  workflowId: string;
  runId: string;
  resetFromEventId: string;
  timestamp: number;
};

export type WorkflowComparisonState = {
  isComparing: boolean;
  originalWorkflow: {
    workflowId: string;
    runId: string;
  } | null;
  comparisons: WorkflowComparison[];
};

const compareInitialState: WorkflowComparisonState = {
  isComparing: true,
  originalWorkflow: null,
  comparisons: [],
};

const initialState: WorkflowComparisonState = {
  isComparing: false,
  originalWorkflow: null,
  comparisons: [],
};

function createWorkflowComparisonStore() {
  const { subscribe, set, update } =
    writable<WorkflowComparisonState>(compareInitialState);

  return {
    subscribe,
    startComparison: (workflowId: string, runId: string) => {
      update((state) => ({
        ...state,
        isComparing: true,
        originalWorkflow: { workflowId, runId },
        comparisons: [],
      }));
    },
    addComparison: (
      workflowId: string,
      runId: string,
      resetFromEventId: string,
    ) => {
      update((state) => ({
        ...state,
        comparisons: [
          ...state.comparisons,
          {
            workflowId,
            runId,
            resetFromEventId,
            timestamp: Date.now(),
          },
        ],
      }));
    },
    removeComparison: (runId: string) => {
      update((state) => ({
        ...state,
        comparisons: state.comparisons.filter((c) => c.runId !== runId),
      }));
    },
    exitComparison: () => {
      set(initialState);
    },
    reset: () => {
      set(initialState);
    },
  };
}

export const workflowComparison = createWorkflowComparisonStore();
