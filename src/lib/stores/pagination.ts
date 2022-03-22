import { derived, writable, get } from 'svelte/store';

export const getPageForIndex = (i: number, pageSize: number): number => {
  return Math.floor(i / pageSize) + 1;
};

export const getStartingIndexForPage = (
  page: number,
  itemsPerPage: number,
  items: ArrayLike<unknown>,
) => {
  if (isNaN(page)) return 0;

  if (page <= 1) return 0;
  if (page > getTotalPages(itemsPerPage, items))
    return items.length - itemsPerPage;

  return Math.floor(itemsPerPage * (page - 1));
};

export const getValidPage = (
  page: number,
  itemsPerPage: number,
  items: ArrayLike<unknown>,
) => {
  if (isNaN(page)) return 0;
  const lastPage = getTotalPages(itemsPerPage, items);

  if (page <= 0) return 1;
  if (page > lastPage) return lastPage;

  return page;
};

export const getTotalPages = (
  pageSize: number,
  items: ArrayLike<unknown>,
): number => {
  return Math.ceil(items.length / pageSize);
};

export const getIndex = (index: number, things: ArrayLike<unknown>): number => {
  if (isNaN(index)) return 0;
  if (index < 0) return 0;
  if (index < things.length) return index;
  return things.length - 1;
};

export const outOfBounds = (index: number, things: ArrayLike<unknown>) => {
  return index > things.length;
};

export const pagination = <T>(
  items: Readonly<T[]>,
  perPage: number | string = 25,
  key = 'items',
) => {
  const pageSize = writable(Number(perPage));
  const index = writable(0);

  const adjustPageSize = (n: number | string) => {
    pageSize.set(Number(n));
  };

  const next = () => {
    index.update((index) => {
      const nextIndex = index + get(pageSize);
      if (outOfBounds(nextIndex, items)) return index;
      return getIndex(nextIndex, items);
    });
  };

  const previous = () => {
    index.update((index) => {
      const nextStart = index - get(pageSize);
      return getIndex(nextStart, items);
    });
  };

  const jumpToPage = (page: number) => {
    const itemsPerPage = get(pageSize);
    return index.set(getStartingIndexForPage(page, itemsPerPage, items));
  };

  const jumpToIndex = (i: number) => {
    const page = getPageForIndex(i, get(pageSize));
    jumpToPage(page);
  };

  const findIndex = (fn: (item: T) => boolean): number => {
    for (let i = 0; i < items.length; i++) {
      if (fn(items[i])) return i;
    }
  };

  const findPage = (fn: (item: T) => boolean): number => {
    const i = findIndex(fn);
    return getPageForIndex(i, get(pageSize));
  };

  const { subscribe } = derived([index, pageSize], ([$index, $pageSize]) => {
    return {
      [key]: items.slice($index, $index + $pageSize),
      hasPrevious: $index - $pageSize >= 0,
      hasNext: $index + $pageSize < items.length,
      startingIndex: $index,
      endingIndex: getIndex($index + $pageSize, items),
      length: items.length,
      pageSize: $pageSize,
      currentPage: getPageForIndex($index, $pageSize),
      totalPages: getTotalPages($pageSize, items),
    };
  });

  return {
    subscribe,
    adjustPageSize,
    next,
    previous,
    jumpToPage,
    jumpToIndex,
    findIndex,
    findPage,
  };
};
