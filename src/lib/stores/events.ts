import { derived, type Readable, writable } from 'svelte/store';

import { page } from '$app/stores';

import type { FetchEventsParameters } from '$lib/services/events-service';
import { decodeURIForSvelte } from '$lib/utilities/encode-uri';

import { eventFilterSort } from './event-view';
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

export const pauseLiveUpdates = writable(false);

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
