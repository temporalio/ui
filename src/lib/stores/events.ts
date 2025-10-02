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
import {
  isLocalActivityMarkerEvent,
  isResetEvent,
} from '$lib/utilities/is-event-type';

import { eventFilterSort } from './event-view';
import { eventTypeFilter } from './filters';
import { persistStore } from './persist-store';

const namespace = derived([page], ([$page]) => {
  if ($page.params.namespace) {
    try {
      return decodeURIForSvelte($page.params.namespace);
    } catch (error) {
      return $page.params.namespace;
    }
  }
  return '';
});

const workflowId = derived([page], ([$page]) => {
  if ($page.params.workflow) {
    try {
      return decodeURIForSvelte($page.params.workflow);
    } catch (error) {
      return $page.params.workflow;
    }
  }
  return '';
});

const runId = derived([page], ([$page]) => {
  if ($page.params.run) {
    try {
      return decodeURIForSvelte($page.params.run);
    } catch (error) {
      return $page.params.run;
    }
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

export const timelineEvents = writable(null);
export const fullEventHistory = writable<WorkflowEvents>([]);

export const pauseLiveUpdates = writable(false);
export const currentEventHistory = writable<WorkflowEvents>([]);

export const filteredEventHistory = derived(
  [currentEventHistory, eventTypeFilter],
  ([$history, $types]) => {
    return $history.filter((event) => {
      if (isLocalActivityMarkerEvent(event)) {
        return $types.includes('local-activity');
      }
      return $types.includes(event.category);
    });
  },
);

export const resetEvents = derived(fullEventHistory, (events) =>
  events.filter(isResetEvent),
);

export const decodeEventHistory = persistStore<boolean>(
  'decodeEventHistory',
  true,
  true,
);

export type DownloadEventHistorySetting = 'encoded' | 'decoded' | 'readable';

export const downloadEventHistorySetting =
  persistStore<DownloadEventHistorySetting>(
    'downloadEventHistorySetting',
    'encoded',
    true,
  );
