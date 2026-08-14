import { afterEach, describe, expect, it, vi } from 'vitest';

import { MOCK_NEWS_FEED_RESPONSE } from '$lib/services/news-feed-service';
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
  const response = () => ({
    ok: true,
    json: () => Promise.resolve(MOCK_NEWS_FEED_RESPONSE),
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('waits for the automatic fetch interval after loading the feed', async () => {
    vi.useFakeTimers();
    let currentTime = 1000;
    const request = vi.fn().mockResolvedValue(response());
    const storage = createStorage();

    const newsFeed = createNewsFeedStore({
      clusterId: '75d9c0b6-577f-42d4-a049-9f6e47e97c46',
      now: () => currentTime,
      request,
      source: 'web-ui',
      storage,
    });

    await newsFeed.refresh();

    expect(request).toHaveBeenCalledTimes(1);
    expect(storage.values.get(NEWS_FEED_STORAGE_KEYS.lastFetched)).toBe(
      String(currentTime),
    );
    expect(
      JSON.parse(storage.values.get(NEWS_FEED_STORAGE_KEYS.cache)!),
    ).toEqual({
      fetchedAt: currentTime,
      items: MOCK_NEWS_FEED_RESPONSE.items,
      serverTime: MOCK_NEWS_FEED_RESPONSE.server_time,
    });

    await vi.advanceTimersByTimeAsync(0);

    expect(request).toHaveBeenCalledTimes(1);
    expect(storage.values.get(NEWS_FEED_STORAGE_KEYS.lastFetched)).toBe('1000');

    currentTime += NEWS_FEED_AUTO_FETCH_INTERVAL_MS;
    await vi.advanceTimersByTimeAsync(NEWS_FEED_AUTO_FETCH_INTERVAL_MS);

    expect(request).toHaveBeenCalledTimes(2);
    expect(storage.values.get(NEWS_FEED_STORAGE_KEYS.lastFetched)).toBe(
      String(currentTime),
    );

    newsFeed.destroy();
  });

  it('requests the feed with the cloud UI source', async () => {
    const request = vi.fn().mockResolvedValue(response());
    const newsFeed = createNewsFeedStore({
      clusterId: '75d9c0b6-577f-42d4-a049-9f6e47e97c46',
      request,
      source: 'cloud-ui',
      storage: createStorage(),
    });

    await newsFeed.refresh();

    const url = new URL(request.mock.calls[0][0]);
    expect(url.searchParams.get('source')).toBe('cloud-ui');

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
      source: 'web-ui',
      storage,
    });

    newsFeed.markSeen();

    expect(setItem).not.toHaveBeenCalled();
  });
});
