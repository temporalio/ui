/* eslint-disable @typescript-eslint/no-explicit-any */
import { get } from 'svelte/store';

import { describe, expect, it } from 'vitest';

import { createPaginationStore, getInitialPageSize } from './api-pagination';
import { options } from './pagination';

const items = new Array(50).fill(null).map((_, i) => i);

describe('createPaginationStore with default pageSizeOptions', () => {
  it('should set correct getInitialPageSize with default options', () => {
    const pageSize = getInitialPageSize(options);
    expect(pageSize).toBe(100);
  });

  it('should set default values', () => {
    const store = createPaginationStore();

    const {
      key,
      loading,
      updating,
      index,
      hasNextIndexData,
      indexStart,
      indexEnd,
      activeIndex,
      indexData,
      pageSize,
      previousPageSize,
      hasNext,
      hasPrevious,
    } = get(store);

    expect(key).toBe('per-page');
    expect(loading).toBe(true);
    expect(updating).toBe(false);
    expect(index).toBe(0);
    expect(hasNextIndexData).toBe(false);
    expect(indexStart).toBe(0);
    expect(indexEnd).toBe(0);
    expect(indexData).toStrictEqual({});
    expect(pageSize).toBe(100);
    expect(previousPageSize).toBe(100);
    expect(activeIndex).toBe(0);
    expect(hasPrevious).toBe(false);
    expect(hasNext).toBe(false);
  });

  it('should update store correctly on first nextPageWithItems() with empty items', () => {
    const store = createPaginationStore();

    store.nextPageWithItems('', []);

    const {
      index,
      hasNextIndexData,
      indexStart,
      indexEnd,
      hasPrevious,
      indexData,
    } = get(store);
    expect(index).toBe(0);
    expect(hasNextIndexData).toBe(false);
    expect(indexStart).toBe(0);
    expect(indexEnd).toBe(0);
    expect(hasPrevious).toBe(false);
    expect(indexData).toStrictEqual({});
  });

  it('should update store correctly on first nextPageWithItems()', () => {
    const store = createPaginationStore();

    store.nextPageWithItems('token', items);

    const {
      index,
      hasNextIndexData,
      indexStart,
      indexEnd,
      hasPrevious,
      indexData,
    } = get(store);
    expect(index).toBe(0);
    expect(hasNextIndexData).toBe(false);
    expect(indexStart).toBe(1);
    expect(indexEnd).toBe(items.length);
    expect(hasPrevious).toBe(false);
    expect(indexData).toStrictEqual({
      0: { nextToken: 'token', start: 1, end: items.length, items },
    });
  });

  it('should update store correctly on multiple nextPageWithItems()', () => {
    const store = createPaginationStore();

    store.nextPageWithItems('token1', items);
    store.nextPageWithItems('token2', items);

    const {
      index,
      hasNextIndexData,
      indexStart,
      indexEnd,
      hasPrevious,
      indexData,
    } = get(store);
    expect(index).toBe(1);
    expect(hasNextIndexData).toBe(false);
    expect(indexStart).toBe(items.length + 1);
    expect(indexEnd).toBe(items.length + items.length);
    expect(hasPrevious).toBe(true);
    expect(indexData[index - 1]).toStrictEqual({
      nextToken: 'token1',
      start: 1,
      end: items.length,
      items,
    });

    expect(indexData[index]).toStrictEqual({
      nextToken: 'token2',
      start: items.length + 1,
      end: items.length * 2,
      items,
    });
  });

  it('should update store correctly on multiple nextPageWithItems() and an empty item', () => {
    const store = createPaginationStore();

    store.nextPageWithItems('token1', items);
    store.nextPageWithItems('token2', items);
    store.nextPageWithItems('', []);

    const {
      index,
      hasNextIndexData,
      indexStart,
      indexEnd,
      hasPrevious,
      indexData,
    } = get(store);
    expect(index).toBe(1);
    expect(hasNextIndexData).toBe(false);
    expect(indexStart).toBe(items.length + 1);
    expect(indexEnd).toBe(items.length + items.length);
    expect(hasPrevious).toBe(true);
    expect(indexData[index - 1]).toStrictEqual({
      nextToken: 'token1',
      start: 1,
      end: items.length,
      items,
    });

    expect(indexData[index]).toStrictEqual({
      nextToken: 'token2',
      start: items.length + 1,
      end: items.length * 2,
      items,
    });
  });

  it('should update store correctly on nextPage()', () => {
    const store = createPaginationStore();

    store.nextPage();

    const { index, hasPrevious, hasNext, indexData } = get(store);
    expect(index).toBe(1);
    expect(hasPrevious).toBe(true);
    expect(hasNext).toBe(false);
    expect(indexData).toStrictEqual({});
  });

  it('should update store correctly on multiple nextPage()', () => {
    const store = createPaginationStore();

    store.nextPage();
    store.nextPage();

    const { index, hasPrevious, hasNext, indexData } = get(store);
    expect(index).toBe(2);
    expect(hasPrevious).toBe(true);
    expect(hasNext).toBe(false);
    expect(indexData).toStrictEqual({});
  });

  it('should update store correctly on previousPage()', () => {
    const store = createPaginationStore();

    store.nextPage();
    store.previousPage();

    const { index, hasPrevious, indexData } = get(store);
    expect(index).toBe(0);
    expect(hasPrevious).toBe(false);
    expect(indexData).toStrictEqual({});
  });

  it('should update store correctly on previousPage() when at 0 index', () => {
    const store = createPaginationStore();

    store.nextPage();
    store.previousPage();
    store.previousPage();

    const { index, hasPrevious, indexData } = get(store);
    expect(index).toBe(0);
    expect(hasPrevious).toBe(false);
    expect(indexData).toStrictEqual({});
  });

  it('should update store correctly on multiple nextPageWithItems() and previousPage', () => {
    const store = createPaginationStore();

    store.nextPageWithItems('token1', items);
    store.nextPageWithItems('token2', items);
    store.nextPageWithItems('token3', items);
    store.previousPage();

    const {
      index,
      hasNextIndexData,
      indexStart,
      indexEnd,
      hasPrevious,
      hasNext,
      indexData,
    } = get(store);
    expect(index).toBe(1);
    expect(hasNextIndexData).toBe(true);
    expect(indexStart).toBe(items.length + 1);
    expect(indexEnd).toBe(items.length * 2);
    expect(hasPrevious).toBe(true);
    expect(hasNext).toBe(true);
    expect(indexData[index - 1]).toStrictEqual({
      nextToken: 'token1',
      start: 1,
      end: items.length,
      items,
    });
    expect(indexData[index]).toStrictEqual({
      nextToken: 'token2',
      start: items.length + 1,
      end: items.length * 2,
      items,
    });
    expect(indexData[index + 1]).toStrictEqual({
      nextToken: 'token3',
      start: items.length * 2 + 1,
      end: items.length * 3,
      items,
    });
  });

  it('should update store correctly on multiple nextPageWithItems() and no nextPageToken and previousPage() / nextPage() to last page', () => {
    const store = createPaginationStore();

    store.nextPageWithItems('token1', items);
    store.nextPageWithItems('token2', items);
    store.nextPageWithItems('', items);
    store.previousPage();
    store.previousPage();
    store.nextPage();
    store.nextPage();

    const {
      index,
      hasNextIndexData,
      indexStart,
      indexEnd,
      hasPrevious,
      hasNext,
      indexData,
    } = get(store);
    expect(index).toBe(2);
    expect(hasNextIndexData).toBe(false);
    expect(indexStart).toBe(items.length * 2 + 1);
    expect(indexEnd).toBe(items.length * 3);
    expect(hasPrevious).toBe(true);
    expect(hasNext).toBe(false);

    expect(indexData[index - 2]).toStrictEqual({
      nextToken: 'token1',
      start: 1,
      end: items.length,
      items,
    });
    expect(indexData[index - 1]).toStrictEqual({
      nextToken: 'token2',
      start: items.length + 1,
      end: items.length * 2,
      items,
    });
    expect(indexData[index]).toStrictEqual({
      nextToken: '',
      start: items.length * 2 + 1,
      end: items.length * 3,
      items,
    });
  });

  it('should update store correctly on setNextRow() with no items', () => {
    const store = createPaginationStore();

    store.nextRow();

    const { activeIndex } = get(store);
    expect(activeIndex).toBe(0);
  });

  it('should update store correctly on multiple setNextRow()', () => {
    const store = createPaginationStore();

    store.nextPageWithItems('', items);

    store.nextRow();
    store.nextRow();
    store.nextRow();
    store.nextRow();

    const { activeIndex } = get(store);
    expect(activeIndex).toBe(4);
  });

  it('should update store correctly on multiple setNextRow() when reaching the end of the items length', () => {
    const store = createPaginationStore();

    store.nextPageWithItems('', ['a', 'b', 'c']);

    store.nextRow();
    store.nextRow();
    store.nextRow();
    store.nextRow();

    const { activeIndex } = get(store);
    expect(activeIndex).toBe(2);
  });

  it('should update store correctly on setPreviousRow() with no items', () => {
    const store = createPaginationStore();

    store.previousRow();

    const { activeIndex } = get(store);
    expect(activeIndex).toBe(0);
  });

  it('should update store correctly on multiple setPreviousRow()', () => {
    const store = createPaginationStore();

    store.nextPageWithItems('', items);

    store.nextRow();
    store.nextRow();
    store.nextRow();
    store.nextRow();
    store.previousRow();
    store.previousRow();

    const { activeIndex } = get(store);
    expect(activeIndex).toBe(2);
  });

  it('should update store correctly on multiple setNextPrevious() when reaching the start of the items length', () => {
    const store = createPaginationStore();

    store.nextPageWithItems('', ['a', 'b', 'c']);

    store.nextRow();
    store.nextRow();
    store.previousRow();
    store.previousRow();
    store.previousRow();
    store.previousRow();

    const { activeIndex } = get(store);
    expect(activeIndex).toBe(0);
  });

  it('should update store correctly on setUpdating()', () => {
    const store = createPaginationStore();

    store.setUpdating();

    const { updating } = get(store);
    expect(updating).toBe(true);
  });

  it('should update store correctly on setUpdating() and getNextPageItems()', () => {
    const store = createPaginationStore();

    store.setUpdating();
    store.nextPageWithItems('', items);

    const { updating } = get(store);
    expect(updating).toBe(false);
  });

  it('should update store correctly on setActiveIndex()', () => {
    const store = createPaginationStore();

    store.nextPageWithItems('', items);

    store.nextRow();
    store.nextRow();
    store.setActiveIndex(35);

    const { activeIndex } = get(store);
    expect(activeIndex).toBe(35);
  });

  it('should update store correctly on reset()', () => {
    const store = createPaginationStore();

    store.nextPageWithItems('token1', items);
    store.nextPageWithItems('token2', items);
    store.nextPageWithItems('token3', items);

    store.nextRow();
    store.nextRow();
    store.nextRow();
    store.nextRow();

    store.reset();

    const {
      key,
      loading,
      updating,
      index,
      hasNextIndexData,
      indexStart,
      indexEnd,
      activeIndex,
      indexData,
      pageSize,
      previousPageSize,
      hasNext,
      hasPrevious,
    } = get(store);

    expect(key).toBe('per-page');
    expect(loading).toBe(true);
    expect(updating).toBe(false);
    expect(index).toBe(0);
    expect(hasNextIndexData).toBe(false);
    expect(indexStart).toBe(0);
    expect(indexEnd).toBe(0);
    expect(indexData).toStrictEqual({});
    expect(pageSize).toBe(100);
    expect(previousPageSize).toBe(100);
    expect(activeIndex).toBe(0);
    expect(hasPrevious).toBe(false);
    expect(hasNext).toBe(false);
  });
});

describe('createPaginationStore with custom pageSizeOptions', () => {
  it('should set correct getInitialPageSize', () => {
    const options = ['10', '20', '50'];
    const pageSize = getInitialPageSize(options);
    expect(pageSize).toBe(10);
  });

  it('should set fallback to default pageSize with no options', () => {
    const options = [];
    const pageSize = getInitialPageSize(options);
    expect(pageSize).toBe(100);
  });

  it('should set fallback to default pageSize with no options', () => {
    const options = ['a', 'b', 'c'];
    const pageSize = getInitialPageSize(options);
    expect(pageSize).toBe(100);
  });

  it('should set correct getInitialPageSize with defaultPageSize', () => {
    const options = [10, 25, 50];
    const defaultPageSize = 25;
    const pageSize = getInitialPageSize(options, defaultPageSize);
    expect(pageSize).toBe(25);
  });

  it('should set correct getInitialPageSize with defaultPageSize that does not match options', () => {
    const options = [10, 25, 50];
    const defaultPageSize = 20;
    const pageSize = getInitialPageSize(options, defaultPageSize);
    expect(pageSize).toBe(20);
  });

  it('should set fallback getInitialPageSize with bad defaultPageSize', () => {
    const options = [10, 25, 50];
    const defaultPageSize = 'cats';
    const pageSize = getInitialPageSize(options, defaultPageSize);
    expect(pageSize).toBe(10);
  });

  it('should set default values', () => {
    const store = createPaginationStore(['10', '20', '50']);

    const {
      key,
      loading,
      updating,
      index,
      hasNextIndexData,
      indexStart,
      indexEnd,
      indexData,
      pageSize,
      previousPageSize,
      activeIndex,
      hasNext,
      hasPrevious,
    } = get(store);

    expect(key).toBe('per-page');
    expect(loading).toBe(true);
    expect(updating).toBe(false);
    expect(index).toBe(0);
    expect(hasNextIndexData).toBe(false);
    expect(indexStart).toBe(0);
    expect(indexEnd).toBe(0);
    expect(indexData).toStrictEqual({});
    expect(pageSize).toBe(10);
    expect(previousPageSize).toBe(10);
    expect(activeIndex).toBe(0);
    expect(hasPrevious).toBe(false);
    expect(hasNext).toBe(false);
  });

  it('should resetPageSize', () => {
    const store = createPaginationStore(['10', '20', '50']);
    store.resetPageSize(50);

    const {
      key,
      loading,
      updating,
      index,
      hasNextIndexData,
      indexStart,
      indexEnd,
      indexData,
      pageSize,
      previousPageSize,
      activeIndex,
      hasNext,
      hasPrevious,
    } = get(store);

    expect(key).toBe('per-page');
    expect(loading).toBe(true);
    expect(updating).toBe(false);
    expect(index).toBe(0);
    expect(hasNextIndexData).toBe(false);
    expect(indexStart).toBe(0);
    expect(indexEnd).toBe(0);
    expect(indexData).toStrictEqual({});
    expect(pageSize).toBe(50);
    expect(previousPageSize).toBe(50);
    expect(activeIndex).toBe(0);
    expect(hasPrevious).toBe(false);
    expect(hasNext).toBe(false);
  });
});
