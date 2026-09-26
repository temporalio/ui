import { derived, writable } from 'svelte/store';

import type { NLSearchResponse } from '$lib/services/nl-search-service';

export type NLSearchTrace = {
  key: string;
  text: string;
  query: string | null;
  timestamp: number;
  response: NLSearchResponse;
};

export const NL_SEARCH_HISTORY_LIMIT = 10;

export const NL_SEARCH_PARAMETER = 'nlSearch';

export const nlSearchHistory = writable<NLSearchTrace[]>([]);

export const nlSearchTrace = derived(
  nlSearchHistory,
  ($history) => $history.at(-1) ?? null,
);

export const nlSearchTraceOpen = writable(false);

let sequence = 0;

export const recordNLSearch = (
  text: string,
  response: NLSearchResponse,
  query: string | null,
  timestamp = Date.now(),
): void => {
  sequence += 1;
  const entry: NLSearchTrace = {
    key: `${timestamp}-${sequence}`,
    text,
    query,
    timestamp,
    response,
  };
  nlSearchHistory.update((history) =>
    [...history, entry].slice(-NL_SEARCH_HISTORY_LIMIT),
  );
};
