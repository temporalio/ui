import { derived, writable, get } from 'svelte/store';

export const getPageForIndex = (i: number, pageSize: number): number => {
  return Math.floor(i / pageSize) + 1;
};

export const getTotalPages = (
  numberOfItems: number,
  pageSize: number,
): number => {
  return Math.ceil(numberOfItems / pageSize);
};

export const getEndingIndex = (index: number, length: number): number => {
  if (index < length) return index;
  return length;
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
      const nextStart = index + get(pageSize);
      if (nextStart < items.length) {
        return nextStart;
      } else {
        return index;
      }
    });
  };

  const previous = () => {
    index.update((index) => {
      const nextStart = index - get(pageSize);
      if (nextStart > 0) {
        return nextStart;
      } else {
        return 0;
      }
    });
  };

  const jumpToPage = (page: number) => {
    const itemsPerPage = get(pageSize);
    const lastPage = getTotalPages(items.length, itemsPerPage);

    if (page > lastPage) return index.set(lastPage * itemsPerPage - 1);
    if (page < 0) return index.set(0);

    return index.set(page * itemsPerPage - 1);
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
      endingIndex: getEndingIndex($index + $pageSize, items.length),
      length: items.length,
      pageSize: $pageSize,
      currentPage: Math.floor($index / $pageSize) + 1,
      totalPages: Math.ceil(items.length / $pageSize),
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
