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

const executionStatusFilter = (value: string) =>
  createFilter({
    attribute: 'ExecutionStatus',
    type: 'Keyword',
    conditional: '=',
    value,
  });

const workflowTypeFilter = (value: string) =>
  createFilter({
    attribute: 'WorkflowType',
    type: 'Keyword',
    conditional: '=',
    value,
  });

describe('syncFiltersOnPopState', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('re-derives filters from the URL query on a popstate navigation', () => {
    const staleFilters = [
      executionStatusFilter('Running'),
      workflowTypeFilter('SomeWorkflow'),
    ];
    const freshFilters = [executionStatusFilter('Running')];
    const filters = writable(staleFilters);
    const parseQuery = vi.fn().mockReturnValue(freshFilters);

    syncFiltersOnPopState({
      page: {
        url: new URL(
          'https://example.com?query=ExecutionStatus%20%3D%20%22Running%22',
        ),
      },
      filters,
      parseQuery,
    });

    navigationCallback({ type: 'popstate' });

    expect(parseQuery).toHaveBeenCalledWith('ExecutionStatus = "Running"');
    expect(get(filters)).toEqual(freshFilters);
  });

  it('clears filters on a popstate navigation with no query param', () => {
    const staleFilters = [executionStatusFilter('Running')];
    const filters = writable(staleFilters);
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
    const staleFilters = [executionStatusFilter('Running')];
    const filters = writable(staleFilters);
    const parseQuery = vi.fn();

    syncFiltersOnPopState({
      page: {
        url: new URL(
          'https://example.com?query=ExecutionStatus%20%3D%20%22Running%22%20and%20WorkflowType%20%3D%20%22SomeWorkflow%22',
        ),
      },
      filters,
      parseQuery,
    });

    navigationCallback({ type: 'goto' });

    expect(parseQuery).not.toHaveBeenCalled();
    expect(get(filters)).toEqual(staleFilters);
  });
});
