/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { createPaginationStore } from './api-pagination';

const items = new Array(50).fill(null).map((_, i) => i);

describe('createPaginationStore', () => {
  const store = createPaginationStore();

  it('should have a default pageSize', () => {
    const { pageSize } = get(store);

    expect(pageSize).toBe(100);
  });

  it('should setUpdating to true', () => {
    store.setUpdating();

    const { updating } = get(store);
    expect(updating).toBe(true);
  });

  it('should set the endingPageNumber to zero if there are no items', () => {
    const { endingPageNumber } = get(store);

    expect(endingPageNumber).toBe(0);
  });

  it('should update indexTokens and set hasPrevious to false for the first page', () => {
    store.setNextPageToken('token1', items);

    const { index, indexTokens, hasPrevious } = get(store);
    expect(index).toBe(0);
    expect(indexTokens).toEqual({
      '1': 'token1',
    });
    expect(hasPrevious).toBe(false);
  });

  it('should increment the endingPageNumber based on the number of items', () => {
    const { endingPageNumber } = get(store);

    expect(endingPageNumber).toBe(50);
  });

  it('should update the nextIndex when going to nextPage', () => {
    const { nextIndex: initialNextIndex } = get(store);
    expect(initialNextIndex).toBe(0);

    store.nextPage();

    const { nextIndex } = get(store);
    expect(nextIndex).toBe(1);
  });

  it('should update indexTokens and set hasPrevious to true for the next page', () => {
    store.setNextPageToken('token2', items);

    const { index, indexTokens, hasPrevious } = get(store);
    expect(indexTokens).toEqual({
      '1': 'token1',
      '2': 'token2',
    });
    expect(index).toBe(1);
    expect(hasPrevious).toBe(true);
  });

  it('should increment the endingPageNumber based on the page', () => {
    const { endingPageNumber } = get(store);

    expect(endingPageNumber).toBe(150);
  });

  it('should update the nextIndex when going to previousPage', () => {
    const { nextIndex: initialNextIndex } = get(store);
    expect(initialNextIndex).toBe(1);

    store.previousPage();

    const { nextIndex } = get(store);
    expect(nextIndex).toBe(0);
  });

  it('should set hasPrevious to false if the previous page is the first page', () => {
    const { nextIndex } = get(store);
    expect(nextIndex).toBe(0);

    store.setNextPageToken('token1', items);

    const { index, hasPrevious } = get(store);
    expect(index).toBe(0);
    expect(hasPrevious).toBe(false);
  });

  it('should decrement the endingPageNumber based on the page', () => {
    const { endingPageNumber } = get(store);

    expect(endingPageNumber).toBe(50);
  });

  it('should reset index and nextIndex and set updating to true with resetPageSize', () => {
    store.nextPage();
    store.setNextPageToken('token2', items);

    const {
      index: initialIndex,
      nextIndex: initialNextIndex,
      updating: initialUpdating,
    } = get(store);

    expect(initialIndex).toBe(1);
    expect(initialNextIndex).toBe(1);
    expect(initialUpdating).toBe(false);

    store.resetPageSize();

    const { index, nextIndex, updating } = get(store);

    expect(index).toBe(0);
    expect(nextIndex).toBe(0);
    expect(updating).toBe(true);
  });

  it('should reset to the initial store', () => {
    store.reset();

    const {
      index,
      nextIndex,
      pageSize,
      currentPageNumber,
      endingPageNumber,
      items,
      loading,
      updating,
      indexTokens,
      hasNext,
      hasPrevious,
    } = get(store);

    expect(index).toBe(0);
    expect(nextIndex).toBe(0);
    expect(pageSize).toBe(100);
    expect(currentPageNumber).toBe(1);
    expect(endingPageNumber).toBe(0);
    expect(items).toEqual([]);
    expect(loading).toBe(true);
    expect(updating).toBe(true);
    expect(indexTokens).toEqual({});
    expect(hasNext).toBe(true);
    expect(hasPrevious).toBe(false);
  });

  it('should set hasNext to false and not update items if next page has no items', () => {
    store.setNextPageToken('token1', items);

    const { hasNext: initialHasNext } = get(store);
    expect(initialHasNext).toBe(true);

    store.setNextPageToken('', []);

    const { hasNext, items: storeItems } = get(store);
    expect(hasNext).toBe(false);
    expect(storeItems).toEqual(items);
  });
});
