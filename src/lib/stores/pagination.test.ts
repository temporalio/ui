import { get } from 'svelte/store';
import {
  getIndex,
  getPageForIndex,
  getStartingIndexForPage,
  getTotalPages,
  getValidPage,
  pagination,
} from './pagination';

const oneHundredResolutions = new Array(100).fill(null).map((_, i) => i);

describe(pagination, () => {
  it('should have a pageSize', () => {
    const store = pagination(oneHundredResolutions, 50);
    const { pageSize } = get(store);

    expect(pageSize).toBe(50);
  });

  it('should be able to adjust the pageSize', () => {
    const store = pagination(oneHundredResolutions, 50);
    store.adjustPageSize(75);
    const { pageSize } = get(store);

    expect(pageSize).toBe(75);
  });

  it('should set hasPrevious to false by default', () => {
    const store = pagination(oneHundredResolutions, 50);
    const { hasPrevious } = get(store);

    expect(hasPrevious).toBe(false);
  });

  it('should set hasPrevious if it is not at the beginning', () => {
    const store = pagination(oneHundredResolutions, 25);
    store.next();
    const { hasPrevious } = get(store);

    expect(hasPrevious).toBe(true);
  });

  it('should set hasNext to true if the pageSize is less than the items in the array', () => {
    const store = pagination(oneHundredResolutions, 50);
    const { hasNext } = get(store);

    expect(hasNext).toBe(true);
  });

  it('should set hasNext to false if there are no more items', () => {
    const store = pagination(oneHundredResolutions, 75);
    store.next();
    const { hasNext } = get(store);

    expect(hasNext).toBe(false);
  });

  it('should set the startingIndex to zero by default', () => {
    const store = pagination(oneHundredResolutions, 75);
    const { startingIndex } = get(store);

    expect(startingIndex).toBe(0);
  });

  it('should set the endingIndex to pageSize by default', () => {
    const store = pagination(oneHundredResolutions, 5);
    const { endingIndex } = get(store);

    expect(endingIndex).toBe(4);
  });

  it('should increment the startingIndex by the pageSize', () => {
    const store = pagination(oneHundredResolutions, 5);
    store.next();
    const { startingIndex } = get(store);

    expect(startingIndex).toBe(5);
  });

  it('should increment the endingIndex by the pageSize', () => {
    const store = pagination(oneHundredResolutions, 5);
    store.next();
    const { endingIndex } = get(store);

    expect(endingIndex).toBe(9);
  });

  it('should decrement the startingIndex by the page size', () => {
    const store = pagination(oneHundredResolutions, 5);

    store.next();
    store.next();
    store.previous();

    const { startingIndex } = get(store);

    expect(startingIndex).toBe(5);
  });

  it('should decrement the endingIndex by the page size', () => {
    const store = pagination(oneHundredResolutions, 5);

    store.next();
    store.next();
    store.previous();

    const { endingIndex } = get(store);

    expect(endingIndex).toBe(9);
  });

  it('should not decrement the starting position if at the beginning', () => {
    const store = pagination(oneHundredResolutions, 5);

    store.previous();

    const { startingIndex } = get(store);

    expect(startingIndex).toBe(0);
  });

  it('should not increment the starting position if at end', () => {
    const store = pagination(oneHundredResolutions, 200);

    store.next();

    const { startingIndex } = get(store);

    expect(startingIndex).toBe(0);
  });

  it('should show the first page worth of items by default', () => {
    const store = pagination(oneHundredResolutions, 5);

    const { items: result } = get(store);

    expect(result).toEqual([0, 1, 2, 3, 4]);
  });

  it('should show the second page of items once incremented', () => {
    const store = pagination(oneHundredResolutions, 5);

    store.next();

    const { items: result } = get(store);

    expect(result).toEqual([5, 6, 7, 8, 9]);
  });

  it('should default to a startingPage of 1', () => {
    const store = pagination(oneHundredResolutions, 5);

    const { currentPage } = get(store);

    expect(currentPage).toBe(1);
  });

  it('should increment the starting page when incremented', () => {
    const store = pagination(oneHundredResolutions, 5);

    store.next();

    const { currentPage } = get(store);

    expect(currentPage).toBe(2);
  });

  it('should have the correct number of total pages', () => {
    const store = pagination(oneHundredResolutions, 5);

    const { totalPages } = get(store);

    expect(totalPages).toBe(20);
  });

  it('should have the correct page when jumping to a page', () => {
    const store = pagination(oneHundredResolutions, 5);

    store.jumpToPage(10);

    const { currentPage } = get(store);

    expect(currentPage).toBe(10);
  });

  it('should have the correct starting index when jumping to a page', () => {
    const store = pagination(oneHundredResolutions, 5);

    store.jumpToPage(2);

    const { startingIndex } = get(store);

    expect(startingIndex).toBe(5);
  });

  it('should default to zero when jumping to a negative number', () => {
    const store = pagination(oneHundredResolutions, 5);

    store.jumpToPage(-20);

    const { currentPage } = get(store);

    expect(currentPage).toBe(1);
  });

  it('should default to the last page when jumping to a page out of bounds', () => {
    const store = pagination(oneHundredResolutions, 5);

    store.jumpToPage(200);

    const { currentPage } = get(store);

    expect(currentPage).toBe(20);
  });

  it('should allow you to find the index of an item', () => {
    const store = pagination(oneHundredResolutions, 5);

    const index = store.findIndex((i) => i === 5);

    expect(index).toBe(5);
  });

  it('should allow you to find the page of an item', () => {
    const store = pagination(oneHundredResolutions, 5);

    const page = store.findPage((i) => i === 6);

    expect(page).toBe(2);
  });

  it('should be able to jump to a page for a given index', () => {
    const store = pagination(oneHundredResolutions, 5);

    store.jumpToIndex(6);

    const { currentPage } = get(store);

    expect(currentPage).toBe(2);
  });

  it('should allow you set a custom starting index', () => {
    const store = pagination(oneHundredResolutions, 5, 5);

    const { startingIndex } = get(store);

    expect(startingIndex).toBe(5);
  });

  it('should fall back to the nearest page', () => {
    const store = pagination(oneHundredResolutions, 5, 6);

    const { startingIndex } = get(store);

    expect(startingIndex).toBe(5);
  });

  it('should return first item for initialItem', () => {
    const store = pagination(oneHundredResolutions, 50);
    const { initialItem } = get(store);

    expect(initialItem).toBe(0);
  });

  it('should return first item for initialItem', () => {
    const store = pagination(oneHundredResolutions, 5, 11);
    const { initialItem } = get(store);

    expect(initialItem).toBe(0);
  });
});

describe(getPageForIndex, () => {
  it('should correctly get the page for a given index', () => {
    expect(getPageForIndex(6, 5)).toBe(2);
  });
});

describe(getTotalPages, () => {
  it('should correctly calculate the total number of pages', () => {
    expect(getTotalPages(20, oneHundredResolutions)).toBe(5);
  });
});

describe(getIndex, () => {
  it('should get the index if it is in the array', () => {
    const things = ['first', 'second', 'third'];
    expect(getIndex(2, things)).toBe(2);
  });

  it('should get the index of the last item of the last item in the array', () => {
    const things = ['first', 'second', 'third'];
    expect(getIndex(3, things)).toBe(2);
  });

  it('should return 0 if you give it an index less than 0', () => {
    const things = ['first', 'second', 'third'];
    expect(getIndex(-10, things)).toBe(0);
  });

  it('should return 0 if given NaN', () => {
    const things = ['first', 'second', 'third'];
    expect(getIndex(NaN, things)).toBe(0);
  });
});

describe(getValidPage, () => {
  it('should return 1 if given the first index of an array', () => {
    expect(getValidPage(0, 20, oneHundredResolutions)).toBe(1);
  });

  it('should return 2 if given an index from the second page', () => {
    expect(getValidPage(2, 20, oneHundredResolutions)).toBe(2);
  });

  it('should return the last page if given a page out of bounds', () => {
    expect(getValidPage(10000, 20, oneHundredResolutions)).toBe(5);
  });

  it('should return 0 if given NaN', () => {
    expect(getValidPage(NaN, 20, oneHundredResolutions)).toBe(0);
  });
});

describe(getStartingIndexForPage, () => {
  it('should return 0 for the first page', () => {
    expect(getStartingIndexForPage(1, 20, oneHundredResolutions)).toBe(0);
  });

  it('should return the first index of the second page for the something on the second page', () => {
    expect(getStartingIndexForPage(2, 20, oneHundredResolutions)).toBe(20);
  });

  it('should return the first index of the last page for the something out of bounds', () => {
    expect(getStartingIndexForPage(100, 20, oneHundredResolutions)).toBe(80);
  });

  it('should return 0 if given a negative number for the page', () => {
    expect(getStartingIndexForPage(-10, 20, oneHundredResolutions)).toBe(0);
  });

  it('should return 0 if given NaN', () => {
    expect(getStartingIndexForPage(NaN, 20, oneHundredResolutions)).toBe(0);
  });
});
