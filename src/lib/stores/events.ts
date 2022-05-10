import {
  derived,
  readable,
  writable,
  Readable,
} from 'svelte/store';
import type { Writable, StartStopNotifier } from 'svelte/store';

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

const workflowId = derived([page], ([$page]) => {
  if ($page.params.workflow) {
    return decodeURIForSvelte($page.params.workflow);
  }
  return '';
});

const runId = derived([page], ([$page]) => {
  if ($page.params.run) {
    return decodeURIForSvelte($page.params.run);
  }
  return '';
});

const settings = derived([page], ([$page]) => $page.stuff.settings);

const shouldFetchNewEvents = (params: FetchEventsParametersWithSettings): boolean => {
  for (const required of ['namespace', 'workflowId', 'runId']) {
    if (!params[required]) return false;
  }

  debugger

  return true;
};

const withLoading = async (
  loading: Writable<boolean>,
  fn: () => Promise<void>,
) => {
  updating.set(true);
  await fn();
  loading.set(false);
  setTimeout(() => {
    updating.set(false);
  }, 300);
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

export const updateEventHistory: StartStopNotifier<FetchEventsResponse> = (set) => {
  return parametersWithSettings.subscribe(async (params) => {
    if (shouldFetchNewEvents(params)) {
      withLoading(loading, async () => {
        const events = await fetchEvents(params);
        if (events?.events?.length) {
          set(events);
        } else {
          setTimeout(() => {
            set(events);
          }, 300);
        }
      });
    }
  });
};

export const rawEventHistory = readable(emptyEvents, updateEventHistory)

// export const events: Readable<WorkflowEvents> = derived(
//   [rawEventHistory, eventCategory],
//   ([$rawEventHistory, $category]) => {
//     const { events } = $rawEventHistory;
//     if (!$category) return events;
//     return events.filter((event) => event.category === $category);
//   },
// );

// export const eventGroups: Readable<EventGroups> = derived(
//   [rawEventHistory, eventCategory],
//   ([$rawEventHistory, $category]) => {
//     const { eventGroups } = $rawEventHistory;
//     if (!$category) return eventGroups;
//     return eventGroups.filter((event) => event.category === $category);
//   },
// );

export const eventHistory: Readable<FetchEventsResponse> = derived(
  [rawEventHistory, eventCategory],
  ([$rawEventHistory, $category]) => {
    const { events, eventGroups } = $rawEventHistory;
    if (!$category) return { events, eventGroups };
    return {
      events: events.filter((event) => event.category === $category),
      eventGroups: eventGroups.filter((event) => event.category === $category),
    }
  },
);


export const updating = writable(true);
export const loading = writable(true);
