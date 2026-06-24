import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  NEWS_FEED_AUTO_FETCH_INTERVAL_MS,
  NEWS_FEED_STORAGE_KEYS,
} from '$lib/utilities/news-feed';

import { createNewsFeedStore } from './news-feed';

const createStorage = () => {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    values,
  };
};

describe('createNewsFeedStore', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('waits for the automatic fetch interval after using mock data', async () => {
    vi.useFakeTimers();
    let currentTime = 1000;
    const request = vi.fn();
    const storage = createStorage();

    const newsFeed = createNewsFeedStore({
      clusterId: '75d9c0b6-577f-42d4-a049-9f6e47e97c46',
      now: () => currentTime,
      request,
      storage,
    });

    await newsFeed.refresh();

    expect(request).not.toHaveBeenCalled();
    expect(storage.values.get(NEWS_FEED_STORAGE_KEYS.lastFetched)).toBe(
      String(currentTime),
    );

    await vi.advanceTimersByTimeAsync(0);

    expect(storage.values.get(NEWS_FEED_STORAGE_KEYS.lastFetched)).toBe('1000');

    currentTime += NEWS_FEED_AUTO_FETCH_INTERVAL_MS;
    await vi.advanceTimersByTimeAsync(NEWS_FEED_AUTO_FETCH_INTERVAL_MS);

    expect(request).not.toHaveBeenCalled();
    expect(storage.values.get(NEWS_FEED_STORAGE_KEYS.lastFetched)).toBe(
      String(currentTime),
    );

    newsFeed.destroy();
  });

  it('does not update storage when already marked seen', () => {
    const storage = createStorage();
    const cache = {
      fetchedAt: 1782239271000,
      items: [],
      serverTime: '2026-06-23T19:27:51Z',
    };

    storage.setItem(NEWS_FEED_STORAGE_KEYS.cache, JSON.stringify(cache));
    storage.setItem(
      NEWS_FEED_STORAGE_KEYS.lastSeenServerTime,
      cache.serverTime,
    );

    const setItem = vi.spyOn(storage, 'setItem');
    const newsFeed = createNewsFeedStore({
      clusterId: '75d9c0b6-577f-42d4-a049-9f6e47e97c46',
      storage,
    });

    newsFeed.markSeen();

    expect(setItem).not.toHaveBeenCalled();
  });
});
