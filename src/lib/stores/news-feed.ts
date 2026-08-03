import { get, writable } from 'svelte/store';

import { BROWSER } from 'esm-env';

import { fetchNewsFeed } from '$lib/services/news-feed-service';
import type { NewsFeedSource, NewsFeedState } from '$lib/types/news-feed';
import {
  getAutoFetchEnabled,
  getDisplayableNewsFeedItems,
  getLastFetched,
  getLastSeenServerTime,
  hasUnreadNewsFeedItems,
  NEWS_FEED_AUTO_FETCH_INTERVAL_MS,
  type NewsFeedStorage,
  newsFeedStorage,
  readNewsFeedCache,
  setAutoFetchEnabled,
  setLastFetched,
  setLastSeenServerTime,
  shouldFetchNewsFeed,
  writeNewsFeedCache,
} from '$lib/utilities/news-feed';

type CreateNewsFeedStoreOptions = {
  clusterId: string;
  source: NewsFeedSource;
  request?: typeof fetch;
  now?: () => number;
  storage?: NewsFeedStorage;
};

type RefreshNewsFeedOptions = {
  cache?: RequestCache;
};

type ScheduleNextFetchOptions = {
  afterFailedAttempt?: boolean;
};

const createInitialState = (
  storage: NewsFeedStorage,
  now: () => number,
): NewsFeedState => {
  const cache = readNewsFeedCache(storage);
  const lastSeenServerTime = getLastSeenServerTime(storage);

  return {
    autoFetchEnabled: getAutoFetchEnabled(storage),
    error: '',
    fetchedAt: cache?.fetchedAt ?? null,
    hasUnread: cache
      ? hasUnreadNewsFeedItems(cache.serverTime, lastSeenServerTime)
      : false,
    isLoading: false,
    items: cache ? getDisplayableNewsFeedItems(cache.items, now()) : [],
    lastSeenServerTime,
    serverTime: cache?.serverTime ?? '',
  };
};

export const createNewsFeedStore = ({
  clusterId,
  source,
  now = Date.now,
  request = fetch,
  storage = newsFeedStorage,
}: CreateNewsFeedStoreOptions) => {
  const { subscribe, set, update } = writable<NewsFeedState>(
    createInitialState(storage, now),
  );
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let initialized = false;

  const clearTimer = () => {
    if (timeout) clearTimeout(timeout);
    timeout = null;
  };

  const refresh = async ({ cache }: RefreshNewsFeedOptions = {}) => {
    if (!BROWSER || !clusterId) return;

    let failed = false;
    update((state) => ({ ...state, error: '', isLoading: true }));

    try {
      const feedCache = await fetchNewsFeed({
        cache,
        clusterId,
        source,
        now,
        request,
        storage,
      });
      writeNewsFeedCache(feedCache, storage);
      setLastFetched(feedCache.fetchedAt, storage);

      const lastSeenServerTime = getLastSeenServerTime(storage);
      update((state) => ({
        ...state,
        error: '',
        fetchedAt: feedCache.fetchedAt,
        hasUnread: hasUnreadNewsFeedItems(
          feedCache.serverTime,
          lastSeenServerTime,
        ),
        isLoading: false,
        items: getDisplayableNewsFeedItems(feedCache.items, now()),
        lastSeenServerTime,
        serverTime: feedCache.serverTime,
      }));
    } catch (error) {
      failed = true;
      update((state) => ({
        ...state,
        error: error instanceof Error ? error.message : 'Unable to load news',
        isLoading: false,
      }));
    } finally {
      scheduleNextFetch({ afterFailedAttempt: failed });
    }
  };

  function scheduleNextFetch({
    afterFailedAttempt = false,
  }: ScheduleNextFetchOptions = {}) {
    clearTimer();

    if (!BROWSER || !clusterId || !get({ subscribe }).autoFetchEnabled) return;

    const lastFetched = getLastFetched(storage);
    const nextFetchAt = afterFailedAttempt
      ? now() + NEWS_FEED_AUTO_FETCH_INTERVAL_MS
      : lastFetched
        ? lastFetched + NEWS_FEED_AUTO_FETCH_INTERVAL_MS
        : now();
    const delay = Math.max(0, nextFetchAt - now());

    timeout = setTimeout(() => {
      void refresh();
    }, delay);
  }

  const initialize = () => {
    if (initialized || !BROWSER || !clusterId) return;
    initialized = true;

    if (
      get({ subscribe }).autoFetchEnabled &&
      shouldFetchNewsFeed(getLastFetched(storage), now())
    ) {
      void refresh();
      return;
    }

    scheduleNextFetch();
  };

  return {
    subscribe,
    destroy: clearTimer,
    initialize,
    markSeen: () => {
      const state = get({ subscribe });
      if (!state.serverTime) return;
      if (
        state.lastSeenServerTime === state.serverTime &&
        state.hasUnread === false
      ) {
        return;
      }

      setLastSeenServerTime(state.serverTime, storage);
      update((currentState) => ({
        ...currentState,
        hasUnread: false,
        lastSeenServerTime: state.serverTime,
      }));
    },
    refresh,
    setAutoFetchEnabled: (enabled: boolean) => {
      setAutoFetchEnabled(enabled, storage);
      update((state) => ({ ...state, autoFetchEnabled: enabled }));

      if (enabled) {
        scheduleNextFetch();
      } else {
        clearTimer();
      }
    },
    reset: () => set(createInitialState(storage, now)),
  };
};
