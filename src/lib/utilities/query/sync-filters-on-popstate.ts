import type { Writable } from 'svelte/store';

import { afterNavigate } from '$app/navigation';

import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';

interface SyncFiltersOnPopStateOptions {
  page: { url: URL };
  filters: Writable<SearchAttributeFilter[]>;
  parseQuery: (query: string) => SearchAttributeFilter[];
}

export function syncFiltersOnPopState({
  page,
  filters,
  parseQuery,
}: SyncFiltersOnPopStateOptions): void {
  afterNavigate(({ type }) => {
    if (type !== 'popstate') return;

    const query = page.url.searchParams.get('query') ?? '';
    filters.set(query ? parseQuery(query) : []);
  });
}
