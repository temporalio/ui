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
  setActiveIndex: (activeIndex: number) => void;
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
  visibleItems: any[];
  hasNextIndexData: boolean;
  indexStart: number;
  indexEnd: number;
  activeIndex: number;
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
  visibleItems: [],
  hasNextIndexData: false,
  indexStart: 0,
  indexEnd: 0,
  activeIndex: 0,
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
      const visibleItems =
        $pagination.indexData[$pagination.index]?.items ?? [];
      const indexStart = $pagination.indexData[$pagination.index]?.start ?? 0;
      const indexEnd = $pagination.indexData[$pagination.index]?.end ?? 0;
      const hasNextIndexData = Boolean(
        $pagination.indexData[$pagination.index + 1],
      );

      return {
        ...$pagination,
        visibleItems,
        indexStart,
        indexEnd,
        hasNextIndexData,
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
      indexData: { ..._store.indexData },
      hasNext: Boolean(nextToken),
      updating: false,
      loading: false,
    };
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
      index: _store.index > 0 ? _store.index - 1 : 0,
    };

    if (store.index === 0) {
      store.hasPrevious = false;
    }

    return store;
  };

  const setNextRow = (_store: PaginationItems) => {
    const store = { ..._store };
    const indexLength = store.indexData[store.index]?.items?.length ?? 0;

    if (store.activeIndex < indexLength - 1) {
      store.activeIndex = store.activeIndex + 1;
    }

    return store;
  };

  const setPreviousRow = (_store: PaginationItems) => {
    const store = { ..._store };
    const activeIndex = store.activeIndex >= 1 ? store.activeIndex - 1 : 0;

    store.activeIndex = activeIndex;

    return store;
  };

  const setActiveIndex = (_store: PaginationItems, activeIndex: number) => {
    return { ..._store, activeIndex };
  };

  const resetPageSize = (_store: PaginationItems) => {
    return {
      ..._store,
      index: 0,
      indexData: {},
      updating: true,
    };
  };

  return {
    subscribe,
    nextPageWithItems: (token: string, items: any[]) =>
      update((store) => setNextPageWithItems(token, items, store)),
    nextPage: () => update((store) => setNextPage(store)),
    previousPage: () => update((store) => setPreviousPage(store)),
    setUpdating: () => update((store) => ({ ...store, updating: true })),
    reset: () => set(defaultStore),
    resetPageSize: () => update((store) => resetPageSize(store)),
    nextRow: () => update((store) => setNextRow(store)),
    previousRow: () => update((store) => setPreviousRow(store)),
    setActiveIndex: (activeIndex: number) =>
      update((store) => setActiveIndex(store, activeIndex)),
  };
}
