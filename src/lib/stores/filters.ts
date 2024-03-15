import type { StartStopNotifier } from 'svelte/store';
import { derived, get, writable } from 'svelte/store';

import { page } from '$app/stores';

import type { WorkflowFilter } from '$lib/models/workflow-filters';
import { persistStore } from '$lib/stores/persist-store';
import type { EventClassification, EventTypeCategory } from '$lib/types/events';

const query = derived([page], ([$page]) => $page.url.searchParams.get('query'));
const category = derived([page], ([$page]) =>
  $page.url.searchParams.get('category'),
);
const classification = derived([page], ([$page]) =>
  $page.url.searchParams.get('classification'),
);

const parameters = derived(
  [query, category, classification],
  ([$query, $category, $classification]) => {
    return {
      query: $query,
      category: $category,
      classification: $classification,
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

export const searchInputViewOpen = persistStore<boolean>(
  'searchInputView',
  false,
  true,
);

export const workflowFilters = writable<WorkflowFilter[]>(
  [],
  updateWorkflowFilters,
);

const updateEventCategoryFilter: StartStopNotifier<
  EventTypeCategory[] | null
> = (set) => {
  return parameters.subscribe(({ category }) => {
    if (!category && get(eventCategoryFilter)) {
      // Clear filter if there is no category
      set(null);
    }
  });
};

export const eventCategoryFilter = writable<EventTypeCategory[] | undefined>(
  undefined,
  updateEventCategoryFilter,
);

const updateEventClassificationFilter: StartStopNotifier<
  EventClassification[] | null
> = (set) => {
  return parameters.subscribe(({ classification }) => {
    if (!classification && get(eventClassificationFilter)) {
      // Clear filter if there is no category
      set(null);
    }
  });
};

export const eventClassificationFilter = writable<
  EventClassification[] | undefined
>(undefined, updateEventClassificationFilter);
