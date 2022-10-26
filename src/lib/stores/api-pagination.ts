import { derived, writable } from 'svelte/store';
import { page } from '$app/stores';
import { perPageFromSearchParameter, defaultItemsPerPage } from './pagination';

import type { Readable } from 'svelte/store';

type PaginationMethods = {
  nextPage: () => void;
  previousPage: () => void;
  setNextPageToken: (t: string, items: any[]) => void;
  setUpdating: () => void;
  reset: () => void;
  resetPageSize: () => void;
};

type PaginationItems = {
  key: string;
  index: number;
  nextIndex: number;
  pageSize: number;
  currentPageNumber: number;
  endingPageNumber: number;
  items: any[];
  loading: boolean;
  updating: boolean;
  indexTokens: Record<number, string>;
  hasNext: boolean;
  hasPrevious: boolean;
};

const initialStore: PaginationItems = {
  key: 'per-page',
  index: 0,
  nextIndex: 0,
  pageSize: defaultItemsPerPage,
  currentPageNumber: 1,
  endingPageNumber: defaultItemsPerPage,
  items: [],
  loading: true,
  updating: true,
  indexTokens: {},
  hasNext: true,
  hasPrevious: false,
};

export type PaginationStore = PaginationMethods & Readable<PaginationItems>;

export function createPaginationStore(): PaginationStore {
  const paginationStore = writable(initialStore);
  const { set, update } = paginationStore;

  const pageSize = derived([page], ([$page]) => {
    return perPageFromSearchParameter(
      $page.url.searchParams.get('per-page') ?? undefined,
    );
  });

  const { subscribe } = derived(
    [paginationStore, pageSize],
    ([$pagination, $pageSize]) => {
      const getEndingPageNumber = () => {
        if ($pagination.items.length < $pageSize && $pagination.index === 0) {
          return $pagination.items.length;
        }

        if ($pagination.items.length < $pageSize) {
          return $pagination.index * $pageSize + $pagination.items.length;
        }

        return $pagination.index * $pageSize + $pageSize;
      };

      return {
        ...$pagination,
        currentPageNumber: $pagination.index * $pageSize + 1,
        endingPageNumber: getEndingPageNumber(),
        pageSize: $pageSize,
      };
    },
  );

  const setNextPageToken = (
    nextToken: string,
    items: any[],
    store: PaginationItems,
  ) => {
    const _store = { ...store };
    _store.items = items;
    _store.updating = false;
    _store.loading = false;
    _store.hasNext = Boolean(nextToken);
    _store.index = store.nextIndex;

    if (store.nextIndex === store.index) {
      // First page
      _store.indexTokens[store.nextIndex + 1] = nextToken;
      _store.hasPrevious = false;
    } else if (store.nextIndex > store.index) {
      // Next Page
      _store.indexTokens[store.nextIndex + 1] = nextToken;
      _store.hasPrevious = true;
    } else if (store.nextIndex < store.index) {
      // Previous Page
      if (store.nextIndex === 0) _store.hasPrevious = false;
    }

    return _store;
  };

  return {
    subscribe,
    nextPage: () =>
      update((store) => {
        return { ...store, nextIndex: store.index + 1 };
      }),
    previousPage: () =>
      update((store) => {
        if (store.index > 0) {
          return { ...store, nextIndex: store.index - 1 };
        }
        return store;
      }),
    setNextPageToken: (token: string, items: any[]) =>
      update((store) => setNextPageToken(token, items, store)),
    setUpdating: () =>
      update((store) => {
        return { ...store, updating: true };
      }),
    reset: () => set(initialStore),
    resetPageSize: () =>
      update((store) => {
        return { ...store, index: 0, nextIndex: 0, updating: true };
      }),
  };
}
