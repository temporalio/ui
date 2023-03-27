import type {
  WorkflowFilter,
  WorkflowSort,
} from '$lib/models/workflow-filters';
import { writable, derived, get } from 'svelte/store';
import { page } from '$app/stores';
import type { StartStopNotifier } from 'svelte/store';

const query = derived([page], ([$page]) => $page.url.searchParams.get('query'));

const parameters = derived([query], ([$query]) => {
  return {
    query: $query,
  };
});

const updateFilters: StartStopNotifier<WorkflowFilter[]> = (set) => {
  return parameters.subscribe(({ query }) => {
    if (!query && get(workflowFilters).length) {
      // Clear filters if there is no query
      set([]);
    }
  });
};

const updateSorts: StartStopNotifier<WorkflowSort[]> = (set) => {
  return parameters.subscribe(({ query }) => {
    if (!query && get(workflowSorts).length) {
      // Clear sorts if there is no query
      set([]);
    }
  });
};

export const workflowFilters = writable<WorkflowFilter[]>([], updateFilters);
export const workflowSorts = writable<WorkflowSort[]>([], updateSorts);
