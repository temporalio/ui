import type {
  WorkflowFilter,
  WorkflowSort,
} from '$lib/models/workflow-filters';
import { writable } from 'svelte/store';
import { persistStore } from '$lib/stores/persist-store';

export const workflowFilters = writable<WorkflowFilter[]>([]);
export const persistedWorkflowFilters = persistStore<WorkflowFilter[]>(
  'workflowFilters',
  [],
);
export const workflowSorts = writable<WorkflowSort[]>([]);
