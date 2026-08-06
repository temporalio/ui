import { get, writable } from 'svelte/store';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { syncFiltersOnPopState } from './sync-filters-on-popstate';
import { createFilter } from './to-list-workflow-filters';

type NavigationCallback = (navigation: { type: string }) => void;

let navigationCallback: NavigationCallback = () => {};

vi.mock('$app/navigation', () => ({
  afterNavigate: (cb: NavigationCallback) => {
    navigationCallback = cb;
  },
}));

describe('syncFiltersOnPopState', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('re-derives filters from the URL query on a popstate navigation', () => {
    const staleFilter = createFilter({ attribute: 'Stale' });
    const freshFilter = createFilter({ attribute: 'Fresh' });
    const filters = writable([staleFilter]);
    const parseQuery = vi.fn().mockReturnValue([freshFilter]);

    syncFiltersOnPopState({
      page: { url: new URL('https://example.com?query=Fresh') },
      filters,
      parseQuery,
    });

    navigationCallback({ type: 'popstate' });

    expect(parseQuery).toHaveBeenCalledWith('Fresh');
    expect(get(filters)).toEqual([freshFilter]);
  });

  it('clears filters on a popstate navigation with no query param', () => {
    const staleFilter = createFilter({ attribute: 'Stale' });
    const filters = writable([staleFilter]);
    const parseQuery = vi.fn();

    syncFiltersOnPopState({
      page: { url: new URL('https://example.com') },
      filters,
      parseQuery,
    });

    navigationCallback({ type: 'popstate' });

    expect(parseQuery).not.toHaveBeenCalled();
    expect(get(filters)).toEqual([]);
  });

  it('leaves filters untouched on non-popstate navigations', () => {
    const staleFilter = createFilter({ attribute: 'Stale' });
    const filters = writable([staleFilter]);
    const parseQuery = vi.fn();

    syncFiltersOnPopState({
      page: { url: new URL('https://example.com?query=Fresh') },
      filters,
      parseQuery,
    });

    navigationCallback({ type: 'goto' });

    expect(parseQuery).not.toHaveBeenCalled();
    expect(get(filters)).toEqual([staleFilter]);
  });
});
