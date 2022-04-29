import { derived, readable, writable, Readable } from 'svelte/store';
import { page } from '$app/stores';
import {
  fetchEvents,
  FetchEventsParameters,
} from '$lib/services/events-service';
import { eventCategory, eventSortOrder } from './event-view';

const emptyEvents: FetchEventsResponse = {
  events: [],
  eventGroups: [],
};

const namespace = derived([page], ([$page]) => $page.params.namespace);
const workflowId = derived([page], ([$page]) => $page.params.workflow);
const runId = derived([page], ([$page]) => $page.params.run);

const loading = writable(true);

export const parameters: Readable<FetchEventsParameters> = derived(
  [namespace, workflowId, runId, eventSortOrder],
  ([$namespace, $workflowId, $runId, $sort]) => {
    return {
      namespace: $namespace,
      workflowId: $workflowId,
      runId: $runId,
      sort: $sort,
    };
  },
);

export const eventHistory = readable(emptyEvents, (set) => {
  return parameters.subscribe(async (params) => {
    loading.set(true);
    const eventsAndGroups = await fetchEvents(params);
    set(eventsAndGroups);
    loading.set(false);
  });
});

export const events = derived(
  [eventHistory, eventCategory],
  ([$eventHistory, $category]) => {
    const { events } = $eventHistory;
    if (!$category) return events;
    return events.filter((event) => event.category === $category);
  },
);

export const eventGroups = derived(
  [eventHistory, eventCategory],
  ([$eventHistory, $category]) => {
    const { eventGroups } = $eventHistory;
    if (!$category) return eventGroups;
    return eventGroups.filter((event) => event.category === $category);
  },
);
