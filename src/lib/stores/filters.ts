import type { StartStopNotifier } from 'svelte/store';
import { derived, get, writable } from 'svelte/store';

import { page } from '$app/stores';

import { allEventTypeOptions } from '$lib/models/event-history/get-event-categorization';
import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
import { persistStore } from '$lib/stores/persist-store';
import type { EventClassification, EventTypeCategory } from '$lib/types/events';

export const query = derived([page], ([$page]) =>
  $page.url.searchParams.get('query'),
);

export const showChildWorkflows = persistStore<boolean>(
  'showChildWorkflows',
  true,
  true,
);

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

const updateWorkflowFilters: StartStopNotifier<SearchAttributeFilter[]> = (
  set,
) => {
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

export const workflowFilters = writable<SearchAttributeFilter[]>(
  [],
  updateWorkflowFilters,
);

const updateScheduleFilters: StartStopNotifier<SearchAttributeFilter[]> = (
  set,
) => {
  return parameters.subscribe(({ query }) => {
    if (!query && get(scheduleFilters).length) {
      // Clear filters if there is no query
      set([]);
    }
  });
};

export const scheduleFilters = writable<SearchAttributeFilter[]>(
  [],
  updateScheduleFilters,
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

const defaultOptions = allEventTypeOptions.map(({ value }) => value);
export const eventTypeFilter = writable<EventTypeCategory[]>(defaultOptions);
export const eventStatusFilter = writable<boolean>(false);
