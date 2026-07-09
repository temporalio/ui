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
  const response = () => ({
    ok: true,
    json: () => Promise.resolve(MOCK_NEWS_FEED_RESPONSE),
  });

  it('returns the requested feed', async () => {
    const request = vi.fn().mockResolvedValue(response());

    const cache = await fetchNewsFeed({
      clusterId: '75d9c0b6-577f-42d4-a049-9f6e47e97c46',
      now: () => 1780442153000,
      request,
      source: 'web-ui',
      storage: createStorage(),
    });

    expect(request).toHaveBeenCalledWith(
      'https://newsfeed.temporal.io/feed_en.json?client=d104aa3a-da5f-4a19-948c-7c6144f962d3&cluster=75d9c0b6-577f-42d4-a049-9f6e47e97c46&source=web-ui',
      { credentials: 'omit' },
    );
    expect(cache).toEqual({
      fetchedAt: 1780442153000,
      items: MOCK_NEWS_FEED_RESPONSE.items,
      serverTime: MOCK_NEWS_FEED_RESPONSE.server_time,
    });
  });

  it('passes cache reload through to the request', async () => {
    const request = vi.fn().mockResolvedValue(response());

    const cache = await fetchNewsFeed({
      cache: 'reload',
      clusterId: '75d9c0b6-577f-42d4-a049-9f6e47e97c46',
      now: () => 1780442153000,
      request,
      source: 'web-ui',
      storage: createStorage(),
    });

    expect(request).toHaveBeenCalledWith(
      'https://newsfeed.temporal.io/feed_en.json?client=d104aa3a-da5f-4a19-948c-7c6144f962d3&cluster=75d9c0b6-577f-42d4-a049-9f6e47e97c46&source=web-ui',
      { cache: 'reload', credentials: 'omit' },
    );
    expect(cache).toEqual({
      fetchedAt: 1780442153000,
      items: MOCK_NEWS_FEED_RESPONSE.items,
      serverTime: MOCK_NEWS_FEED_RESPONSE.server_time,
    });
  });
});
