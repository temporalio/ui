import { BROWSER } from 'esm-env';

import type {
  NewsFeedCache,
  NewsFeedItem,
  NewsFeedResponse,
  NewsFeedSource,
} from '$lib/types/news-feed';

// export const NEWS_FEED_URL = 'https://newsfeed.temporal.io/feed_en.json';
export const NEWS_FEED_URL = 'https://newsfeed.tomwheeler.com/feed_en.json';
export const NEWS_FEED_AUTO_FETCH_INTERVAL_MS = 24 * 60 * 60 * 1000;

export const NEWS_FEED_STORAGE_KEYS = {
  autoFetch: 'temporal-news-auto-fetch',
  cache: 'temporal-news-cache',
  clientId: 'newsfeed-client-uuid',
  lastFetched: 'temporal-news-last-fetched',
  lastSeenServerTime: 'temporal-news-last-seen-server-time',
} as const;

export type NewsFeedStorage = {
  getItem: (key: string) => string | null;
  removeItem: (key: string) => void;
  setItem: (key: string, value: string) => void;
};

const inMemoryStorage = new Map<string, string>();

export const newsFeedStorage: NewsFeedStorage = {
  getItem: (key: string) => {
    if (BROWSER) {
      try {
        const value = window.localStorage.getItem(key);
        if (value !== null) return value;
      } catch {
        // Fall through to in-memory storage.
      }
    }

    return inMemoryStorage.get(key) ?? null;
  },
  removeItem: (key: string) => {
    if (BROWSER) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Keep in-memory fallback cleanup below.
      }
    }

    inMemoryStorage.delete(key);
  },
  setItem: (key: string, value: string) => {
    if (BROWSER) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        // Fall through to in-memory storage.
      }
    }

    inMemoryStorage.set(key, value);
  },
};

export const isUuid = (value: string | null | undefined): value is string =>
  !!value &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

const fallbackUuid = () =>
  '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (character) => {
    const randomValue =
      globalThis.crypto?.getRandomValues?.(new Uint8Array(1))[0] ??
      Math.floor(Math.random() * 256);
    return (
      Number(character) ^
      (randomValue & (15 >> (Number(character) / 4)))
    ).toString(16);
  });

export const generateNewsFeedClientId = () =>
  globalThis.crypto?.randomUUID?.() ?? fallbackUuid();

export const getNewsFeedClientId = ({
  generateUuid = generateNewsFeedClientId,
  storage = newsFeedStorage,
}: {
  generateUuid?: () => string;
  storage?: NewsFeedStorage;
} = {}) => {
  const storedValue = storage.getItem(NEWS_FEED_STORAGE_KEYS.clientId);

  if (isUuid(storedValue)) return storedValue;

  const clientId = generateUuid();
  storage.setItem(NEWS_FEED_STORAGE_KEYS.clientId, clientId);
  return clientId;
};

export const getAutoFetchEnabled = (
  storage: NewsFeedStorage = newsFeedStorage,
) => storage.getItem(NEWS_FEED_STORAGE_KEYS.autoFetch) !== 'false';

export const setAutoFetchEnabled = (
  value: boolean,
  storage: NewsFeedStorage = newsFeedStorage,
) => storage.setItem(NEWS_FEED_STORAGE_KEYS.autoFetch, String(value));

export const getLastFetched = (storage: NewsFeedStorage = newsFeedStorage) => {
  const value = storage.getItem(NEWS_FEED_STORAGE_KEYS.lastFetched);
  if (!value) return null;

  const timestamp = Number(value);
  return Number.isFinite(timestamp) ? timestamp : null;
};

export const setLastFetched = (
  fetchedAt: number,
  storage: NewsFeedStorage = newsFeedStorage,
) => storage.setItem(NEWS_FEED_STORAGE_KEYS.lastFetched, String(fetchedAt));

export const getLastSeenServerTime = (
  storage: NewsFeedStorage = newsFeedStorage,
) => storage.getItem(NEWS_FEED_STORAGE_KEYS.lastSeenServerTime) ?? '';

export const setLastSeenServerTime = (
  serverTime: string,
  storage: NewsFeedStorage = newsFeedStorage,
) => storage.setItem(NEWS_FEED_STORAGE_KEYS.lastSeenServerTime, serverTime);

const isValidIsoDate = (value: string) => Number.isFinite(Date.parse(value));

const isRecord = (value: unknown): value is Record<PropertyKey, unknown> =>
  typeof value === 'object' && value !== null;

const isNewsFeedItem = (value: unknown): value is NewsFeedItem => {
  if (!isRecord(value)) return false;

  const { id, title, content, priority, tags, published_at, expires_at } =
    value;

  const hasValidId = typeof id === 'number' && Number.isInteger(id) && id >= 0;
  const hasValidPriority =
    typeof priority === 'number' &&
    Number.isInteger(priority) &&
    priority >= 1 &&
    priority <= 9;

  return (
    hasValidId &&
    typeof title === 'string' &&
    typeof content === 'string' &&
    hasValidPriority &&
    Array.isArray(tags) &&
    tags.every((tag) => typeof tag === 'string') &&
    typeof published_at === 'string' &&
    isValidIsoDate(published_at) &&
    typeof expires_at === 'string' &&
    isValidIsoDate(expires_at)
  );
};

export const parseNewsFeedResponse = (value: unknown): NewsFeedResponse => {
  if (!isRecord(value)) {
    throw new Error('Invalid news feed response');
  }

  const { server_time, items } = value;

  if (
    typeof server_time !== 'string' ||
    !isValidIsoDate(server_time) ||
    !Array.isArray(items) ||
    !items.every(isNewsFeedItem)
  ) {
    throw new Error('Invalid news feed response');
  }

  return { items, server_time };
};

export const readNewsFeedCache = (
  storage: NewsFeedStorage = newsFeedStorage,
): NewsFeedCache | null => {
  const value = storage.getItem(NEWS_FEED_STORAGE_KEYS.cache);
  if (!value) return null;

  try {
    const cache = JSON.parse(value) as unknown;

    if (!isRecord(cache)) return null;

    const { fetchedAt, serverTime, items } = cache;

    if (
      typeof fetchedAt === 'number' &&
      Number.isFinite(fetchedAt) &&
      typeof serverTime === 'string' &&
      isValidIsoDate(serverTime) &&
      Array.isArray(items) &&
      items.every(isNewsFeedItem)
    ) {
      return { fetchedAt, items, serverTime };
    }
  } catch {
    // Ignore malformed cached data.
  }

  return null;
};

export const writeNewsFeedCache = (
  cache: NewsFeedCache,
  storage: NewsFeedStorage = newsFeedStorage,
) => storage.setItem(NEWS_FEED_STORAGE_KEYS.cache, JSON.stringify(cache));

export const getDisplayableNewsFeedItems = (
  items: NewsFeedItem[],
  now = Date.now(),
) => {
  return items
    .filter((item) => Date.parse(item.expires_at) > now)
    .sort((a, b) => {
      const priorityDifference = a.priority - b.priority;
      if (priorityDifference !== 0) return priorityDifference;

      return Date.parse(b.published_at) - Date.parse(a.published_at);
    });
};

export const hasUnreadNewsFeedItems = (
  serverTime: string,
  lastSeenServerTime: string,
) => !!serverTime && serverTime !== lastSeenServerTime;

export const shouldFetchNewsFeed = (
  lastFetched: number | null,
  now = Date.now(),
) =>
  !lastFetched ||
  now - lastFetched >= NEWS_FEED_AUTO_FETCH_INTERVAL_MS ||
  lastFetched > now;

export const buildNewsFeedUrl = ({
  clientId,
  clusterId,
  source,
  url = NEWS_FEED_URL,
}: {
  clientId: string;
  clusterId: string;
  source: NewsFeedSource;
  url?: string;
}) => {
  const feedUrl = new URL(url);
  feedUrl.searchParams.set('client', clientId);
  feedUrl.searchParams.set('cluster', clusterId);
  feedUrl.searchParams.set('source', source);

  return feedUrl.toString();
};
