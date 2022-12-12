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
  nextRow: () => void;
  previousRow: () => void;
};

type PaginationItems = {
  key: string;
  index: number;
  nextIndex: number;
  pageSize: number;
  nextPageSize: number;
  currentPageNumber: number;
  endingPageNumber: number;
  items: any[];
  indexData: Record<number, { nextToken: string, start: number, end: number, items: any[] }>;
  loading: boolean;
  updating: boolean;
  indexTokens: Record<number, string>;
  hasNext: boolean;
  hasPrevious: boolean;
  activeRow: number;
};

const initialStore: PaginationItems = {
  key: 'per-page',
  index: 0,
  nextIndex: 0,
  pageSize: defaultItemsPerPage,
  nextPageSize: defaultItemsPerPage,
  currentPageNumber: 1,
  endingPageNumber: defaultItemsPerPage,
  items: [],
  indexData: {},
  loading: true,
  updating: true,
  indexTokens: {},
  hasNext: true,
  hasPrevious: false,
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
    _store.hasNext = Boolean(nextToken);
    _store.updating = false;
    _store.loading = false;

    // Return early if page does not have any items (this can happen when the page size equals the number of items)
    if (!items.length) return _store;

    _store.index = store.nextIndex;
    _store.indexData = { ...store.indexData };
    // _store.activeRow = 0;

    if (store.nextIndex === store.index) {
      // First page
      _store.indexData[store.nextIndex] = { nextToken, start: 1, end: items.length, items }
      _store.hasPrevious = false;
    } else if (store.nextIndex > store.index) {
      // Next Pages
      _store.indexData[store.nextIndex] = { nextToken, start: _store.indexData[store.index].end + 1, end: _store.indexData[store.index].end + items.length, items }
      _store.hasPrevious = true;
    } else if (store.nextIndex < store.index) {
      // Previous Page
      if (store.nextIndex === 0) {
        _store.indexData = {};
        _store.indexData[store.nextIndex] = { nextToken, start: 1, end: items.length, items: items }
        _store.hasPrevious = false;
      }
    }

    // if (store.nextIndex === store.index) {
    //   // First page
    //   _store.indexTokens[store.nextIndex + 1] = nextToken;
    //   _store.hasPrevious = false;
    // } else if (store.nextIndex > store.index) {
    //   // Next Page
    //   _store.indexTokens[store.nextIndex + 1] = nextToken;
    //   _store.hasPrevious = true;
    // } else if (store.nextIndex < store.index) {
    //   // Previous Page
    //   if (store.nextIndex === 0) {
    //     _store.indexTokens = {};
    //     _store.indexTokens[store.nextIndex + 1] = nextToken;
    //     _store.hasPrevious = false;
    //   }
    // }

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
        return { ...store, index: 0, nextIndex: 0, indexData: {}, updating: true };
      }),
    nextRow: () =>
      update((store) => {
        // Add until at the bottom
        return { ...store, activeRow: store.activeRow < store.items.length - 1 ? store.activeRow + 1 : store.activeRow };
      }),
    previousRow: () =>
      update((store) => {
        // Subtract until at the top
        return { ...store, activeRow: store.activeRow > 1 ? store.activeRow - 1 : 0 };
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
