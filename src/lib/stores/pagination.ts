import { derived, writable, get } from 'svelte/store';

const options: string[] = ['100', '250', '500'];

export const perPageOptions = (perPage: number | string) => {
  const itemsPerPage = String(perPage);
  return options.includes(itemsPerPage) ? options : [perPage, ...options];
};

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

export const getNearestStartingIndex = (
  index: number,
  itemsPerPage: number,
  items: ArrayLike<unknown>,
) => {
  const page = getPageForIndex(index, itemsPerPage);
  return getStartingIndexForPage(page, itemsPerPage, items);
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
  if (index >= things.length) return true;
  if (index < 0) return true;
  return false;
};

/**
 * Creates a Svelte store for viewing pages of a larger data set.
 */
export const pagination = <T>(
  items: Readonly<T[]> = [],
  perPage: number | string = 100,
  startingIndex: string | number = 0,
) => {
  const start = getNearestStartingIndex(
    Number(startingIndex),
    Number(perPage),
    items,
  );

  const pageSize = writable(Number(perPage));
  const index = writable(start);

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

  const jumpToPage = (page: number | string) => {
    const itemsPerPage = get(pageSize);
    return index.set(
      getStartingIndexForPage(Number(page), itemsPerPage, items),
    );
  };

  const jumpToIndex = (i: number | string) => {
    const page = getPageForIndex(Number(i), get(pageSize));
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
      items: items.slice($index, $index + $pageSize),
      initialItem: items[0],
      hasPrevious: !outOfBounds($index - $pageSize, items),
      hasNext: !outOfBounds($index + $pageSize, items),
      startingIndex: $index,
      endingIndex: getIndex($index + $pageSize - 1, items),
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
