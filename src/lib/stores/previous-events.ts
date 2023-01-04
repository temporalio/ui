import { writable, type Writable } from 'svelte/store';

import type { FetchEventsParameters } from '$lib/services/events-service';

const emptyPrevious: FetchEventsParameters = {
  namespace: null,
  workflowId: null,
  runId: null,
  rawPayloads: null,
  sort: null,
};

export const previous: Writable<FetchEventsParameters> =
  writable(emptyPrevious);

export const clearPreviousEventParameters = (): void => {
  previous.set(emptyPrevious);
};
