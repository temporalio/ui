import { derived, type Readable, writable } from 'svelte/store';

import { page } from '$app/stores';

import type { FetchEventsParameters } from '$lib/services/events-service';
import type { WorkflowEvents } from '$lib/types/events';
import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
import { getSDKandVersion } from '$lib/utilities/get-sdk-version';
import {
  isLocalActivityMarkerEvent,
  isResetEvent,
  isWorkflowTaskCompletedEvent,
} from '$lib/utilities/is-event-type';

import { eventFilterSort, eventTimeFilter } from './event-view';
import { eventTypeFilter } from './filters';
import { persistStore } from './persist-store';

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

export const timelineEvents = writable(null);
export const fullEventHistory = writable<WorkflowEvents>([]);

export const pauseLiveUpdates = writable(false);
export const currentEventHistory = writable<WorkflowEvents>([]);

const ISO_SECOND_LENGTH = 19;
const toIsoSecond = (d: Date) => d.toISOString().slice(0, ISO_SECOND_LENGTH);

const matchesType = (
  event: WorkflowEvents[number],
  types: string[],
): boolean => {
  if (isLocalActivityMarkerEvent(event))
    return types.includes('local-activity');
  return types.includes(event.category);
};

export const typeFilteredEventHistory = derived(
  [currentEventHistory, eventTypeFilter],
  ([$history, $types]) =>
    $history.filter((event) => matchesType(event, $types)),
);

export const filteredEventHistory = derived(
  [currentEventHistory, eventTypeFilter, eventTimeFilter],
  ([$history, $types, $timeRange]) => {
    const startIso = $timeRange.startTime
      ? toIsoSecond($timeRange.startTime)
      : null;
    const endIso = $timeRange.endTime ? toIsoSecond($timeRange.endTime) : null;
    return $history.filter((event) => {
      if (!matchesType(event, $types)) return false;
      if (startIso === null && endIso === null) return true;
      if (!event.eventTime) return true;
      const eventIso = (event.eventTime as string).slice(0, ISO_SECOND_LENGTH);
      if (startIso !== null && eventIso < startIso) return false;
      if (endIso !== null && eventIso > endIso) return false;
      return true;
    });
  },
);

export const resetEvents = derived(fullEventHistory, (events) =>
  events.filter(isResetEvent),
);

export const sdkInfo = derived(fullEventHistory, ($history) => {
  const workflowCompletedTasks = $history.filter(isWorkflowTaskCompletedEvent);
  return getSDKandVersion(workflowCompletedTasks);
});

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
