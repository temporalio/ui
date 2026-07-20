import { derived, type Readable, writable } from 'svelte/store';

import { page } from '$app/stores';

import type { FetchEventsParameters } from '$lib/services/events-service';
import {
  bufferVersion,
  getEventArray,
} from '$lib/services/grouped-event-buffer';
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

export { bufferVersion };

/**
 * Flat view of all workflow events sourced from the grouped-event-buffer.
 * Updated by workflow-run-layout in a bufferVersion-gated effect — elements are
 * the same WorkflowEvent instances held by the buffer (shallow pointer array,
 * not a copy). Writable so standalone pages (e.g. workflow-history-event) can
 * populate it independently via fetchAllEvents.
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
