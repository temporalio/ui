import { describe, expect, it, vi } from 'vitest';

import {
  NEWS_FEED_STORAGE_KEYS,
  type NewsFeedStorage,
} from '$lib/utilities/news-feed';

import { fetchNewsFeed, MOCK_NEWS_FEED_RESPONSE } from './news-feed-service';

const createStorage = () => {
  const values = new Map<string, string>([
    [NEWS_FEED_STORAGE_KEYS.clientId, 'd104aa3a-da5f-4a19-948c-7c6144f962d3'],
  ]);

  return {
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  } satisfies NewsFeedStorage;
};

describe('fetchNewsFeed', () => {
  it('returns the mock feed without requesting the live feed', async () => {
    const request = vi.fn();

    const cache = await fetchNewsFeed({
      clusterId: '75d9c0b6-577f-42d4-a049-9f6e47e97c46',
      now: () => 1780442153000,
      request,
      storage: createStorage(),
    });

    expect(request).not.toHaveBeenCalled();
    expect(cache).toEqual({
      fetchedAt: 1780442153000,
      items: MOCK_NEWS_FEED_RESPONSE.items,
      serverTime: MOCK_NEWS_FEED_RESPONSE.server_time,
    });
  });

  it('does not request the live feed when cache reload is requested', async () => {
    const request = vi.fn();

    await fetchNewsFeed({
      cache: 'reload',
      clusterId: '75d9c0b6-577f-42d4-a049-9f6e47e97c46',
      request,
      storage: createStorage(),
    });

    expect(request).not.toHaveBeenCalled();
  });
});
