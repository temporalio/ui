import { derived, type Readable, writable } from 'svelte/store';

import { page } from '$app/stores';

import type { FetchEventsParameters } from '$lib/services/events-service';
import { getEventArray } from '$lib/services/grouped-event-buffer';
import type {
  WorkflowEvents,
  WorkflowTaskCompletedEvent,
} from '$lib/types/events';
import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
import { getSDKandVersion } from '$lib/utilities/get-sdk-version';
import {
  isLocalActivityMarkerEvent,
  isResetEvent,
  isWorkflowTaskCompletedEvent,
} from '$lib/utilities/is-event-type';

import { eventFilterSort } from './event-view';
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

export const pauseLiveUpdates = writable(false);

/**
 * Incremented whenever the grouped-event-buffer changes: after each rAF-batched
 * group update, after fetch completes, and after each live-event batch arrives.
 * Consumers call getEventArray() / getGroupArray() inside a derived that reads
 * this value so they re-run once per batch rather than once per raw event.
 */
export const bufferVersion = writable(0);

/**
 * Flat view of all workflow events sourced from the grouped-event-buffer.
 * Updated by workflow-run-layout via bufferVersion — elements are the same
 * WorkflowEvent instances held in groupPool (shallow pointer array, not a copy).
 * Writable so standalone pages (e.g. workflow-history-event) can populate it
 * independently via fetchAllEvents.
 */
export const fullEventHistory = writable<WorkflowEvents>([]);

export const resetEvents = derived(bufferVersion, () =>
  getEventArray().filter(isResetEvent),
);

export const sdkInfo = derived(bufferVersion, () =>
  getSDKandVersion(
    getEventArray().filter(
      isWorkflowTaskCompletedEvent,
    ) as WorkflowTaskCompletedEvent[],
  ),
);

export const filteredEventHistory = derived(
  [bufferVersion, eventTypeFilter],
  ([, $types]) =>
    getEventArray().filter((event) => {
      if (isLocalActivityMarkerEvent(event)) {
        return $types.includes('local-activity');
      }
      return $types.includes(event.category);
    }),
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
