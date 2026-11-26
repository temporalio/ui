import { describe, expect, it } from 'vitest';

import type { NewsFeedCache, NewsFeedItem } from '$lib/types/news-feed';

import {
  buildNewsFeedUrl,
  getDisplayableNewsFeedItems,
  getNewsFeedClientId,
  NEWS_FEED_STORAGE_KEYS,
  NEWS_FEED_URL,
  type NewsFeedStorage,
  parseNewsFeedResponse,
  readNewsFeedCache,
  shouldFetchNewsFeed,
} from './news-feed';

const createStorage = (entries: Record<string, string> = {}) => {
  const values = new Map(Object.entries(entries));

  return {
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    values,
  } satisfies NewsFeedStorage & { values: Map<string, string> };
};

const item = (overrides: Partial<NewsFeedItem> = {}): NewsFeedItem => ({
  id: 1,
  title: 'Temporal releases Rust SDK',
  content: '[Temporal](https://temporal.io) announced...',
  priority: 3,
  tags: ['sdk'],
  published_at: '2026-05-21T08:31:26Z',
  expires_at: '2026-07-20T08:31:26Z',
  ...overrides,
});

describe('news feed utilities', () => {
  it('builds the feed request URL with analytics query parameters', () => {
    const url = new URL(
      buildNewsFeedUrl({
        clientId: 'd104aa3a-da5f-4a19-948c-7c6144f962d3',
        clusterId: '75d9c0b6-577f-42d4-a049-9f6e47e97c46',
        source: 'web-ui',
      }),
    );

    expect(url.origin + url.pathname).toBe(NEWS_FEED_URL);
    expect(url.searchParams.get('client')).toBe(
      'd104aa3a-da5f-4a19-948c-7c6144f962d3',
    );
    expect(url.searchParams.get('cluster')).toBe(
      '75d9c0b6-577f-42d4-a049-9f6e47e97c46',
    );
    expect(url.searchParams.get('source')).toBe('web-ui');
  });

  it('builds the feed request URL with the cloud UI source', () => {
    const url = new URL(
      buildNewsFeedUrl({
        clientId: 'd104aa3a-da5f-4a19-948c-7c6144f962d3',
        clusterId: '75d9c0b6-577f-42d4-a049-9f6e47e97c46',
        source: 'cloud-ui',
      }),
    );

    expect(url.searchParams.get('source')).toBe('cloud-ui');
  });

  it('persists a generated client ID when none exists', () => {
    const storage = createStorage();
    const clientId = getNewsFeedClientId({
      generateUuid: () => 'd104aa3a-da5f-4a19-948c-7c6144f962d3',
      storage,
    });

    expect(clientId).toBe('d104aa3a-da5f-4a19-948c-7c6144f962d3');
    expect(storage.values.get(NEWS_FEED_STORAGE_KEYS.clientId)).toBe(clientId);
  });

  it('reuses a valid stored client ID', () => {
    const storage = createStorage({
      [NEWS_FEED_STORAGE_KEYS.clientId]: 'd104aa3a-da5f-4a19-948c-7c6144f962d3',
    });
    const clientId = getNewsFeedClientId({
      generateUuid: () => '9eeb4c21-1008-4fac-8de4-8c2c3c3296ba',
      storage,
    });

    expect(clientId).toBe('d104aa3a-da5f-4a19-948c-7c6144f962d3');
  });

  it('filters expired items and sorts by priority then newest publish time', () => {
    const items = getDisplayableNewsFeedItems(
      [
        item({
          id: 1,
          priority: 3,
          published_at: '2026-05-21T08:31:26Z',
        }),
        item({
          id: 2,
          priority: 2,
          published_at: '2026-05-26T12:17:39Z',
        }),
        item({
          id: 3,
          priority: 3,
          published_at: '2026-06-02T15:47:19Z',
        }),
        item({
          id: 4,
          expires_at: '2026-06-01T00:00:00Z',
        }),
      ],
      Date.parse('2026-06-02T23:15:53Z'),
    );

    expect(items.map(({ id }) => id)).toEqual([2, 3, 1]);
  });

  it('detects when the automatic fetch interval has elapsed', () => {
    const now = Date.parse('2026-06-02T23:15:53Z');

    expect(shouldFetchNewsFeed(null, now)).toBe(true);
    expect(shouldFetchNewsFeed(now - 23 * 60 * 60 * 1000, now)).toBe(false);
    expect(shouldFetchNewsFeed(now - 24 * 60 * 60 * 1000, now)).toBe(true);
  });

  it('ignores malformed cached data', () => {
    const storage = createStorage({
      [NEWS_FEED_STORAGE_KEYS.cache]: '{ malformed',
    });

    expect(readNewsFeedCache(storage)).toBeNull();
  });

  it('reads valid cached data', () => {
    const cache: NewsFeedCache = {
      fetchedAt: Date.parse('2026-06-02T23:15:53Z'),
      items: [item()],
      serverTime: '2026-06-02T23:15:53Z',
    };
    const storage = createStorage({
      [NEWS_FEED_STORAGE_KEYS.cache]: JSON.stringify(cache),
    });

    expect(readNewsFeedCache(storage)).toEqual(cache);
  });

  it('rejects invalid feed responses', () => {
    expect(() =>
      parseNewsFeedResponse({
        server_time: 'not-a-date',
        items: [],
      }),
    ).toThrow('Invalid news feed response');
  });
});
