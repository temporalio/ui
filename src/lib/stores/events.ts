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

const previous: FetchEventsParameters = {
  namespace: null,
  workflowId: null,
  runId: null,
  rawPayloads: false,
  sort: 'descending',
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

const isNewRequest = (parameters: FetchEventsParameters, previous: FetchEventsParameters): boolean => {
  for (const required of ['namespace', 'workflowId', 'runId']) {
    if (!parameters[required]) return false;
  }

  if (query === previous.query && namespace === previous.namespace) {
    return false;
  }

  previous.namespace = namespace;
  previous.query = query;


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
    if (isNewRequest(params)) {
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

export const eventHistory = readable(emptyEvents, updateEventHistory)

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

export const updating = writable(true);
export const loading = writable(true);
