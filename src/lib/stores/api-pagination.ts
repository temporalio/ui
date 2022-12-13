import { derived, writable } from 'svelte/store';
import { page } from '$app/stores';
import { perPageFromSearchParameter, defaultItemsPerPage } from './pagination';

import type { Readable } from 'svelte/store';

type PaginationMethods = {
  nextPageWithItems: (t: string | Uint8Array, items: any[]) => void;
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
  nextPageSize: number;
  indexData: Record<
    number,
    { nextToken: string; start: number; end: number; items: any[] }
  >;
  activeRow: number;
};

const initialStore: PaginationItems = {
  key: 'per-page',
  loading: true,
  updating: true,
  hasNext: true,
  hasPrevious: false,
  index: 0,
  pageSize: defaultItemsPerPage,
  nextPageSize: defaultItemsPerPage,
  indexData: {},
  activeRow: 0,
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
      return {
        ...$pagination,
        pageSize: $pageSize,
      };
    },
  );

  const setNextPageWithItems = (
    nextToken: string,
    items: any[],
    store: PaginationItems,
  ) => {
    const _store = { ...store };
    _store.hasNext = Boolean(nextToken);
    _store.updating = false;
    _store.loading = false;

    // Return early if page does not have any items (this can happen when the page size equals the number of items)
    if (!items.length) return { ..._store, hasNext: false };

    _store.indexData = { ...store.indexData };
    // _store.activeRow = 0;

    if (!store.indexData[store.index]) {
      _store.indexData[store.index] = {
        nextToken,
        start: 1,
        end: items.length,
        items,
      };
      _store.hasPrevious = false;
    } else {
      _store.index = store.index + 1;
      _store.indexData[_store.index] = {
        nextToken,
        start: _store.indexData[store.index].end + 1,
        end: _store.indexData[store.index].end + items.length,
        items,
      };
      _store.hasPrevious = true;
    }

    return _store;
  };

  const setNextPage = (store: PaginationItems) => {
    const _store = { ...store };
    _store.hasPrevious = true;
    _store.updating = false;
    _store.loading = false;
    _store.index = store.index + 1;

    if (!_store.indexData[_store.index]?.nextToken) {
      _store.hasNext = false;
    }

    return _store;
  };

  const setPreviousPage = (store: PaginationItems) => {
    const _store = { ...store };
    _store.hasNext = true;
    _store.updating = false;
    _store.loading = false;
    _store.index = store.index - 1;

    if (_store.index === 0) {
      _store.hasPrevious = false;
    }

    return _store;
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
    reset: () => set(initialStore),
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

// type PaginationMethods = {
//   nextPage: () => void;
//   previousPage: () => void;
//   setNextPageToken: (t: string, items: any[]) => void;
//   setNextPage: () => void;
//   setUpdating: () => void;
//   reset: () => void;
//   resetPageSize: () => void;
//   nextRow: () => void;
//   previousRow: () => void;
// };

// type PaginationItems = {
//   key: string;
//   index: number;
//   nextIndex: number;
//   pageSize: number;
//   initialItem: any;
//   loading: boolean;
//   updating: boolean;
//   indexData: Record<number, { nextToken: string, start: number, end: number, items: any[] }>;
//   hasNext: boolean;
//   hasPrevious: boolean;
//   activeRow: number;
// };

// const initialStore: PaginationItems = {
//   key: 'per-page',
//   index: 0,
//   nextIndex: 0,
//   pageSize: defaultItemsPerPage,
//   initialItem: null,
//   loading: true,
//   updating: true,
//   indexData: {},
//   hasNext: true,
//   hasPrevious: false,
//   activeRow: 0,
// };

// export type PaginationStore = PaginationMethods & Readable<PaginationItems>;

// export function createPaginationStore(): PaginationStore {
//   const paginationStore = writable(initialStore);
//   const { set, update, subscribe } = paginationStore;

//   const setNextPageToken = (
//     nextToken: string,
//     items: any[],
//     store: PaginationItems,
//   ) => {
//     const _store = { ...store };
//     _store.hasNext = Boolean(nextToken);
//     _store.updating = false;
//     _store.loading = false;

//     // Return early if page does not have any items (this can happen when the page size equals the number of items)
//     if (!items.length) return _store;

//     _store.index = store.nextIndex;
//     _store.indexData = { ...store.indexData };
//     _store.activeRow = 0;

// if (store.nextIndex === store.index) {
//   // First page
//   _store.indexData[store.nextIndex] = { nextToken, start: 1, end: items.length, items }
//   _store.hasPrevious = false;
// } else if (store.nextIndex > store.index) {
//   // Next Pages
//   _store.indexData[store.nextIndex] = { nextToken, start: _store.indexData[store.index].end + 1, end: _store.indexData[store.index].end + items.length, items }
//   _store.hasPrevious = true;
// } else if (store.nextIndex < store.index) {
//   // Previous Page
//   if (store.nextIndex === 0) {
//     _store.indexData = {};
//     _store.indexData[store.nextIndex] = { nextToken, start: 1, end: items.length, items: items }
//     _store.hasPrevious = false;
//   }
// }

//     return _store;
//   };

//   return {
//     subscribe,
//     nextPage: () =>
//       update((store) => {
//         return { ...store, nextIndex: store.index + 1 };
//       }),
//     previousPage: () =>
//       update((store) => {
//         if (store.index > 0) {
//           return { ...store, nextIndex: store.index - 1 };
//         }
//         return store;
//       }),
//     setNextPageToken: (token: string, items: any[]) =>
//       update((store) => {
//         return {
//           ...setNextPageToken(token, items, store),
//         };
//       }),
//     setNextPage: () =>
//       update((store) => {
//         return { ...store, index: store.nextIndex };
//       }),
//     setUpdating: () =>
//       update((store) => {
//         return { ...store, updating: true };
//       }),
//     reset: () => set(initialStore),
//     resetPageSize: () =>
//       update((store) => {
// return { ...store, index: 0, nextIndex: 0, indexData: {}, updating: true };
//       }),
//     nextRow: () =>
//       update((store) => {
//         return { ...store, activeRow: store.activeRow + 1 };
//       }),
//     previousRow: () =>
//       update((store) => {
//         return { ...store, activeRow: store.activeRow - 1 };
//       }),
//   };
// }
