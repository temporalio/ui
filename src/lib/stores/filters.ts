import type {
  WorkflowFilter,
  WorkflowSort,
} from '$lib/models/workflow-filters';
import { writable, derived } from 'svelte/store';

export const workflowFilters = writable<WorkflowFilter[]>([]);
export const workflowSorts = writable<WorkflowSort[]>([]);
