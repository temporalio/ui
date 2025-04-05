import type { Readable } from 'svelte/store';
import { derived, writable } from 'svelte/store';

import { page } from '$app/stores';

import {
  defaultItemsPerPage,
  options,
  perPageFromSearchParameter,
  perPageKey,
} from './pagination';

type PaginationMethods<T> = {
  nextPageWithItems: (t: string, items: T[]) => void;
  nextPage: () => void;
  previousPage: () => void;
  setUpdating: () => void;
  reset: () => void;
  resetPageSize: (pageSize: number) => void;
  nextRow: () => void;
  previousRow: () => void;
  setActiveIndex: (activeIndex: number) => void;
};

type PaginationItems<T> = {
  key: string;
  loading: boolean;
  updating: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  index: number;
  previousPageSize: number;
  pageSize: number;
  indexData: Record<
    number,
    { nextToken: string; start: number; end: number; items: T[] }
  >;
  visibleItems: T[];
  hasNextIndexData: boolean;
  indexStart: number;
  indexEnd: number;
  activeIndex: number;
};

const defaultStore = {
  key: perPageKey,
  loading: true,
  updating: false,
  hasNext: false,
  hasPrevious: false,
  index: 0,
  previousPageSize: defaultItemsPerPage,
  pageSize: defaultItemsPerPage,
  indexData: {},
  visibleItems: [],
  hasNextIndexData: false,
  indexStart: 0,
  indexEnd: 0,
  activeIndex: 0,
};

export type PaginationStore<T> = PaginationMethods<T> &
  Readable<PaginationItems<T>>;

const setFirstOption = (options: string[] | number[]) => {
  const defaultOption = options[0];
  if (!defaultOption) return defaultItemsPerPage;
  const optionAsInt = parseInt(defaultOption.toString());
  if (isNaN(optionAsInt)) return defaultItemsPerPage;
  return optionAsInt;
};

export const getInitialPageSize = (
  options: string[] | number[],
  defaultPageSize: string | number | undefined = undefined,
) => {
  if (defaultPageSize) {
    const optionAsInt = parseInt(defaultPageSize.toString());
    if (isNaN(optionAsInt)) return setFirstOption(options);
    return optionAsInt;
  } else {
    return setFirstOption(options);
  }
};

export function createPaginationStore<T>(
  pageSizeOptions: string[] | number[] = options,
  defaultPageSize: string | number | undefined = undefined,
): PaginationStore<T> {
  const initialPageSize = getInitialPageSize(pageSizeOptions, defaultPageSize);
  const paginationStore = writable({
    ...defaultStore,
    previousPageSize: initialPageSize,
    pageSize: initialPageSize,
  });
  const { set, update } = paginationStore;

  const pageSize = derived([page], ([$page]) => {
    const perPage = $page.url.searchParams.get(perPageKey);
    return perPage ? perPageFromSearchParameter(perPage) : undefined;
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
        pageSize: $pageSize ?? $pagination.pageSize,
      };
    },
  );

  const setNextPageWithItems = <T>(
    nextToken: string,
    items: T[],
    _store: PaginationItems<T>,
  ) => {
    const currentIndex = _store.index;
    const store = {
      ..._store,
      indexData: { ..._store.indexData },
      hasNext: Boolean(nextToken),
      updating: false,
      loading: false,
    };

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

  const setNextPage = <T>(_store: PaginationItems<T>) => {
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

  const setPreviousPage = <T>(_store: PaginationItems<T>) => {
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

  const setNextRow = <T>(_store: PaginationItems<T>) => {
    const store = { ..._store };
    const indexLength = store.indexData[store.index]?.items?.length ?? 0;

    if (store.activeIndex < indexLength - 1) {
      store.activeIndex = store.activeIndex + 1;
    }

    return store;
  };

  const setPreviousRow = <T>(_store: PaginationItems<T>) => {
    const store = { ..._store };
    const activeIndex = store.activeIndex >= 1 ? store.activeIndex - 1 : 0;

    store.activeIndex = activeIndex;

    return store;
  };

  const setActiveIndex = <T>(
    _store: PaginationItems<T>,
    activeIndex: number,
  ) => {
    return { ..._store, activeIndex };
  };

  const resetPageSize = <T>(_store: PaginationItems<T>, pageSize: number) => {
    return {
      ..._store,
      pageSize,
      previousPageSize: pageSize,
      index: 0,
      indexData: {},
      loading: true,
      updating: false,
    };
  };

  return {
    subscribe,
    nextPageWithItems: (token: string, items: T[]) =>
      update((store) => setNextPageWithItems(token, items, store)),
    nextPage: () => update((store) => setNextPage(store)),
    previousPage: () => update((store) => setPreviousPage(store)),
    setUpdating: () => update((store) => ({ ...store, updating: true })),
    reset: () => set(defaultStore),
    resetPageSize: (pageSize) =>
      update((store) => resetPageSize(store, pageSize)),
    nextRow: () => update((store) => setNextRow(store)),
    previousRow: () => update((store) => setPreviousRow(store)),
    setActiveIndex: (activeIndex: number) =>
      update((store) => setActiveIndex(store, activeIndex)),
  };
}
