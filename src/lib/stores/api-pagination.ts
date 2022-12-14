import { derived, writable } from 'svelte/store';
import { page } from '$app/stores';
import {
  perPageFromSearchParameter,
  defaultItemsPerPage,
  options,
} from './pagination';

import type { Readable } from 'svelte/store';

type PaginationMethods = {
  nextPageWithItems: (t: NextPageToken, items: any[]) => void;
  nextPage: () => void;
  previousPage: () => void;
  setUpdating: () => void;
  reset: () => void;
  resetPageSize: () => void;
  nextRow: () => void;
  previousRow: () => void;
};

type PaginationItems = {
  key: string;
  loading: boolean;
  updating: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  index: number;
  pageSize: number;
  indexData: Record<
    number,
    { nextToken: string; start: number; end: number; items: any[] }
  >;
  activeRow: number;
};

const defaultStore: PaginationItems = {
  key: 'per-page',
  loading: true,
  updating: false,
  hasNext: false,
  hasPrevious: false,
  index: 0,
  pageSize: defaultItemsPerPage,
  indexData: {},
  activeRow: 0,
};

export type PaginationStore = PaginationMethods & Readable<PaginationItems>;

export function createPaginationStore(
  pageSizeOptions: string[] = options,
): PaginationStore {
  // TODO, use first option in pageSizeOptions for pageSize instead of defaultItemsPerPage
  const paginationStore = writable(defaultStore);
  const { set, update } = paginationStore;

  const pageSize = derived([page], ([$page]) => {
    return perPageFromSearchParameter(
      $page.url.searchParams.get('per-page') ?? undefined,
    );
  });

  const { subscribe } = derived(
    [paginationStore, pageSize],
    ([$pagination, $pageSize]) => {
      return {
        ...$pagination,
        pageSize: $pageSize,
      };
    },
  );

  const setNextPageWithItems = (
    nextToken: string,
    items: any[],
    _store: PaginationItems,
  ) => {
    const currentIndex = _store.index;
    const store = {
      ..._store,
      hasNext: Boolean(nextToken),
      updating: false,
      loading: false,
    };
    store.indexData = { ...store.indexData };
    // Return early if page does not have any items
    // This can happen when the page size equals the number of items or visibleItems is filtered
    if (!items.length) return { ...store, hasNext: false };

    if (!store.indexData[currentIndex]) {
      store.indexData[currentIndex] = {
        nextToken,
        start: 1,
        end: items.length,
        items,
      };
      store.hasPrevious = false;
    } else {
      (store.index = currentIndex + 1),
        (store.indexData[store.index] = {
          nextToken,
          start: store.indexData[currentIndex].end + 1,
          end: store.indexData[currentIndex].end + items.length,
          items,
        });
      store.hasPrevious = true;
    }

    return store;
  };

  const setNextPage = (_store: PaginationItems) => {
    const store = {
      ..._store,
      index: _store.index + 1,
      hasPrevious: true,
      loading: false,
      updating: false,
    };

    if (!store.indexData[store.index]?.nextToken) {
      store.hasNext = false;
    }

    return store;
  };

  const setPreviousPage = (_store: PaginationItems) => {
    const store = {
      ..._store,
      hasNext: true,
      updating: false,
      loading: false,
      index: _store.index - 1,
    };

    if (store.index === 0) {
      store.hasPrevious = false;
    }

    return store;
  };

  return {
    subscribe,
    nextPageWithItems: (token: string, items: any[]) =>
      update((store) => setNextPageWithItems(token, items, store)),
    nextPage: () => update((store) => setNextPage(store)),
    previousPage: () => update((store) => setPreviousPage(store)),
    setUpdating: () =>
      update((store) => {
        return { ...store, updating: true };
      }),
    reset: () => set(defaultStore),
    resetPageSize: () =>
      update((store) => {
        return {
          ...store,
          index: 0,
          nextIndex: 0,
          indexData: {},
          updating: true,
        };
      }),
    nextRow: () =>
      update((store) => {
        // Add until at the bottom
        return {
          ...store,
          activeRow:
            store.activeRow < store.indexData[store.index].items.length - 1
              ? store.activeRow + 1
              : store.activeRow,
        };
      }),
    previousRow: () =>
      update((store) => {
        // Subtract until at the top
        return {
          ...store,
          activeRow: store.activeRow > 1 ? store.activeRow - 1 : 0,
        };
      }),
  };
}
