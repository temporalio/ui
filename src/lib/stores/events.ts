import {
  derived,
  readable,
  writable,
  get,
  type Readable,
  type Writable,
  type StartStopNotifier,
} from 'svelte/store';

import { page } from '$app/stores';

import {
  fetchStartAndEndEvents,
  getPaginatedEvents,
  type FetchEventsParameters,
  type FetchEventsParametersWithSettings,
} from '$lib/services/events-service';

import {
  eventFilterSort,
  eventSortOrder,
  eventViewType,
  supportsReverseOrder,
} from './event-view';
import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
import { withLoading, delay } from '$lib/utilities/stores/with-loading';
import { refresh } from '$lib/stores/workflow-run';
import { previous } from '$lib/stores/previous-events';

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

const settings = derived([page], ([$page]) => $page.data?.settings);

const accessToken = derived([page], ([$page]) => $page?.data.user?.accessToken);

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
  derived(
    [parameters, settings, accessToken, refresh],
    ([$parameters, $settings, $accessToken, $refresh]) => {
      return {
        ...$parameters,
        settings: $settings,
        accessToken: $accessToken,
        refresh,
        $refresh,
      };
    },
  );

export type StartAndEndEventHistory = {
  start: WorkflowEvents;
  end: WorkflowEvents;
  total: number;
};

const getTotalFromEndOfHistory = (endHistory: WorkflowEvents) => {
  const endingId = endHistory[0]?.id;
  if (!endingId || isNaN(parseInt(endingId))) return 0;
  return parseInt(endingId);
};

export const updateEventHistory: StartStopNotifier<StartAndEndEventHistory> = (
  set,
) => {
  return parametersWithSettings.subscribe(async (params) => {
    const { settings: _, ...rest } = params;
    if (isNewRequest(rest, previous)) {
      withLoading(loading, updating, async () => {
        const events = await fetchStartAndEndEvents(params);
        if (events?.start && events?.end) {
          const total = getTotalFromEndOfHistory(events.end);
          set({ ...events, total });
        } else {
          setTimeout(() => {
            set({ ...events, total: 0 });
          }, delay);
        }
      });
    }
  });
};

export const eventHistory = readable<StartAndEndEventHistory>(
  { start: [], end: [], total: 0 },
  updateEventHistory,
);

export const timelineEvents = writable(null);
export const updating = writable(true);
export const loading = writable(true);
export const activeEvent = writable(null);

export const fetchPaginatedEvents = derived(
  [page, eventFilterSort, eventViewType, supportsReverseOrder],
  async ([$page, $eventFilterSort, $eventViewType, $supportsReverseOrder]) => {
    return getPaginatedEvents({
      namespace: $page.params.namespace,
      workflowId: $page.params.workflow,
      runId: $page.params.run,
      sort: $eventFilterSort,
      category: $page.url.searchParams.get('category'),
      compact: $eventViewType === 'compact',
      settings: $page.data?.settings,
      accessToken: $page.data?.user?.accessToken,
      supportsReverseOrder: $supportsReverseOrder,
    });
  },
);
