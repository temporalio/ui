import { derived, type Readable, writable } from 'svelte/store';

import { page } from '$app/stores';

import type {
  FetchEventsParameters,
  FetchEventsParametersWithSettings,
} from '$lib/services/events-service';
import { authUser } from '$lib/stores/auth-user';
import { refresh } from '$lib/stores/workflow-run';
import type { WorkflowEvents } from '$lib/types/events';
import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
import { isResetEvent } from '$lib/utilities/is-event-type';

import { eventFilterSort } from './event-view';

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

export const parameters: Readable<FetchEventsParameters> = derived(
  [namespace, workflowId, runId, eventFilterSort],
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

export const initialEventHistory: StartAndEndEventHistory = {
  start: [],
  end: [],
};

export const eventHistory =
  writable<StartAndEndEventHistory>(initialEventHistory);
export const timelineEvents = writable(null);

export const fullEventHistory = writable<WorkflowEvents>([]);

export const resetEvents = derived(fullEventHistory, (events) =>
  events.filter(isResetEvent),
);
