import {
  derived,
  readable,
  writable,
  Readable,
  Unsubscriber,
} from 'svelte/store';

import { page } from '$app/stores';

import {
  fetchEvents,
  FetchEventsParameters,
  FetchEventsParametersWithSettings,
} from '$lib/services/events-service';

import { eventCategory, eventSortOrder } from './event-view';
import { decodeURIForSvelte } from '$lib/utilities/encode-uri';

const emptyEvents: FetchEventsResponse = {
  events: [],
  eventGroups: [],
};

const namespace = derived([page], ([$page]) =>
  decodeURIForSvelte($page.params.namespace),
);
const workflowId = derived([page], ([$page]) =>
  decodeURIForSvelte($page.params.workflow),
);
const runId = derived([page], ([$page]) =>
  decodeURIForSvelte($page.params.run),
);

const settings = derived([page], ([$page]) => $page.stuff.settings);

const loading = writable(true);

const shouldFetchNewEvents = (parameters: FetchEventsParameters): boolean => {
  for (const required of ['namespace', 'workflowId', 'runId']) {
    if (!parameters[required]) return false;
  }
  return true;
};

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

export const parametersWithSettings: Readable<FetchEventsParametersWithSettings> =
  derived([parameters, settings], ([$parameters, $settings]) => {
    return {
      ...$parameters,
      settings: $settings,
    };
  });

export const eventHistory = readable(emptyEvents, (set): Unsubscriber => {
  return parametersWithSettings.subscribe(async (params) => {
    loading.set(true);
    if (shouldFetchNewEvents(params)) {
      const response = await fetchEvents(params);
      set(response);
      loading.set(false);
    } else {
      set(emptyEvents);
    }
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
