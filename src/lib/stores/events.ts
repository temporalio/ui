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
  type FetchEventsParameters,
  type FetchEventsParametersWithSettings,
} from '$lib/services/events-service';

import { eventSortOrder } from './event-view';
import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
import { withLoading, delay } from '$lib/utilities/stores/with-loading';
import { refresh } from '$lib/stores/workflow-run';
import { authUser } from '$lib/stores/auth-user';
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

const accessToken = derived(
  [authUser],
  ([$authUser]) => $authUser?.accessToken,
);

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
          set({ ...events });
        } else {
          setTimeout(() => {
            set({ ...events });
          }, delay);
        }
      });
    }
  });
};

export const eventHistory = readable<StartAndEndEventHistory>(
  { start: [], end: [] },
  updateEventHistory,
);

export const timelineEvents = writable(null);
export const updating = writable(true);
export const loading = writable(true);
