import type { StartStopNotifier } from 'svelte/store';
import { derived, get, writable } from 'svelte/store';

import { page } from '$app/stores';

import type { WorkflowFilter } from '$lib/models/workflow-filters';
import { persistStore } from '$lib/stores/persist-store';

const query = derived([page], ([$page]) => $page.url.searchParams.get('query'));
const category = derived([page], ([$page]) =>
  $page.url.searchParams.get('category'),
);
const status = derived([page], ([$page]) =>
  $page.url.searchParams.get('status'),
);

const parameters = derived(
  [query, category, status],
  ([$query, $category, $status]) => {
    return {
      query: $query,
      category: $category,
      status: $status,
    };
  },
);

const updateWorkflowFilters: StartStopNotifier<WorkflowFilter[]> = (set) => {
  return parameters.subscribe(({ query }) => {
    if (!query && get(workflowFilters).length) {
      // Clear filters if there is no query
      set([]);
    }
  });
};

export const persistedTimeFilter = persistStore<WorkflowFilter>(
  'workflowDateTimeFilter',
  undefined,
  true,
);

export const searchInputViewOpen = persistStore<boolean>(
  'searchInputView',
  false,
  true,
);

export const workflowFilters = writable<WorkflowFilter[]>(
  [],
  updateWorkflowFilters,
);

const updateEventCategoryFilter: StartStopNotifier<string | null> = (set) => {
  return parameters.subscribe(({ category }) => {
    if (!category && get(eventCategoryFilter)) {
      // Clear filter if there is no category
      set(null);
    }
  });
};

const updateEventStatusFilter: StartStopNotifier<string | null> = (set) => {
  return parameters.subscribe(({ category }) => {
    if (!category && get(eventStatusFilter)) {
      // Clear filter if there is no category
      set(null);
    }
  });
};

export const eventCategoryFilter = writable<string | undefined>(
  undefined,
  updateEventCategoryFilter,
);

export const eventStatusFilter = writable<string | undefined>(
  undefined,
  updateEventStatusFilter,
);
