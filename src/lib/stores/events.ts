import {
  derived,
  readable,
  writable,
  Readable,
  Writable,
  get,
} from 'svelte/store';
import type { StartStopNotifier } from 'svelte/store';

import { page } from '$app/stores';

import {
  fetchEvents,
  FetchEventsParameters,
  FetchEventsParametersWithSettings,
} from '$lib/services/events-service';

import { eventCategoryParam, eventSortOrder } from './event-view';
import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
import { withLoading, delay } from '$lib/utilities/stores/with-loading';
import { groupEvents } from '$lib/models/event-groups';

const emptyEvents: FetchEventsResponse = {
  events: [],
  eventGroups: [],
};

const namespace = derived([page], ([$page]) => {
  if ($page.params.namespace) {
    return decodeURIForSvelte($page.params.namespace);
  }
  return '';
});

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

const emptyPrevious: FetchEventsParameters = {
  namespace: null,
  workflowId: null,
  runId: null,
  rawPayloads: null,
  sort: null,
};

const previous: Writable<FetchEventsParameters> = writable(emptyPrevious);

export const clearPreviousEventParameters = (): void => {
  previous.set(emptyPrevious);
};

const isNewRequest = (
  params: FetchEventsParameters,
  previous: Writable<FetchEventsParameters>,
): boolean => {
  for (const required of ['namespace', 'workflowId', 'runId']) {
    if (!params[required]) return false;
  }

  let matchedPrevious = true;
  const previousParameters = get(previous);
  for (const key of Object.keys(previousParameters)) {
    if (previousParameters[key] !== params[key]) {
      matchedPrevious = false;
      break;
    }
  }

  if (matchedPrevious) return false;

  previous.set(params);

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

export const updateEventHistory: StartStopNotifier<FetchEventsResponse> = (
  set,
) => {
  return parametersWithSettings.subscribe(async (params) => {
    const { settings: _, ...rest } = params;
    if (isNewRequest(rest, previous)) {
      withLoading(loading, updating, async () => {
        const events = await fetchEvents(params);
        if (events?.events?.length) {
          set(events);
        } else {
          setTimeout(() => {
            set(events);
          }, delay);
        }
      });
    }
  });
};

export const eventHistory = readable(emptyEvents, updateEventHistory);

export const timelineEvents = writable(null);

export const events: Readable<WorkflowEvents> = derived(
  [eventHistory, eventCategoryParam, timelineEvents],
  ([$eventHistory, $category, $timelineEvents]) => {
    if ($timelineEvents) {
      return $timelineEvents;
    }
    const { events } = $eventHistory;
    if (!$category) return events;
    return events.filter((event) => event.category === $category);
  },
);

export const eventGroups: Readable<EventGroups> = derived(
  [eventHistory, eventCategoryParam],
  ([$eventHistory, $category]) => {
    const { eventGroups } = $eventHistory;
    if (!$category) return eventGroups;
    return eventGroups.filter((event) => event.category === $category);
  },
);

export const ascendingEventGroups: Readable<EventGroups> = derived(
  [eventHistory, eventSortOrder, eventCategoryParam],
  ([$eventHistory, $sortOrder, $category]) => {
    const { events } = $eventHistory;
    const _events =
      $sortOrder === 'descending' ? events.slice().reverse() : events;
    const eventGroups = groupEvents(_events);
    if (!$category) return eventGroups;
    return eventGroups.filter((event) => event.category === $category);
  },
);

export const ascendingEvents: Readable<WorkflowEvents> = derived(
  [eventHistory, eventSortOrder, eventCategoryParam],
  ([$eventHistory, $sortOrder, $category]) => {
    const { events } = $eventHistory;
    const _events =
      $sortOrder === 'descending' ? events.slice().reverse() : events;
    if (!$category) return _events;
    return _events.filter((event) => event.category === $category);
  },
);

export const updating = writable(true);
export const loading = writable(true);
export const activeEvent = writable(null);
